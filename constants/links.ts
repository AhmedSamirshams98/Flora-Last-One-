export const ROUTES = {
  HOME: "/",
  PRODUCTS: "/products",
  CONTACT: "/contact",
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

export const NAV_LINKS = [
  {
    href: ROUTES.HOME,
    labelKey: "nav.home",
    type: "page",
  },
  {
    href: "#about",
    labelKey: "nav.about",
    type: "anchor",
    anchorId: "about",
  },
  {
    href: ROUTES.PRODUCTS,
    labelKey: "nav.products",
    type: "page",
  },
  {
    href: ROUTES.ORDERS,
    labelKey: "nav.orders",
    type: "page",
  },
  {
    href: ROUTES.CONTACT,
    labelKey: "nav.contact",
    type: "page",
  },
] as const;

export const SEARCH_CONFIG = {
  placeholderKey: "search.placeholder",
  DEBOUNCE_DELAY: 300,
} as const;
