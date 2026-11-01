// Creates (or resets) an admin who signs in with e-mail + password + authenticator-app code.
//
//   node --env-file=.env.local scripts/create-admin.mjs            (ADMIN)
//   node --env-file=.env.local scripts/create-admin.mjs --super    (SUPERADMIN)
//
// It asks for the e-mail and the password (typing is hidden), shows a QR code to scan with
// Microsoft Authenticator, and saves nothing until you type a valid 6-digit code from the app.
// The password is never written to a file, a log or the repository.
import readline from "node:readline";
import bcrypt from "bcryptjs";
import QRCode from "qrcode";
import { authenticator } from "otplib";
import { PrismaClient } from "@prisma/client";
import { seal } from "../lib/secret-box.mjs";

const ask = (q) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(q, (a) => {
      rl.close();
      resolve(a.trim());
    });
  });

// like ask(), but nothing is echoed while typing
function askHidden(q) {
  return new Promise((resolve) => {
    process.stdout.write(q);
    const stdin = process.stdin;
    let value = "";
    stdin.setRawMode?.(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    const onData = (ch) => {
      for (const c of ch) {
        if (c === "\r" || c === "\n" || c === "\u0004") {
          stdin.setRawMode?.(false);
          stdin.pause();
          stdin.off("data", onData);
          process.stdout.write("\n");
          return resolve(value);
        }
        if (c === "\u0003") process.exit(1);
        if (c === "\u007f") value = value.slice(0, -1);
        else value += c;
      }
    };
    stdin.on("data", onData);
  });
}

const db = new PrismaClient();
try {
  if (!process.env.DATABASE_URL || !process.env.NEXTAUTH_SECRET) {
    throw new Error("DATABASE_URL and NEXTAUTH_SECRET must be set (use --env-file=.env.local).");
  }
  const role = process.argv.includes("--super") ? "SUPERADMIN" : "ADMIN";

  const email = (await ask("Admin e-mail: ")).toLowerCase();
  if (!/^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/.test(email)) throw new Error("That is not a valid e-mail address.");

  const password = await askHidden("Password (at least 12 characters): ");
  const again = await askHidden("Type it again: ");
  if (password !== again) throw new Error("The two passwords are different.");
  if (password.length < 12) throw new Error("The password must be at least 12 characters.");
  if (/flora|password|123456/i.test(password)) throw new Error("Do not use the shop name or an obvious word in the password.");

  const secret = authenticator.generateSecret();
  const uri = authenticator.keyuri(email, "Flora", secret);
  console.log("\nScan this with Microsoft Authenticator (Add account > Other account):\n");
  console.log(await QRCode.toString(uri, { type: "terminal", small: true }));
  console.log("Cannot scan? Add it by hand with this key:", secret, "\n");

  const code = (await ask("Type the 6-digit code now shown in the app: ")).replace(/\s/g, "");
  authenticator.options = { window: 1 };
  if (!authenticator.check(code, secret)) throw new Error("That code is wrong. Nothing was saved. Run the script again.");

  const passwordHash = await bcrypt.hash(password, 12);
  const data = { passwordHash, totpSecret: seal(secret), totpEnabled: true };
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    await db.user.update({ where: { email }, data: { ...data, role: existing.role === "SUPERADMIN" ? "SUPERADMIN" : role } });
    console.log(`\nDone. ${email} was updated (role: ${existing.role === "SUPERADMIN" ? "SUPERADMIN" : role}).`);
  } else {
    await db.user.create({ data: { email, name: email.split("@")[0], role, ...data } });
    console.log(`\nDone. ${email} was created (role: ${role}).`);
  }
  console.log("From now on this account signs in at /ar/admin-login and can no longer use Google.");
} catch (e) {
  console.error("\n" + (e instanceof Error ? e.message : e));
  process.exitCode = 1;
} finally {
  await db.$disconnect();
}
