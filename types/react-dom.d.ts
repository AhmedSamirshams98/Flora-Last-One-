// @types/react-dom is not installed; the dashboard pop-up only needs createPortal.
declare module "react-dom" {
  export function createPortal(children: import("react").ReactNode, container: Element | DocumentFragment): import("react").ReactPortal;
}
