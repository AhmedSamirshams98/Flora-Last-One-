"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { confirmAction } from "@/app/components/AdminConfirm";

type Reel = { id: string; url: string };

export default function AdminReelsDashboard() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/reels");
      if (!res.ok) throw new Error();
      setReels(await res.json());
    } catch {
      toast.error("تعذّر تحميل الريلز");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newUrl.trim() }),
      });
      if (!res.ok) throw new Error();
      toast.success("تمت إضافة الريل");
      setNewUrl("");
      await load();
    } catch {
      toast.error("فشلت إضافة الريل");
    } finally {
      setBusy(false);
    }
  };

  const deleteReel = async (id: string) => {
    if (!(await confirmAction("هل أنت متأكد من حذف هذا الريل؟"))) return;
    const res = await fetch(`/api/reels/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("تم حذف الريل");
      await load();
    } else toast.error("فشل الحذف");
  };

  return (
    <div className="fl-admin-page">
      <div className="container mx-auto px-4 py-8 md:py-12" dir="rtl">
        <h1 className="mb-6 text-3xl md:text-4xl">إدارة الريلز</h1>
        <form onSubmit={addReel} className="mb-8 flex flex-col gap-3 sm:flex-row">
          <label htmlFor="reel-url" className="sr-only">رابط الريل</label>
          <input
            id="reel-url"
            type="url"
            dir="ltr"
            placeholder="https://www.facebook.com/reel/..."
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="min-h-11 flex-1 rounded-lg border border-primary/25 bg-white px-3"
          />
          <button disabled={busy} className="min-h-11 rounded-lg bg-primary px-6 text-primary-foreground disabled:opacity-60">
            إضافة
          </button>
        </form>

        {reels.length === 0 ? (
          <p className="text-primary/70">لا توجد ريلز بعد.</p>
        ) : (
          <ul className="space-y-3">
            {reels.map((reel) => (
              <li key={reel.id} className="flex items-center justify-between gap-3 rounded-xl border border-primary/15 bg-white p-3">
                <span dir="ltr" className="min-w-0 flex-1 truncate text-sm text-primary/80">{reel.url}</span>
                <button
                  onClick={() => deleteReel(reel.id)}
                  aria-label="حذف الريل"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-5 w-5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
