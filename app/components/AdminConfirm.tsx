"use client";

/* "Are you sure?" for the dashboard, in the shop's own pop-up instead of the browser's.
   `await confirmAction("...")` anywhere in the dashboard gives true or false; <ConfirmHost/> sits
   once in the dashboard layout and draws the question. If the host is not on the page (it always
   is in the dashboard) the browser's own confirm is used, so a delete is never silently skipped. */

import { useEffect, useState } from "react";
import AdminModal from "./AdminModal";

type Ask = { message: string; confirmLabel: string; resolve: (ok: boolean) => void; handled?: boolean };
const EVENT = "flora-confirm";

export function confirmAction(message: string, confirmLabel = "حذف"): Promise<boolean> {
  return new Promise((resolve) => {
    const detail: Ask = { message, confirmLabel, resolve };
    window.dispatchEvent(new CustomEvent<Ask>(EVENT, { detail }));
    if (!detail.handled) resolve(window.confirm(message));
  });
}

export function ConfirmHost() {
  const [ask, setAsk] = useState<Ask | null>(null);

  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<Ask>).detail;
      d.handled = true;
      setAsk(d);
    };
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);

  if (!ask) return null;
  const done = (ok: boolean) => {
    ask.resolve(ok);
    setAsk(null);
  };
  return (
    <AdminModal onClose={() => done(false)} label="تأكيد">
      <div className="p-6 text-center">
        <p className="text-lg leading-8 text-primary">{ask.message}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => done(false)}
            className="min-h-11 rounded-lg border border-primary/25 px-6 text-primary hover:bg-primary/5"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={() => done(true)}
            className="min-h-11 rounded-lg bg-red-700 px-6 text-white hover:bg-red-800"
          >
            {ask.confirmLabel}
          </button>
        </div>
      </div>
    </AdminModal>
  );
}
