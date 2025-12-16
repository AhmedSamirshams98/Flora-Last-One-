// types/auth.ts

export interface User {
  id: string;
  role: "USER" | "ADMIN" | "SUPERADMIN";
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface Session {
  user: SessionUser;
  expires: string;
}

export interface JWT {
  id?: string;
  role?: "USER" | "ADMIN" | "SUPERADMIN";
  name?: string | null;
  email?: string | null;
  image?: string | null;
}
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: "USER" | "ADMIN" | "SUPERADMIN";
  createdAt: string;
}

export interface SessionUser {
  id: string;
  role: "USER" | "ADMIN" | "SUPERADMIN";
  name?: string;
  email?: string;
  image?: string;
}

