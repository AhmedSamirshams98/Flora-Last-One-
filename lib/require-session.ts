import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/* Who is calling an API route? Checked on the server from the signed session cookie, never from
   anything the browser says about itself (a header or a field in the body can be made up).
   Use:  const gate = await requireAdmin();  if (gate.error) return gate.error;  gate.user.id ... */

export type SessionUser = { id: string; role: "USER" | "ADMIN" | "SUPERADMIN" };
type Gate = { user: SessionUser; error?: undefined } | { user?: undefined; error: NextResponse };

async function current(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  const u = session?.user;
  return u?.id ? { id: u.id, role: u.role } : null;
}

export async function requireUser(): Promise<Gate> {
  const user = await current();
  if (!user) return { error: NextResponse.json({ error: "يجب تسجيل الدخول" }, { status: 401 }) };
  return { user };
}

export async function requireAdmin(): Promise<Gate> {
  const gate = await requireUser();
  if (gate.error) return gate;
  if (gate.user.role !== "ADMIN" && gate.user.role !== "SUPERADMIN") {
    return { error: NextResponse.json({ error: "لا تملك صلاحية لهذا الإجراء" }, { status: 403 }) };
  }
  return gate;
}

export const isAdminRole = (role: string) => role === "ADMIN" || role === "SUPERADMIN";
