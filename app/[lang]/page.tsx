import ReelHero from "../components/HomeComponents/Offers/ReelHero";
import OfferLine from "../components/HomeComponents/Offers/OfferLine";
import type { DealOffer } from "../components/HomeComponents/Offers/types";
import { categoryMeta } from "../components/HomeComponents/categoryMeta";
import CategoryCards from "../components/HomeComponents/CategoryCards";
import HomeProducts from "../components/HomeComponents/HomeProducts";
import AboutSection from "../components/HomeComponents/AboutSection";
import { prisma } from "@/lib/prisma";
import { withLivePrice } from "@/lib/effective-price";
import "../components/HomeComponents/bento.css";

interface PageProps {
  params: Promise<{ lang: "en" | "ar" }>;
}

const Page = async ({ params }: PageProps) => {
  const { lang } = await params;

  const categories = await prisma.homeCategory.findMany({ orderBy: { id: "asc" } });

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

  // In stock first, then the ones the owner marked "featured" (the dashboard checkbox), then newest;
  // only active products that have a photo.
  const rows = await prisma.product.findMany({
    where: { isActive: true, variants: { some: {} } },
    include: { variants: { select: { images: true, stock: true } }, offer: true },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });
  // prices worked out now (offer on/off, its dates) and "in stock" only if a colour really has stock;
  // then the ones in stock come first, the featured / newest order is kept inside each group
  const live = rows.map((p) => withLivePrice(p)).sort((a, b) => Number(b.inStock) - Number(a.inStock));
  const all = live
    .slice(0, 16)
    .map((p) => ({
      id: p.id,
      name: p.name,
      basePrice: p.basePrice,
      finalPrice: p.finalPrice,
      isNew: p.isNew,
      isFeatured: p.isFeatured,
      inStock: p.inStock,
      image: p.variants.flatMap((v) => v.images)[0] ?? "",
      hoverImage: p.variants.flatMap((v) => v.images)[1],
    }))
    .filter((p) => p.image);
  const products = all.slice(0, 8); // the hero row

  // the grid under the categories, titled by what it really is: the products the owner marked
  // "featured" if there are at least 4, else the ones marked "new" if there are at least 4, else
  // a neutral "our products" (in stock first, then featured, then newest)
  const featured = all.filter((p) => p.isFeatured);
  const fresh = all.filter((p) => p.isNew);
  const gridKind = featured.length >= 4 ? "featured" : fresh.length >= 4 ? "new" : "mixed";
  const gridProducts = (gridKind === "featured" ? featured : gridKind === "new" ? fresh : all).slice(0, 8);

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
      <OfferLine lang={lang} offers={deals} />
      <div className="fl-warm">
        <CategoryCards lang={lang} items={heroItems} />
      </div>
      <HomeProducts lang={lang} products={gridProducts} kind={gridKind} />
      <span className="fl-hair" aria-hidden="true" />
      <AboutSection lang={lang} />
    </div>
  );
};

export default Page;
