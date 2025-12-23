import ProductsSection from "../components/HomeComponents/products/ProductsSection";
import AboutSection from "../components/HomeComponents/AboutSection";
import OffersSlider from "../components/HomeComponents/Offers/OffersSlider";
import FacebookReelEmbed from "../components/HomeComponents/FacebookReelEmbed";
import HomeCategoriesPage from "../components/HomeComponents/HomeCategories/page";

interface PageProps {
  params: Promise<{ lang: "en" | "ar" }>; // ⭐ params هو Promise
}

const Page = async ({ params }: PageProps) => {
  const { lang } = await params; // ⭐ await الـ params كاملاً ثم destructure

  return (
    <div className="relative top-0 overflow-hidden">
      <OffersSlider lang={lang} />
      <HomeCategoriesPage lang={lang} />
      <AboutSection lang={lang} />
      <FacebookReelEmbed lang={lang} />
    </div>
  );
};

export default Page;
