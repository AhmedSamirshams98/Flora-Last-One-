"use client";
import { useEffect, useState } from "react";

export default function AdminReelsDashboard() {
  const [reels, setReels] = useState<{ id: string; url: string }[]>([]);
  const [newUrl, setNewUrl] = useState("");

  useEffect(() => {
    const fetchReels = async () => {
      const res = await fetch("/api/reels");
      const data = await res.json();
      setReels(data);
    };

    fetchReels();
  }, []);

  const addReel = async () => {
    if (!newUrl) return;
    await fetch("/api/reels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: newUrl }),
    });
    setNewUrl("");
    const res = await fetch("/api/reels");
    const data = await res.json();
    setReels(data);
  };

  const deleteReel = async (id: string) => {
    await fetch(`/api/reels/${id}`, { method: "DELETE" });
    const res = await fetch("/api/reels");
    const data = await res.json();
    setReels(data);
  };

  return (
    <div>
      <h2>إدارة الريلز</h2>
      <div className="mb-4">
        <input
          type="text"
          placeholder="رابط الريل"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          className="border p-2 mr-2"
        />
        <button onClick={addReel} className="bg-blue-500 text-white p-2">
          إضافة
        </button>
      </div>

      <ul>
        {reels.map((reel) => (
          <li key={reel.id} className="flex justify-between border p-2 mb-2">
            <span>{reel.url}</span>
            <button onClick={() => deleteReel(reel.id)} className="text-red-500">
              حذف
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
