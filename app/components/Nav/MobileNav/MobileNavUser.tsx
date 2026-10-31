"use client";

import { User2Icon, LogOut, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

interface Props {
  lang: "ar" | "en";
  onUserClick: () => void;
  onClose: () => void;
}

const MobileNavUser = ({ lang, onUserClick, onClose }: Props) => {
  const { data: session, status } = useSession();

  const getRoleText = (role: string) => {
    switch (role) {
      case "SUPERADMIN":
        return lang === "ar" ? "سوبر أدمن" : "Super Admin";
      case "ADMIN":
        return lang === "ar" ? "أدمن" : "Admin";
      default:
        return lang === "ar" ? "مستخدم" : "User";
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
    onClose();
  };

  return (
    <section
      className="px-5 pb-4 pt-6"
      aria-label={lang === "ar" ? "حساب المستخدم" : "User account"}
    >
      {status === "authenticated" ? (
        <div className="space-y-4">
          {/* User Card */}
          <div className="flex items-center gap-3 p-4 bg-white/10 rounded-xl backdrop-blur-sm">
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || "User"}
                width={44}
                height={44}
                className="rounded-full border border-white/20"
              />
            ) : (
              <div
                className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center"
                aria-hidden="true"
              >
                <User2Icon className="w-6 h-6 text-white" />
              </div>
            )}

            <div
              className="flex-1"
              style={{
                textAlign: lang === "ar" ? "right" : "left",
              }}
            >
              <p className="font-medium text-white">
                {session?.user?.name}
              </p>
              <p className="text-sm text-white/70">
                {session?.user?.email}
              </p>

              {session?.user?.role && (
                <span className="inline-block mt-1 px-2 py-1 rounded-full text-xs text-white/90 font-gess bg-white/10">
                  {getRoleText(session.user.role)}
                </span>
              )}
            </div>
          </div>

          {/* Admin Link */}
          {(session?.user?.role === "ADMIN" ||
            session?.user?.role === "SUPERADMIN") && (
            <Link
              href="/dashboard"
              onClick={onClose}
              className="w-full py-3 px-4 text-white hover:bg-white/10 rounded-lg flex items-center gap-3 transition"
              style={{
                flexDirection:
                  lang === "ar" ? "row" : "row-reverse",
              }}
            >
              <Settings className="w-5 h-5" aria-hidden="true" />
              <span
                className="flex-1"
                style={{
                  textAlign: lang === "ar" ? "right" : "left",
                }}
              >
                {lang === "ar" ? "لوحة التحكم" : "Dashboard"}
              </span>
            </Link>
          )}

          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="w-full py-3 px-4 text-white hover:bg-red-500/20 rounded-lg flex items-center gap-3 transition border border-transparent hover:border-red-400/30"
            style={{
              flexDirection:
                lang === "ar" ? "row" : "row-reverse",
            }}
            aria-label={lang === "ar" ? "تسجيل الخروج" : "Sign out"}
          >
            <LogOut className="w-5 h-5" aria-hidden="true" />
            <span
              className="flex-1"
              style={{
                textAlign: lang === "ar" ? "right" : "left",
              }}
            >
              {lang === "ar" ? "تسجيل الخروج" : "Sign Out"}
            </span>
          </button>
        </div>
      ) : (
        <button
          onClick={onUserClick}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-primary-foreground/30 px-4 font-gess text-lg text-primary-foreground transition-colors hover:border-gold hover:text-gold focus-visible:outline-[#fff7ee]"
          aria-label={lang === "ar" ? "تسجيل الدخول" : "Sign in"}
        >
          <User2Icon className="h-5 w-5" aria-hidden="true" />
          {lang === "ar" ? "تسجيل الدخول" : "Sign In"}
        </button>
      )}
    </section>
  );
};

export default MobileNavUser;
