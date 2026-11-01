"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { toast } from "sonner";
import { Product, ProductVariant } from "@/types/product";
import { useProductLogic } from "./useProductLogic";

// Import المكونات الجديدة
import ProductImages from "./ProductImages";
import ProductPrice from "./ProductPrice";
import ProductVariants from "./ProductVariants";
import OutOfStockBadge from "./OutOfStockBadge";
import AllVariantsPopup from "./AllVariantsPopup";
import ProductBadge from "./ProductBadges";
import ProductWishlistButtons from "./ProductWishlistButton";
import AddToCartButton from "./CartButton";
import ProductSizesPopup from "./ProductSizePopup";
import AuthPopup from "@/app/components/AuthPopup";

interface ProductCardProps {
  product: Product;
  lang: "ar" | "en";
}

export default function ProductCard({ product, lang }: ProductCardProps) {
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [showSizePopup, setShowSizePopup] = useState(false);
  const [showAllVariantImages, setShowAllVariantImages] = useState(false);

  const { data: session } = useSession();
  const addToCart = useCartStore((state) => state.addToCart);
  const router = useRouter();

  // استخدام custom hook
  const {
    selectedVariant,
    setSelectedVariant,
    selectedSize,
    setSelectedSize,
    currentImageIndex,
    setCurrentImageIndex, // أضف هذا السطر ✅
    currentImages,
    nextImage,
    prevImage,
    discountPercentage,
  } = useProductLogic(product);

  // Wishlist functionality
  const { addToWishlist, removeFromWishlist, isInWishlist } =
    useWishlistStore();
  const isWishlisted = isInWishlist(product.id);

  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      const firstVariant = product.variants[0];
      setSelectedVariant(firstVariant);

      if (firstVariant.sizes && firstVariant.sizes.length > 0) {
        setSelectedSize(firstVariant.sizes[0]);
      }
    }
  }, [product, setSelectedVariant, setSelectedSize]);

  const handleVariantChange = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    setCurrentImageIndex(0);
    setShowAllVariantImages(false);

    if (variant.sizes && variant.sizes.length > 0) {
      setSelectedSize(variant.sizes[0]);
    } else {
      setSelectedSize("");
    }
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!session) {
      setShowAuthPopup(true);
      return;
    }

    if (!selectedVariant) {
      toast.error("Product not available");
      return;
    }

    const hasSizes = selectedVariant.sizes && selectedVariant.sizes.length > 0;
    if (hasSizes) {
      setShowSizePopup(true);
    } else {
      addProductToCart();
    }
  };

  const addProductToCart = () => {
    if (!selectedVariant || !session) return;

    const cartItem = {
      id: `${selectedVariant.id}-${selectedSize || "nosize"}`,
      productId: product.id,
      variantId: selectedVariant.id,
      name: `${product.name} - ${selectedVariant.color}${
        selectedSize ? ` (Size: ${selectedSize})` : ""
      }`,
      price: product.finalPrice,
      originalPrice: product.basePrice,
      image: selectedVariant.images[0] || "/placeholder.jpg",
      quantity: 1,
      color: selectedVariant.color,
      size: selectedSize,
      category: product.category,
      hasOffer: product.pricingType === "WITH_OFFER",
      offerMessage: product.offer?.title,
      discountPercentage,
    };

    addToCart(cartItem);
    toast.success(`${product.name} added to cart!`);
    setShowSizePopup(false);
  };

  const handleWishlistToggle = async () => {
    if (isWishlisted) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product.id);
    }
  };

  const navigate = (path: string) => {
    router.push(path);
  };

  const isOutOfStock = selectedVariant?.stock === 0;

  if (!product.variants || product.variants.length === 0 || !selectedVariant) {
    return null;
  }

  return (
    <>
      <div
        className="group fl-pcard fl-glow relative flex h-full cursor-pointer flex-col"
        onClick={() =>
          navigate(`/product/${product.id}?color=${selectedVariant.color}`)
        }
      >
        {/* the picture, with its small label, heart and add-to-cart */}
        <div className="relative">
          <ProductImages
            currentImages={currentImages}
            currentImageIndex={currentImageIndex}
            productName={product.name}
            variantColor={selectedVariant.color}
            onPrevImage={prevImage}
            onNextImage={nextImage}
            lang={lang}
          />

          <ProductBadge
            discountPercentage={discountPercentage}
            isNew={product.isNew}
            isFeatured={product.isFeatured}
            lang={lang}
          />

          <ProductWishlistButtons
            isWishlisted={isWishlisted}
            onToggleWishlist={handleWishlistToggle}
            lang={lang}
          />

          <OutOfStockBadge isOutOfStock={isOutOfStock} lang={lang} />

          <AddToCartButton
            isOutOfStock={isOutOfStock}
            onClick={handleAddToCartClick}
            lang={lang}
          />
        </div>

        {/* name, colour, price, colours */}
        <div className="px-1 pt-3 text-start">
          <h3
            className={`text-base leading-snug text-primary ${
              lang === "ar" ? "font-gess" : ""
            }`}
          >
            <Link
              href={`/${lang}/product/${product.id}?color=${encodeURIComponent(selectedVariant.color)}`}
              onClick={(e) => e.stopPropagation()}
              className="hover:underline hover:decoration-gold hover:underline-offset-4"
            >
              {product.name}
            </Link>
          </h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {selectedVariant.color}
          </p>

          <ProductPrice
            pricingType={product.pricingType}
            basePrice={product.basePrice}
            finalPrice={product.finalPrice}
            salePrice={product.salePrice}
            discountPercentage={discountPercentage}
            lang={lang}
          />

          <ProductVariants
            variants={product.variants}
            selectedVariantId={selectedVariant.id}
            onVariantChange={handleVariantChange}
            onShowAllVariants={() => setShowAllVariantImages(true)}
          />
        </div>
      </div>

      {/* منبثق كل المتغيرات */}
      <AllVariantsPopup
        isOpen={showAllVariantImages}
        onClose={() => setShowAllVariantImages(false)}
        productName={product.name}
        variants={product.variants}
      />

      {/* منبثق اختيار المقاس */}
      <ProductSizesPopup
        isOpen={showSizePopup}
        onClose={() => setShowSizePopup(false)}
        productName={product.name}
        variantColor={selectedVariant.color}
        variantImages={selectedVariant.images}
        finalPrice={product.finalPrice}
        sizes={selectedVariant.sizes}
        selectedSize={selectedSize}
        onSizeSelect={setSelectedSize}
        onAddToCart={addProductToCart}
        stock={selectedVariant.stock}
        lang={lang}
      />

      {/* منبثق المصادقة */}
      <AuthPopup
        lang={lang}
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
      />
    </>
  );
}
