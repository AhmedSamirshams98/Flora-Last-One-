"use client";
import React, { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ShoppingCart,
  Palette,
  Ruler,
  ArrowRight,
  Package,
  DollarSign,
  Shield,
  Truck,
  CheckCircle,
  Star,
} from "lucide-react";
import Image from "next/image";
import { useCartStore } from "@/store/cart-store";
import { useProductsStore } from "@/store/products-store";
import { toast } from "sonner";
import { EmblaOptionsType } from "embla-carousel";
import EmblaCarouselSlider from "@/app/components/emblaCarouselSlider/EmblaCarouselSlider";
import { ProductVariant, PricingType } from "@/types/product";
import AuthPopup from "@/app/components/AuthPopup";

interface ProductPageProps {
  params: Promise<{ id: string }>;
  lang?: "ar" | "en"; // أضفت lang هنا
}

export default function ProductPage({ params, lang = "en" }: ProductPageProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [showAuthPopup, setShowAuthPopup] = React.useState(false);
  const [selectedVariant, setSelectedVariant] =
    React.useState<ProductVariant | null>(null);
  const [selectedSize, setSelectedSize] = React.useState<string>("");

  const {
    currentProduct,
    getProductById,
    loading: productLoading,
  } = useProductsStore();

  const addToCart = useCartStore((state) => state.addToCart);

  const { id } = React.use(params);

  const fetchProduct = useCallback(async () => {
    try {
      await getProductById(id);
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Error loading product");
    }
  }, [id, getProductById]); // أضف getProductById كـ dependency

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id, fetchProduct]); // أضف fetchProduct هنا

  useEffect(() => {
    if (currentProduct?.variants && currentProduct.variants.length > 0) {
      const firstVariant = currentProduct.variants[0];
      setSelectedVariant(firstVariant);
      if (firstVariant.sizes && firstVariant.sizes.length > 0) {
        setSelectedSize(firstVariant.sizes[0]);
      }
    }
  }, [currentProduct]);

  const handleVariantChange = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    if (variant.sizes && variant.sizes.length > 0) {
      setSelectedSize(variant.sizes[0]);
    } else {
      setSelectedSize("");
    }
  };

  const handleAddToCart = () => {
    if (!session) {
      setShowAuthPopup(true);
      return;
    }

    if (!currentProduct || !selectedVariant) return;

    const cartItem = {
      id: selectedVariant.id,
      productId: currentProduct.id,
      variantId: selectedVariant.id, // ⚠️ إضافة variantId هنا

      name: currentProduct.name,
      variantName: selectedVariant.color,
      price: currentProduct.finalPrice,
      originalPrice: currentProduct.basePrice,
      image: selectedVariant.images[0] || "/placeholder.jpg",
      quantity: 1,
      color: selectedVariant.color,
      size: selectedSize,
      category: currentProduct.category,
      hasOffer: currentProduct.pricingType === PricingType.WITH_OFFER,
      offerMessage: currentProduct.offer?.title,
      discountPercentage: getDiscountPercentage(),
    };

    addToCart(cartItem);
    toast.success(`${currentProduct.name} added to cart!`);
  };

  const getDiscountPercentage = () => {
    if (!currentProduct) return 0;

    if (
      currentProduct.pricingType === PricingType.SALE_PRICE &&
      currentProduct.salePrice
    ) {
      return Math.round(
        ((currentProduct.basePrice - currentProduct.salePrice) /
          currentProduct.basePrice) *
          100
      );
    }
    return 0;
  };

  const renderPriceDetails = () => {
    if (!currentProduct) return null;

    const currency = "EGP";

    switch (currentProduct.pricingType) {
      case PricingType.SINGLE_PRICE:
        return (
          <div className="space-y-1">
            <div className="text-4xl font-bold text-primary">
              {currentProduct.finalPrice.toLocaleString()} {currency}
            </div>
          </div>
        );

      case PricingType.SALE_PRICE:
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xl text-gray-500 line-through">
                {currentProduct.basePrice.toLocaleString()} {currency}
              </span>
              <span className="text-4xl font-bold text-green-600">
                {currentProduct.salePrice?.toLocaleString()} {currency}
              </span>
            </div>
            <div className="inline-block bg-red-500 text-white px-4 py-1 rounded-full text-sm font-bold">
              Save {getDiscountPercentage()}%
            </div>
          </div>
        );

      case PricingType.WITH_OFFER:
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xl text-gray-500 line-through">
                {currentProduct.basePrice.toLocaleString()} {currency}
              </span>
              <span className="text-4xl font-bold text-green-600">
                {currentProduct.finalPrice.toLocaleString()} {currency}
              </span>
            </div>
            {currentProduct.offer && (
              <div className="inline-block bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                {currentProduct.offer.title}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (productLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Product not found</p>
          <button
            onClick={() => router.push("/")}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!selectedVariant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  const currentImages =
    selectedVariant.images.length > 0
      ? selectedVariant.images
      : ["/placeholder.jpg"];

  const isOutOfStock = selectedVariant.stock === 0;
  const isLowStock = selectedVariant.stock > 0 && selectedVariant.stock < 10;

  const emblaOptions: EmblaOptionsType = {
    loop: true,
    align: "center",
  };

  const slides = currentImages.map((image, index) => (
    <div className="relative w-full h-full" key={index}>
      <Image
        unoptimized
        fill
        src={image}
        alt={`${currentProduct.name} - ${selectedVariant.color} - Image ${
          index + 1
        }`}
        className="w-full h-full object-cover"
        priority={index === 0}
      />
    </div>
  ));

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-3">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowRight size={20} />
              <span>Back</span>
            </button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden shadow-lg">
                {currentImages.length > 1 ? (
                  <EmblaCarouselSlider slides={slides} options={emblaOptions} />
                ) : (
                  <div className="relative aspect-square">
                    <Image
                      unoptimized
                      fill
                      src={currentImages[0]}
                      alt={`${currentProduct.name} - ${selectedVariant.color}`}
                      className="w-full h-full object-cover"
                      priority
                    />
                  </div>
                )}
              </div>

              {currentProduct.variants.length > 1 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {currentProduct.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => handleVariantChange(variant)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedVariant.id === variant.id
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Image
                        unoptimized
                        src={variant.images[0] || "/placeholder.jpg"}
                        alt={variant.color}
                        fill
                        className="object-cover"
                      />
                      {variant.stock === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="w-6 h-0.5 bg-white rotate-45"></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                    {currentProduct.category}
                  </span>
                  {currentProduct.subcategory && (
                    <span className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full">
                      {currentProduct.subcategory}
                    </span>
                  )}
                  {currentProduct.isNew && (
                    <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full">
                      New
                    </span>
                  )}
                  {currentProduct.isFeatured && (
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full">
                      Featured
                    </span>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {currentProduct.name}
                </h1>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-5 h-5 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                  <span className="text-gray-600 text-sm ml-2">(4.8)</span>
                </div>
              </div>

              <div className="border-t border-b py-6">
                {renderPriceDetails()}
              </div>

              {selectedVariant.description && (
                <div className="bg-white rounded-lg p-4 border">
                  <h3 className="font-semibold mb-2">Color Description</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {selectedVariant.description}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-gray-600" />
                  <h3 className="font-semibold">Choose Color</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentProduct.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => handleVariantChange(variant)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                        selectedVariant.id === variant.id
                          ? "border-primary bg-blue-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <span>{variant.color}</span>
                      {variant.stock === 0 && (
                        <span className="text-xs text-red-500">(Sold out)</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {selectedVariant.sizes && selectedVariant.sizes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Ruler className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold">Choose Size</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedVariant.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 rounded-lg border transition-all ${
                          selectedSize === size
                            ? "border-primary bg-blue-50 text-primary font-medium"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg p-4 border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-600" />
                    <span>Stock:</span>
                  </div>
                  <div
                    className={`font-medium ${
                      isOutOfStock
                        ? "text-red-600"
                        : isLowStock
                        ? "text-orange-600"
                        : "text-green-600"
                    }`}
                  >
                    {isOutOfStock
                      ? "Out of stock"
                      : `${selectedVariant.stock} available`}
                  </div>
                </div>

                {isLowStock && !isOutOfStock && (
                  <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
                    ⚠️ Limited stock! Only a few left
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <button
                  className="w-full bg-primary text-white py-4 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-3 font-semibold text-lg"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="w-6 h-6" />
                  {isOutOfStock ? "Out of stock" : "Add to Cart"}
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck className="w-4 h-4" />
                    <span>Fast Shipping</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span>Quality Guarantee</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Free Returns</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>Best Price</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white mt-10 rounded-xl p-6 border">
            <h3 className="text-xl font-bold mb-4">Product Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">{currentProduct.category}</span>
              </div>
              {currentProduct.subcategory && (
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium">
                    {currentProduct.subcategory}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`font-medium ${
                    currentProduct.inStock ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {currentProduct.inStock ? "Available" : "Unavailable"}
                </span>
              </div>
              {selectedVariant?.description && (
                <div className="py-2">
                  <h4 className="font-medium mb-1">Product Description:</h4>
                  <p className="text-gray-600">{selectedVariant.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AuthPopup
        lang={lang}
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
      />
    </>
  );
}
