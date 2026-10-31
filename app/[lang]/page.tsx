import ReelHero from "../components/HomeComponents/Offers/ReelHero";
import OfferShowcase from "../components/HomeComponents/Offers/OfferShowcase";
import type { DealOffer } from "../components/HomeComponents/Offers/types";
import { categoryMeta } from "../components/HomeComponents/categoryMeta";
import CategoryCards from "../components/HomeComponents/CategoryCards";
import AboutSection from "../components/HomeComponents/AboutSection";
import FacebookReelEmbed from "../components/HomeComponents/FacebookReelEmbed";
import { prisma } from "@/lib/prisma";
import "../components/HomeComponents/bento.css";

interface PageProps {
  params: Promise<{ lang: "en" | "ar" }>;
}

const Page = async ({ params }: PageProps) => {
  const { lang } = await params;

  const categories = await prisma.homeCategory.findMany();

  // Active offers (same rule as the old client filter), fetched on the server so
  // the hero never pops in after load.
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const offerRows = await prisma.offer.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
  });
  const deals: DealOffer[] = offerRows
    .filter((o) => {
      if (o.startDate && new Date(new Date(o.startDate).setHours(0, 0, 0, 0)) > today) return false;
      if (o.endDate && new Date(new Date(o.endDate).setHours(0, 0, 0, 0)) < today) return false;
      return true;
    })
    .map((o) => ({
      id: o.id,
      title: o.title,
      titleEn: o.titleEn,
      image: o.image,
      offerType: o.offerType,
      discountPercentage: o.discountPercentage,
      discountAmount: o.discountAmount,
      fixedPrice: o.fixedPrice,
      buyQuantity: o.buyQuantity,
      getQuantity: o.getQuantity,
      endDate: o.endDate ? o.endDate.toISOString() : null,
    }));

  // Featured first, then newest; only active products that have a photo.
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
      hoverImage: p.variants.flatMap((v) => v.images)[1],
    }))
    .filter((p) => p.image)
    .slice(0, 8);

  const heroItems = categories.map((c) => ({
    id: c.id,
    image: c.image,
    ...categoryMeta(c, lang),
  }));

  return (
    <div className="relative top-0 overflow-hidden" data-home="bento">
      <ReelHero
        lang={lang}
        products={products}
        extra={heroItems.map((c) => ({ id: c.id, image: c.image, alt: c.alt, href: c.href }))}
      />
      <OfferShowcase lang={lang} offers={deals} />
      <CategoryCards lang={lang} items={heroItems} />
      <AboutSection lang={lang} />
      <FacebookReelEmbed lang={lang} />
    </div>
  );
};

export default Page;
