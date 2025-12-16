import { getServerSession } from "next-auth/next";
import { User, Session as AppSession } from "@/types/auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getSession(): Promise<AppSession | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  return {
    user: {
      id: session.user.id || "",
      name: session.user.name || "مستخدم",
      email: session.user.email || "",
      role: session.user.role as "USER" | "ADMIN" | "SUPERADMIN",
    },
    expires: session.expires,
  };
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  return session?.user || null;
}

export async function hasRole(role: User["role"]): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === role;
}

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === "ADMIN" || user?.role === "SUPERADMIN";
}
