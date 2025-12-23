import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

/* أسماء الأقسام من enum */
const CATEGORY_NAMES: Record<string, { ar: string; en: string }> = {
  WINTER_BOOTS: { ar: "أحذية شتوية", en: "Winter Boots" },
  SNEAKERS: { ar: "سنيكرز", en: "Sneakers" },
  SANDALS: { ar: "صنادل", en: "Sandals" },
  LOAFERS: { ar: "لوفر", en: "Loafers" },
  PUMPS: { ar: "كعب عالي", en: "Pumps" },
  BALLERINAS: { ar: "باليرينا", en: "Ballerinas" },
};

interface HomeCategoriesPageProps {
  lang: "ar" | "en";
}

export default async function HomeCategoriesPage({
  lang,
}: HomeCategoriesPageProps) {
  const categories = await prisma.homeCategory.findMany();

  return (
    <section className="container mx-auto px-4 py-10">
      <h1
        className={` ${
          lang === "ar" ? "font-gess" : "font-sans"
        } text-3xl font-bold font-gess text-center mb-10`}
      >
        {lang === "ar" ? "الأقسام" : "Categories"}
      </h1>

      {categories.length === 0 && (
        <p className="text-center text-gray-500">
          {lang === "ar" ? "لا توجد أقسام حالياً" : "No categories available"}
        </p>
      )}

      <div className="grid grid-cols-1  md:grid-cols-2 gap-6">
        {categories.map((item) => (
          <Link
            key={item.id}
            href={`/products?subcategory=${item.category}`}
            className="relative h-82 md:h-128 rounded-xl overflow-hidden group"
          >
            <Image
              src={item.image}
              alt={CATEGORY_NAMES[item.category]?.en ?? item.category}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover  transition-transform duration-300"
            />

            {/* Overlay للنص */}
            <div
              className={`absolute inset-0 bg-black/50 flex items-end p-4 ${
                lang === "ar"
                  ? "justify-end text-right"
                  : "justify-start text-left"
              }`}
            >
              <h2
                className={`text-white text-xl md:text-2xl bg-black p-2  rounded-sm font-medium drop-shadow-lg ${
                  lang === "ar" ? "font-gess" : "font-sans"
                }`}
              >
                {lang === "ar"
                  ? CATEGORY_NAMES[item.category]?.ar
                  : CATEGORY_NAMES[item.category]?.en}
              </h2>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
