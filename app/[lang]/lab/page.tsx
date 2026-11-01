import type { Metadata } from "next";
import PanoramicHero from "@/app/components/HomeComponents/Offers/PanoramicHero";
import FanHero from "@/app/components/HomeComponents/Offers/FanHero";
import { prisma } from "@/lib/prisma";
import "@/app/components/HomeComponents/bento.css";

// A test bench for hero ideas (/lab: spread fan, /lab?hero=fan: three-card fan): not linked from the shop and hidden from search engines.
export const metadata: Metadata = { title: "Lab", robots: { index: false, follow: false } };

export default async function LabPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: "ar" | "en" }>;
  searchParams: Promise<{ hero?: string }>;
}) {
  const { lang } = await params;
  const { hero } = await searchParams; // /lab = spread fan, /lab?hero=fan = three-card fan
  const rows = await prisma.product.findMany({
    where: { isActive: true, variants: { some: {} } },
    include: { variants: { select: { images: true } } },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    take: 16,
  });
  const products = rows
    .map((p) => ({
      id: p.id,
      name: p.name,
      basePrice: p.basePrice,
      finalPrice: p.finalPrice,
      isNew: p.isNew,
      inStock: p.inStock,
      image: p.variants.flatMap((v) => v.images)[0] ?? "",
    }))
    .filter((p) => p.image);

  return (
    <div data-home="bento" className="relative overflow-hidden">
      {hero === "fan" ? (
        <FanHero lang={lang === "en" ? "en" : "ar"} products={products} />
      ) : (
        <PanoramicHero lang={lang === "en" ? "en" : "ar"} products={products} />
      )}
      <div className="h-24" />
    </div>
  );
}
