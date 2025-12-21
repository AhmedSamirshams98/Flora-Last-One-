/**
 * دالة للتعامل مع النقر على روابط التنقل (Page + Anchor)
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
  const homePath = lang === "ar" ? "/ar" : "/";

  if (link.type === "anchor" && link.anchorId) {
    const anchorId = link.anchorId;

    // ✅ إذا كنا بالفعل في الصفحة الرئيسية
    if (currentPathname === homePath || currentPathname === "/") {
      scrollToSection(anchorId);
      return;
    }

    // ✅ إذا كنا في صفحة أخرى
    router.push(homePath);

    // ⬅️ انتظر حتى يكتمل تحميل الصفحة دي الي كانت عامله مشكله انه مش بيروح لاول جزء في القسم زي مثلا about .

    setTimeout(() => {
      scrollToSection(anchorId);
    }, 350); // ⬅️ مهم جدًا
  }

  // ==============================
  // 2️⃣ روابط الصفحات العادية
  // ==============================
  else if (link.type === "page") {
    // إذا كنا في الصفحة الرئيسية وضغطنا Home
    if (
      link.href === "/" &&
      (currentPathname === "/" || currentPathname === "/ar")
    ) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    router.push(link.href);
  }
};

/**
 * Scroll ذكي إلى قسم معين مع تعويض ارتفاع الـ navbar
 */
const scrollToSection = (anchorId: string) => {
  const element = document.getElementById(anchorId);

  if (!element) return;

  const navbarOffset = 120; // عدّل حسب ارتفاع الـ Navbar
  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - navbarOffset;

  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth",
  });
};
