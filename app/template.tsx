// Re-mounts on every navigation, so each page fades in. Opacity only: a transform
// here would break position:fixed descendants (menus, popups).
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="fl-page">{children}</div>;
}
