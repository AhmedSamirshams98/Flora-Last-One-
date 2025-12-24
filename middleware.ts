import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { languages, defaultLang } from "./i18n";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ========== 1) السماح للملفات الثابتة بدون لغة ==========
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // ========== 2) التعامل مع اللغات ==========

  const pathnameHasLang = languages.some((lang) =>
    pathname.startsWith(`/${lang}`)
  );

  if (!pathnameHasLang) {
    const languageFromCookie =
      request.cookies.get("lang")?.value || defaultLang;
    return NextResponse.redirect(
      new URL(`/${languageFromCookie}${pathname}`, request.url)
    );
  }

  // استخراج اللغة الحالية من الرابط
  const currentLang = pathname.split("/")[1];

  // ========== 3) حماية الـ dashboard ==========

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isDashboard = pathname.startsWith(`/${currentLang}/dashboard`);

  if (isDashboard) {
    if (!token || (token.role !== "ADMIN" && token.role !== "SUPERADMIN")) {
      // redirect إلى الصفحة الرئيسية حسب اللغة
      const url = new URL(`/${currentLang}`, request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|.*\\..*|api).*)", // تشغيل middleware على كل الصفحات
  ],
};
