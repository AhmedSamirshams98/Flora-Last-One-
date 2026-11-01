import bcrypt from "bcryptjs";
import { authenticator } from "otplib";
import { prisma } from "@/lib/prisma";
import { open } from "@/lib/secret-box.mjs";

/* Admin sign-in: e-mail + password + the 6-digit code from the authenticator app
   (Microsoft Authenticator, Google Authenticator, ...). Every failure looks the same from
   outside, so nobody can tell which part was wrong. */

authenticator.options = { window: 1 }; // accept the previous and next 30 s too (clock drift)

const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;
const DUMMY_HASH = bcrypt.hashSync("this-is-not-a-real-password", 12);

type Memory = {
  fails: Map<string, { count: number; until: number }>;
  usedCodes: Map<string, number>;
};
const g = globalThis as unknown as { __flora_admin?: Memory };
const mem = (g.__flora_admin ??= { fails: new Map(), usedCodes: new Map() });
// (this memory lives per process: with several pm2 instances each one counts for itself)

export type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: "ADMIN" | "SUPERADMIN";
};

export async function verifyAdminLogin(
  rawEmail: string,
  password: string,
  rawCode: string
): Promise<AdminUser | null> {
  const email = rawEmail.trim().toLowerCase();
  const now = Date.now();

  const lock = mem.fails.get(email);
  if (lock && lock.until > now) return null;

  const user = await prisma.user.findUnique({ where: { email } });
  const eligible =
    !!user &&
    (user.role === "ADMIN" || user.role === "SUPERADMIN") &&
    !!user.passwordHash &&
    user.totpEnabled &&
    !!user.totpSecret;

  // always run bcrypt, so a wrong e-mail takes as long as a wrong password
  const passwordOk = await bcrypt.compare(
    password,
    eligible ? user!.passwordHash! : DUMMY_HASH
  );

  let codeOk = false;
  if (eligible && passwordOk) {
    const code = rawCode.replace(/\s/g, "");
    if (/^\d{6}$/.test(code) && mem.usedCodes.get(`${user!.id}:${code}`) === undefined) {
      try {
        codeOk = authenticator.check(code, open(user!.totpSecret!));
      } catch {
        codeOk = false;
      }
      if (codeOk) mem.usedCodes.set(`${user!.id}:${code}`, now + 120_000); // a code works once
    }
  }

  // forget codes that can no longer be replayed
  for (const [k, until] of mem.usedCodes) if (until < now) mem.usedCodes.delete(k);

  if (!(eligible && passwordOk && codeOk)) {
    const count = (lock && lock.until > now - LOCK_MS ? lock.count : 0) + 1;
    mem.fails.set(email, { count, until: count >= MAX_FAILS ? now + LOCK_MS : 0 });
    return null;
  }

  mem.fails.delete(email);
  return {
    id: user!.id,
    email: user!.email,
    name: user!.name,
    image: user!.image,
    role: user!.role as "ADMIN" | "SUPERADMIN",
  };
}
