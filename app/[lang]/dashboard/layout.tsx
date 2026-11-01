/* Every dashboard page: the shop's own fonts (Readex Pro for text, Amiri for titles) through .fl-admin
   in home.css, and the one "are you sure?" pop-up. Access is checked in middleware.ts. */
import { ConfirmHost } from "@/app/components/AdminConfirm";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fl-admin min-h-[70vh]">
      {children}
      <ConfirmHost />
    </div>
  );
}
