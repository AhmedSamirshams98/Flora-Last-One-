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

    if (
      document.getElementById(anchorId) ||
      currentPathname === homePath ||
      currentPathname === "/"
    ) {
      scrollToSection(anchorId);
      return;
    }

    router.push(homePath);

    setTimeout(() => {
      scrollToSection(anchorId);
    }, 350);
  } else if (link.type === "page") {
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

const scrollToSection = (anchorId: string) => {
  const element = document.getElementById(anchorId);

  if (!element) return;

  const navbarOffset = 90;
  const elementPosition = element.getBoundingClientRect().top;
  const offsetPosition = elementPosition + window.pageYOffset - navbarOffset;

  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth",
  });
};
