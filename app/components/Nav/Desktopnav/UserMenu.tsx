"use client";

import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { User2Icon, LogOut, Settings } from "lucide-react";
import { useState, useCallback } from "react";
import dynamic from "next/dynamic";

const AuthPopup = dynamic(() => import("../../AuthPopup"), { ssr: false });

const UserMenu = ({ lang }: { lang: "ar" | "en" }) => {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const toggle = useCallback(() => {
    status === "authenticated" ? setOpen(!open) : setShowAuth(true);
  }, [status, open]);

  return (
    <div className="relative hidden md:block">
      <div
        onClick={toggle}
        className="grid h-10 w-10 cursor-pointer place-items-center rounded-full transition-colors hover:bg-primary-foreground/10"
      >
        {session?.user?.image ? (
          <Image
            src={session.user.image}
            alt="User"
            width={36}
            height={36}
            className="rounded-full"
          />
        ) : (
          <User2Icon className="h-5 w-5 transition-colors hover:text-gold" />
        )}
      </div>

      {open && (
        <div className="absolute mt-2 w-48 bg-white rounded shadow">
          {(session?.user?.role === "ADMIN" ||
            session?.user?.role === "SUPERADMIN") && (
            <a
              href="/dashboard"
              className="flex gap-2 p-2 text-black font-gess"
            >
              <Settings />
              {lang === "ar" ? "لوحة التحكم" : "Dashboard"}
            </a>
          )}

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex gap-2 p-2 text-red-600"
          >
            <LogOut /> {lang === "ar" ? "تسجيل الخروج" : "Sign Out"}
          </button>
        </div>
      )}

      <AuthPopup
        lang={lang}
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
      />
    </div>
  );
};

export default UserMenu;
