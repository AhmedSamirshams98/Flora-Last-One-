// utils/navigation.ts
import { useRouter } from "next/navigation";

/**
 * دالة للتعامل مع النقر على روابط التنقل
 */
export const handleNavLinkClick = (
  link: {
    href: string;
    type: "page" | "anchor";
    anchorId?: string;
  },
  currentPathname: string,
  lang: "ar" | "en",
  router: any
) => {
  // 1. إذا كان رابط أنكور (about أو contact)
  if (link.type === "anchor" && link.anchorId) {
    const anchorId = link.anchorId;

    // أ. إذا كنا في الصفحة الرئيسية
    if (currentPathname === "/" || currentPathname === "/ar") {
      // Scroll إلى القسم
      scrollToSection(anchorId);
    }
    // ب. إذا كنا في صفحة أخرى
    else {
      // انتقل إلى الصفحة الرئيسية أولاً
      if (lang === "ar") {
        router.push(`/ar#${anchorId}`);
      } else {
        router.push(`/#${anchorId}`);
      }
    }
  }

  // 2. إذا كان رابط صفحة عادية
  else if (link.type === "page") {
    // أ. إذا كنا في نفس الصفحة (الصفحة الرئيسية)
    if (
      link.href === "/" &&
      (currentPathname === "/" || currentPathname === "/ar")
    ) {
      // Scroll إلى الأعلى
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    // ب. إذا كنا في صفحة أخرى، انتقل إليها
    else {
      router.push(link.href);
    }
  }
};

/**
 * دالة للـ Scroll إلى قسم معين
 */
const scrollToSection = (anchorId: string) => {
  const element = document.getElementById(anchorId);
  if (element) {
    // حساب الـ offset لتعويض ارتفاع الـ navbar
    const offset = 100; // يمكنك تعديل هذا الرقم حسب ارتفاع navbar
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  } else {
    // استخدام hash إذا لم يتم العثور على العنصر
    window.location.hash = anchorId;
  }
};
