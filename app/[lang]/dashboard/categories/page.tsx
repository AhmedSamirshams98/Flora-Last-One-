"use client";

/* The categories shown on the home page (the carousel under the hero): a picture, the section
   (shoes / bags) and optionally one type of it. Names are in Arabic, the picture is previewed, a type
   that does not belong to the chosen section cannot be picked, and the same card cannot be added twice
   (the server checks all of this too). */

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { confirmAction } from "@/app/components/AdminConfirm";
import { productTranslations } from "@/lib/translations/products";
import { SECTION_TYPES } from "@/lib/home-category-rules";

type HomeCategory = {
  id: string;
  image: string;
  category: string;
  subcategory?: string | null;
};

const SECTION_AR: Record<string, string> = { SHOE: "أحذية", BAG: "شنط" };
const typeAr = (t?: string | null) => {
  if (!t) return "كل القسم";
  if (t === "ALL_SHOES") return "كل الأحذية";
  if (t === "ALL_BAGS") return "كل الشنط";
  return productTranslations.subcategory[t as keyof typeof productTranslations.subcategory]?.ar ?? t;
};
// loafers and sandals are the same shop sections as ballerinas and slippers: offer only the two names
const CHOOSABLE = (section: string) => (SECTION_TYPES[section as "SHOE" | "BAG"] ?? []).filter((t) => t !== "LOAFERS" && t !== "SANDALS");

export default function HomeCategoriesDashboard() {
  const [categories, setCategories] = useState<HomeCategory[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/home-categories");
      if (!res.ok) throw new Error();
      setCategories(await res.json());
      setLoadError(false);
    } catch {
      setLoadError(true);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // a preview of the picture just chosen
  const preview = useMemo(() => (imageFile ? URL.createObjectURL(imageFile) : null), [imageFile]);
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);
  const editing = categories.find((c) => c.id === editingId);

  const reset = () => {
    setImageFile(null);
    setCategory("");
    setSubcategory("");
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);

    const formData = new FormData();
    if (imageFile) formData.append("image", imageFile);
    formData.append("category", category);
    formData.append("subcategory", subcategory);

    try {
      const res = await fetch(editingId ? `/api/home-categories/${editingId}` : "/api/home-categories", {
        method: editingId ? "PUT" : "POST",
        body: formData,
      });
      if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || "فشل في الحفظ");
      toast.success(editingId ? "تم تعديل القسم" : "تمت إضافة القسم");
      reset();
      fetchCategories();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "فشل في الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!(await confirmAction("هل أنت متأكد من حذف هذا القسم من الصفحة الرئيسية؟"))) return;
    const res = await fetch(`/api/home-categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("تم حذف القسم");
      if (id === editingId) reset();
      fetchCategories();
    } else toast.error("فشل في الحذف");
  };

  const startEdit = (item: HomeCategory) => {
    setEditingId(item.id);
    setImageFile(null);
    setCategory(item.category);
    setSubcategory(item.subcategory === "LOAFERS" ? "BALLERINAS" : item.subcategory === "SANDALS" ? "SLIPPERS" : item.subcategory || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="mx-auto max-w-5xl p-4 md:p-6">
      <h1 className="mb-2 text-3xl md:text-4xl">أقسام الصفحة الرئيسية</h1>
      <p className="mb-6 text-sm text-primary/70">تظهر بالترتيب الذي أُضيفت به في شريط الأقسام تحت الواجهة الرئيسية.</p>

      <form onSubmit={handleSubmit} className="fl-pcard mb-8 grid gap-4 !p-5 md:grid-cols-[auto_1fr_1fr]">
        <div className="md:row-span-2">
          <div className="relative aspect-[4/5] w-28 overflow-hidden rounded-xl bg-secondary">
            {(preview || editing?.image) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview || editing!.image} alt="" className="h-full w-full object-cover" />
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="hc-image" className="mb-1.5 block text-sm text-primary/80">
            الصورة {editingId ? "(اتركها فارغة للإبقاء على الحالية)" : ""}
          </label>
          <input
            id="hc-image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="fl-input !py-2"
            required={!editingId}
          />
        </div>

        <div>
          <label htmlFor="hc-category" className="mb-1.5 block text-sm text-primary/80">القسم</label>
          <select
            id="hc-category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setSubcategory(""); // a type of the old section would not fit the new one
            }}
            className="fl-input"
            required
          >
            <option value="">اختر القسم</option>
            {Object.keys(SECTION_AR).map((c) => (
              <option key={c} value={c}>{SECTION_AR[c]}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="hc-sub" className="mb-1.5 block text-sm text-primary/80">النوع (اختياري)</label>
          <select id="hc-sub" value={subcategory} onChange={(e) => setSubcategory(e.target.value)} className="fl-input" disabled={!category}>
            <option value="">{category ? "كل القسم" : "اختر القسم أولًا"}</option>
            {CHOOSABLE(category).map((t) => (
              <option key={t} value={t}>{typeAr(t)}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-3 md:col-span-3">
          <button disabled={saving} className="fl-cta">{saving ? "جاري الحفظ..." : editingId ? "حفظ التعديل" : "إضافة القسم"}</button>
          {editingId && (
            <button type="button" onClick={reset} className="fl-btn-oval">إلغاء التعديل</button>
          )}
        </div>
      </form>

      {!loaded ? (
        <p className="py-8 text-center text-primary/70">جاري التحميل...</p>
      ) : loadError ? (
        <div className="py-8 text-center">
          <p className="mb-3 text-[#9b2c1f]">تعذّر تحميل الأقسام</p>
          <button onClick={fetchCategories} className="fl-btn-oval">إعادة المحاولة</button>
        </div>
      ) : categories.length === 0 ? (
        <p className="py-8 text-center text-primary/70">لا توجد أقسام بعد. أضف أول قسم من النموذج أعلاه.</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {categories.map((item) => (
            <li key={item.id} className="fl-pcard flex items-center gap-4 !p-3">
              <div className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-xl bg-secondary">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.image} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg text-primary">{SECTION_AR[item.category] ?? item.category}</p>
                <p className="text-sm text-primary/70">{typeAr(item.subcategory)}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <button onClick={() => startEdit(item)} className="min-h-11 rounded-lg bg-primary px-4 text-sm text-primary-foreground">تعديل</button>
                <button onClick={() => handleDelete(item.id)} className="min-h-11 rounded-lg border border-red-300 px-4 text-sm text-red-700 hover:bg-red-50">حذف</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
