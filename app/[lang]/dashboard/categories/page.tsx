"use client";

import { useEffect, useState } from "react";

type HomeCategory = {
  id: string;
  image: string;
  category: string;
};

const SUBCATEGORIES = [
  "WINTER_BOOTS",
  "SNEAKERS",
  "SANDALS",
  "LOAFERS",
  "PUMPS",
  "BALLERINAS",
];

export default function HomeCategoriesDashboard() {
  const [categories, setCategories] = useState<HomeCategory[]>([]);
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);


  /* ======================
     جلب البيانات
  ====================== */
  const fetchCategories = async () => {
    const res = await fetch("/api/home-categories");
    const data = await res.json();
    setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  const formData = new FormData();
  if (imageFile) {
    formData.append("image", imageFile);
  }
  formData.append("category", category);

  const method = editingId ? "PUT" : "POST";
  const url = editingId
    ? `/api/home-categories/${editingId}`
    : "/api/home-categories";

  await fetch(url, {
    method,
    body: formData,
  });

  setImageFile(null);
  setCategory("");
  setEditingId(null);
  setLoading(false);
  fetchCategories();
};


  /* ======================
     حذف
  ====================== */
  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;

    await fetch(`/api/home-categories/${id}`, {
      method: "DELETE",
    });

    fetchCategories();
  };

  /* ======================
     بدء التعديل
  ====================== */
  const startEdit = (item: HomeCategory) => {
    setEditingId(item.id);
    setImage(item.image);
    setCategory(item.category);
  };

  return (
    <section className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Home Categories
      </h1>

      {/* ===== الفورم ===== */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded-lg shadow mb-8 grid gap-4 md:grid-cols-3"
      >
      <input
  type="file"
  accept="image/*"
  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
  className="border p-2 rounded"
  required={!editingId}
/>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 rounded"
          required
        >
          <option value="">اختر القسم</option>
          {SUBCATEGORIES.map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>

        <button
          disabled={loading}
          className="bg-black text-white rounded px-4 py-2"
        >
          {editingId ? "تعديل" : "إضافة"}
        </button>
      </form>

      {/* ===== الجدول ===== */}
      <div className="overflow-x-auto">
        <table className="w-full border text-center">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">الصورة</th>
              <th className="border p-2">القسم</th>
              <th className="border p-2">التحكم</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((item) => (
              <tr key={item.id}>
                <td className="border p-2">
                  <img
                    src={item.image}
                    alt=""
                    className="h-20 mx-auto object-cover rounded"
                  />
                </td>
                <td className="border p-2 font-semibold">
                  {item.category}
                </td>
                <td className="border p-2 space-x-2">
                  <button
                    onClick={() => startEdit(item)}
                    className="px-3 py-1 bg-blue-500 text-white rounded"
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
