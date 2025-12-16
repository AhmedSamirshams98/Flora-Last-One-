// ==========================
// ROUTES (لا يوجد أي نص لغوي)
// ==========================
export const ROUTES = {
  HOME: "/",
  PRODUCTS: "/products",
  CART: "/cart",
  OFFERS: "/offers",
  ORDERS: "/orders",
  DASHBOARD: {
    ROOT: "/dashboard",
    PRODUCTS: "/dashboard/products",
    ORDERS: "/dashboard/orders",
    OFFERS: "/dashboard/offers",
    ANALYTICS: "/dashboard/analytics",
  },
  AUTH: {
    SIGN_IN: "/auth/signin",
    SIGN_UP: "/auth/signup",
  },
} as const;

// ==========================
// NAV LINKS (بالـ labelKey فقط)
// ==========================
export const NAV_LINKS = [
  {
    href: ROUTES.HOME,
    labelKey: "nav.home",
  },
  {
    href: `${ROUTES.HOME}#about`,
    labelKey: "nav.about",
    isAnchor: true,
  },
  {
    href: ROUTES.PRODUCTS,
    labelKey: "nav.products",
  },
  {
    href: ROUTES.ORDERS,
    labelKey: "nav.orders",
  },
  // {
  //   href: ROUTES.OFFERS,
  //   labelKey: "nav.offers",
  //   isAnchor: true,
  // },
] as const;

// ==========================
// DASHBOARD LINKS
// ==========================
export const DASHBOARD_LINKS = [
  {
    href: ROUTES.DASHBOARD.PRODUCTS,
    labelKey: "dashboard.products",
    icon: "Package",
  },
  {
    href: ROUTES.DASHBOARD.ORDERS,
    labelKey: "dashboard.orders",
    icon: "ShoppingCart",
  },
  {
    href: ROUTES.DASHBOARD.OFFERS,
    labelKey: "dashboard.offers",
    icon: "OFFERS",
  },
  {
    href: ROUTES.DASHBOARD.ANALYTICS,
    labelKey: "dashboard.analytics",
    icon: "ANALYTICS",
  },
] as const;

// ==========================
// SEARCH CONFIG
// ==========================
export const SEARCH_CONFIG = {
  placeholderKey: "search.placeholder",
  DEBOUNCE_DELAY: 300,
} as const;
