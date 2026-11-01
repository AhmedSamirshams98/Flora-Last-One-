"use client";

/* The admin door: e-mail, password, then the 6-digit code from the authenticator app.
   It is not linked from the shop; its address is /ar/admin-login (or /en/admin-login). */

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import logo from "@/public/images/logo.png";
import "./HomeComponents/home.css";

const TEXT = {
  ar: {
    title: "دخول المديرين",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    code: "رمز التحقق (6 أرقام من تطبيق Microsoft Authenticator)",
    submit: "دخول",
    wait: "جارٍ التحقق...",
    wrong: "بيانات الدخول أو الرمز غير صحيحة. بعد 5 محاولات خاطئة يُمنع الدخول 15 دقيقة.",
  },
  en: {
    title: "Admin sign-in",
    email: "Email",
    password: "Password",
    code: "6-digit code from Microsoft Authenticator",
    submit: "Sign in",
    wait: "Checking...",
    wrong: "The details or the code are wrong. After 5 wrong tries sign-in is blocked for 15 minutes.",
  },
} as const;

export default function AdminLogin({ lang }: { lang: "ar" | "en" }) {
  const t = TEXT[lang];
  const isAr = lang === "ar";
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(false);
    const f = new FormData(e.currentTarget);
    const res = await signIn("admin-credentials", {
      redirect: false,
      email: String(f.get("email") ?? ""),
      password: String(f.get("password") ?? ""),
      code: String(f.get("code") ?? ""),
    });
    if (res?.ok) {
      router.push(`/${lang}/dashboard`);
      router.refresh();
    } else {
      setError(true);
      setBusy(false);
    }
  };

  const field =
    "mt-2 block h-12 w-full rounded-full border border-primary/25 bg-white px-5 text-primary outline-none transition-colors focus:border-primary";
  const label = `block text-sm text-primary/70 ${isAr ? "font-gess" : ""}`;

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16" dir={isAr ? "rtl" : "ltr"}>
      <form onSubmit={submit} className="w-full max-w-sm" noValidate>
        <Image src={logo} alt="Flora" className="mx-auto h-10 w-auto" priority />
        <h1 lang={lang} className="fl-display mt-6 text-center text-3xl text-primary">
          {t.title}
        </h1>

        <label className={`${label} mt-8`}>
          {t.email}
          <input name="email" type="email" required autoComplete="username" dir="ltr" className={field} />
        </label>
        <label className={`${label} mt-5`}>
          {t.password}
          <input name="password" type="password" required autoComplete="current-password" dir="ltr" className={field} />
        </label>
        <label className={`${label} mt-5`}>
          {t.code}
          <input
            name="code"
            inputMode="numeric"
            pattern="[0-9 ]*"
            maxLength={7}
            required
            autoComplete="one-time-code"
            dir="ltr"
            className={`${field} text-center text-xl tracking-[0.4em]`}
          />
        </label>

        {error && (
          <p role="alert" className={`mt-5 text-sm text-red-700 ${isAr ? "font-gess" : ""}`}>
            {t.wrong}
          </p>
        )}

        <button type="submit" disabled={busy} className={`fl-cta mt-7 w-full ${isAr ? "font-gess" : ""}`}>
          {busy ? t.wait : t.submit}
        </button>
      </form>
    </div>
  );
}
