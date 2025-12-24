"use client";
import { useEffect, useState } from "react";

type HomeCategory = {
  id: string;
  image: string;
  category: string;
  subcategory?: string;
};

// القيم الممكنة
const CATEGORY_OPTIONS = ["SHOE", "BAG"];
const SUBCATEGORIES = {
  SHOE: ["ALL_SHOES", "WINTER_BOOTS", "SNEAKERS", "PUMPS", "BALLERINAS", "LOAFERS", "SLIPPERS", "SANDALS"],
  BAG: ["ALL_BAGS", "HAND_BAGS", "SHOULDER_BAGS", "CROSSBODY_BAGS", "CLUTCH_BAGS", "BACKPACKS", "WALLETS"]
};

export default function HomeCategoriesDashboard() {
  const [categories, setCategories] = useState<HomeCategory[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    const res = await fetch("/api/home-categories");
    const data = await res.json();
    setCategories(data);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    if (imageFile) formData.append("image", imageFile);
    formData.append("category", category);
    formData.append("subcategory", subcategory);

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/home-categories/${editingId}` : "/api/home-categories";

    await fetch(url, { method, body: formData });

    setImageFile(null);
    setCategory("");
    setSubcategory("");
    setEditingId(null);
    setLoading(false);
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    await fetch(`/api/home-categories/${id}`, { method: "DELETE" });
    fetchCategories();
  };

  const startEdit = (item: HomeCategory) => {
    setEditingId(item.id);
    setCategory(item.category);
    setSubcategory(item.subcategory || "");
  };

  return (
    <section className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Home Categories</h1>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow mb-8 grid gap-4 md:grid-cols-3">
        <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="border p-2 rounded" required={!editingId} />

        <select value={category} onChange={(e) => setCategory(e.target.value)} className="border p-2 rounded" required>
          <option value="">اختر القسم</option>
          {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)} className="border p-2 rounded">
          <option value="">اختر النوع الفرعي</option>
          {category && SUBCATEGORIES[category as keyof typeof SUBCATEGORIES].map((sub) => (
            <option key={sub} value={sub}>{sub}</option>
          ))}
        </select>

        <button disabled={loading} className="bg-black text-white rounded px-4 py-2">
          {editingId ? "تعديل" : "إضافة"}
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full border text-center">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">الصورة</th>
              <th className="border p-2">القسم</th>
              <th className="border p-2">النوع الفرعي</th>
              <th className="border p-2">التحكم</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((item) => (
              <tr key={item.id}>
                <td className="border p-2"><img src={item.image} alt="" className="h-20 mx-auto object-cover rounded" /></td>
                <td className="border p-2 font-semibold">{item.category}</td>
                <td className="border p-2 font-semibold">{item.subcategory || "-"}</td>
                <td className="border p-2 space-x-2">
                  <button onClick={() => startEdit(item)} className="px-3 py-1 bg-blue-500 text-white rounded">تعديل</button>
                  <button onClick={() => handleDelete(item.id)} className="px-3 py-1 bg-red-500 text-white rounded">حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
