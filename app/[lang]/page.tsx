import OffersSlider from "../components/HomeComponents/Offers/OffersSlider";
import AboutSection from "../components/HomeComponents/AboutSection";
import FacebookReelEmbed from "../components/HomeComponents/FacebookReelEmbed";
import { prisma } from "@/lib/prisma";
import HomeCategoriesPageClient from "../components/HomeComponents/HomeCategoriesPageClient.tsx/page";

interface PageProps {
  params: Promise<{ lang: "en" | "ar" }>;
}

const Page = async ({ params }: PageProps) => {
  const { lang } = await params;

  const categories = await prisma.homeCategory.findMany();

  return (
    <div className="relative top-0 overflow-hidden">
      <OffersSlider lang={lang} />
      <HomeCategoriesPageClient lang={lang} categories={categories} />
      <AboutSection lang={lang} />
      <FacebookReelEmbed lang={lang} />
    </div>
  );
};

export default Page;
