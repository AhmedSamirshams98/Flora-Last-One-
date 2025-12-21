// "use client";
// import { useState, useEffect } from "react";
// import { useSession } from "next-auth/react";
// import {
//   ShoppingCart,
//   ChevronLeft,
//   ChevronRight,
//   X,
//   Check,
//   AlertCircle,
//   Star,
//   Heart,
// } from "lucide-react";
// import Image from "next/image";
// import { useCartStore } from "@/store/cart-store";
// import { toast } from "sonner";
// import { Product, ProductVariant, PricingType } from "@/types/product";
// import { useRouter } from "next/navigation";
// import AuthPopup from "../../AuthPopup";
// import { useWishlistStore } from "@/store/wishlist-store";

// interface ProductCardProps {
//   product: Product;
//   lang: "ar" | "en";
// }

// export default function ProductCard({ product, lang }: ProductCardProps) {
//   const [showAuthPopup, setShowAuthPopup] = useState(false);
//   const [showSizePopup, setShowSizePopup] = useState(false);
//   const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
//     null
//   );
//   const [selectedSize, setSelectedSize] = useState<string>("");
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);
//   const [showAllVariantImages, setShowAllVariantImages] = useState(false);
//   const { data: session } = useSession();
//   const addToCart = useCartStore((state) => state.addToCart);
//   const router = useRouter();

//   // Wishlist functionality
//   const {
//     items: wishlistItems,
//     addToWishlist,
//     removeFromWishlist,
//     isInWishlist,
//   } = useWishlistStore();

//   const isWishlisted = isInWishlist(product.id);

//   useEffect(() => {
//     if (product.variants && product.variants.length > 0) {
//       const firstVariant = product.variants[0];
//       setSelectedVariant(firstVariant);

//       if (firstVariant.sizes && firstVariant.sizes.length > 0) {
//         setSelectedSize(firstVariant.sizes[0]);
//       }
//     }
//   }, [product]);

//   const handleVariantChange = (variant: ProductVariant) => {
//     setSelectedVariant(variant);
//     setCurrentImageIndex(0);
//     setShowAllVariantImages(false);

//     if (variant.sizes && variant.sizes.length > 0) {
//       setSelectedSize(variant.sizes[0]);
//     } else {
//       setSelectedSize("");
//     }
//   };

//   const handleAddToCartClick = (e: React.MouseEvent) => {
//     e.stopPropagation();

//     if (!session) {
//       setShowAuthPopup(true);
//       return;
//     }

//     if (!selectedVariant) {
//       toast.error("Product not available");
//       return;
//     }

//     const hasSizes = selectedVariant.sizes && selectedVariant.sizes.length > 0;
//     if (hasSizes) {
//       setShowSizePopup(true);
//     } else {
//       addProductToCart();
//     }
//   };

//   const addProductToCart = () => {
//     if (!selectedVariant || !session) return;

//     const cartItem = {
//       id: `${selectedVariant.id}-${selectedSize || "nosize"}`,
//       productId: product.id,
//       variantId: selectedVariant.id,
//       name: `${product.name} - ${selectedVariant.color}${
//         selectedSize ? ` (Size: ${selectedSize})` : ""
//       }`,
//       price: product.finalPrice,
//       originalPrice: product.basePrice,
//       image: selectedVariant.images[0] || "/placeholder.jpg",
//       quantity: 1,
//       color: selectedVariant.color,
//       size: selectedSize,
//       category: product.category,
//       hasOffer: product.pricingType === "WITH_OFFER",
//       offerMessage: product.offer?.title,
//       discountPercentage: getDiscountPercentage(),
//     };

//     addToCart(cartItem);
//     toast.success(`${product.name} added to cart!`);
//     setShowSizePopup(false);
//   };

//   const handleWishlistClick = async (e: React.MouseEvent) => {
//     e.stopPropagation();

//     if (!session) {
//       setShowAuthPopup(true);
//       return;
//     }

//     try {
//       if (isWishlisted) {
//         await removeFromWishlist(product.id);
//         toast.success(
//           lang === "ar"
//             ? "تمت إزالة المنتج من المفضلة"
//             : "Product removed from wishlist"
//         );
//       } else {
//         await addToWishlist(product.id);
//         toast.success(
//           lang === "ar"
//             ? "تمت إضافة المنتج إلى المفضلة"
//             : "Product added to wishlist"
//         );
//       }
//     } catch (error) {
//       toast.error(lang === "ar" ? "حدث خطأ" : "An error occurred");
//     }
//   };

//   const navigate = (path: string) => {
//     router.push(path);
//   };

//   if (!product.variants || product.variants.length === 0 || !selectedVariant) {
//     return null;
//   }

//   const isOutOfStock = selectedVariant.stock === 0;
//   const currentImages =
//     selectedVariant.images.length > 0
//       ? selectedVariant.images
//       : ["/placeholder.jpg"];

//   // حساب نسبة الخصم
//   const getDiscountPercentage = () => {
//     if (product.pricingType === PricingType.SALE_PRICE && product.salePrice) {
//       return Math.round(
//         ((product.basePrice - product.salePrice) / product.basePrice) * 100
//       );
//     }
//     if (product.pricingType === PricingType.WITH_OFFER && product.offer) {
//       if (product.offer.discountPercentage) {
//         return product.offer.discountPercentage;
//       }
//       if (product.offer.discountAmount) {
//         return Math.round(
//           (product.offer.discountAmount / product.basePrice) * 100
//         );
//       }
//     }
//     return 0;
//   };

//   // عرض السعر فقط
//   const renderPrice = () => {
//     const currency = "EGP";

//     switch (product.pricingType) {
//       case PricingType.SINGLE_PRICE:
//         return (
//           <div className="text-xl font-bold text-primary text-center">
//             {product.finalPrice.toLocaleString()} {currency}
//           </div>
//         );

//       case PricingType.SALE_PRICE:
//         return (
//           <div className="space-y-1">
//             <div className="flex flex-col md:flex-row w-full justify-center items-center gap-2">
//               <span className="text-sm text-gray-500 line-through">
//                 {product.basePrice.toLocaleString()} {currency}
//               </span>
//               <span className="text-sm font-bold text-green-600">
//                 {product.salePrice?.toLocaleString()} {currency}
//               </span>
//             </div>
//             <div className="text-xs text-center text-red-500">
//               {lang === "ar" ? "خصم" : "Discount"} {getDiscountPercentage()}%
//             </div>
//           </div>
//         );

//       case PricingType.WITH_OFFER:
//         return (
//           <div className="space-y-1">
//             <div className="flex items-center gap-2">
//               <span className="text-sm text-gray-500 line-through">
//                 {product.basePrice.toLocaleString()} {currency}
//               </span>
//               <span className="text-xl font-bold text-green-600">
//                 {product.finalPrice.toLocaleString()} {currency}
//               </span>
//             </div>
//           </div>
//         );
//     }
//   };

//   const nextImage = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     setCurrentImageIndex((prev) =>
//       prev === currentImages.length - 1 ? 0 : prev + 1
//     );
//   };

//   const prevImage = (e: React.MouseEvent) => {
//     e.stopPropagation();
//     setCurrentImageIndex((prev) =>
//       prev === 0 ? currentImages.length - 1 : prev - 1
//     );
//   };

//   // عرض الصور المصغرة للمتغيرات المختلفة
//   const renderVariantThumbnails = () => {
//     const visibleVariants = product.variants.slice(0, 4);
//     const remainingVariants = product.variants.length - 4;

//     return (
//       <div className="flex items-center justify-center gap-1 mt-2 px-2">
//         {visibleVariants.map((variant) => (
//           <button
//             key={variant.id}
//             onClick={(e) => {
//               e.stopPropagation();
//               handleVariantChange(variant);
//             }}
//             className={`relative w-10 h-10 rounded-lg overflow-hidden border-2 transition-all ${
//               selectedVariant.id === variant.id
//                 ? "border-primary"
//                 : "border-gray-200 hover:border-gray-300"
//             }`}
//           >
//             <Image
//               quality={80}
//               src={variant.images[0] || "/placeholder.jpg"}
//               alt={variant.color}
//               fill
//               sizes="(max-width: 768px) 100vw, 1200px"
//               className="object-cover"
//             />
//             {variant.stock === 0 && (
//               <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
//                 <div className="w-6 h-0.5 bg-white rotate-45"></div>
//               </div>
//             )}
//           </button>
//         ))}

//         {remainingVariants > 0 && (
//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               setShowAllVariantImages(true);
//             }}
//             className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center text-xs text-gray-600 hover:bg-gray-200"
//           >
//             +{remainingVariants}
//           </button>
//         )}
//       </div>
//     );
//   };

//   // عرض كل صور المتغيرات في مربع منبثق
//   const renderAllVariantImages = () => {
//     if (!showAllVariantImages) return null;

//     return (
//       <div
//         className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
//         onClick={() => setShowAllVariantImages(false)}
//       >
//         <div
//           className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
//           onClick={(e) => e.stopPropagation()}
//         >
//           <div className="p-4 border-b flex justify-between items-center">
//             <h3 className="font-bold text-lg">{product.name}</h3>
//             <button
//               onClick={() => setShowAllVariantImages(false)}
//               className="text-gray-500 hover:text-gray-700"
//             >
//               ✕
//             </button>
//           </div>
//           <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//             {product.variants.map((variant) => (
//               <div
//                 key={variant.id}
//                 className="border rounded-lg overflow-hidden"
//               >
//                 <div className="relative aspect-square">
//                   <Image
//                     quality={80}
//                     sizes="(max-width: 768px) 100vw, 1200px"
//                     src={variant.images[0] || "/placeholder.jpg"}
//                     alt={variant.color}
//                     fill
//                     className="object-cover"
//                   />
//                 </div>
//                 <div className="p-2 text-center">
//                   <div className="font-medium">{variant.color}</div>
//                   <div className="text-sm text-gray-500">
//                     {variant.sizes?.join(", ") || "No sizes"}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Popup لاختيار المقاس
//   const renderSizePopup = () => {
//     if (!showSizePopup || !selectedVariant) return null;

//     const hasSizes = selectedVariant.sizes && selectedVariant.sizes.length > 0;
//     const isOutOfStock = selectedVariant.stock === 0;

//     return (
//       <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
//         <div
//           className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
//           onClick={(e) => e.stopPropagation()}
//         >
//           {/* Header */}
//           <div className="p-4 border-b flex justify-between items-center">
//             <div>
//               <h3 className="font-bold text-lg">{product.name}</h3>
//               <p className="text-sm text-gray-600">{selectedVariant.color}</p>
//             </div>
//             <button
//               onClick={() => setShowSizePopup(false)}
//               className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>

//           {/* Product Preview */}
//           <div className="p-4 border-b">
//             <div className="flex items-start gap-4">
//               <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
//                 <Image
//                   quality={80}
//                   src={selectedVariant.images[0] || "/placeholder.jpg"}
//                   alt={selectedVariant.color}
//                   fill
//                   className="object-cover"
//                 />
//               </div>
//               <div className="flex-1">
//                 <h4 className="font-medium mb-1">{product.name}</h4>
//                 <p className="text-sm text-gray-600 mb-2">
//                   {selectedVariant.color}
//                 </p>
//                 <div className="text-lg font-bold text-primary">
//                   {product.finalPrice.toLocaleString()} EGP
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Size Selection */}
//           <div className="p-4 border-b">
//             <div className="flex items-center justify-between mb-3">
//               <h4 className="font-bold">Select Size</h4>
//               {selectedSize && (
//                 <span className="text-sm text-primary">
//                   Selected: {selectedSize}
//                 </span>
//               )}
//             </div>

//             {hasSizes ? (
//               <div className="grid grid-cols-4 gap-2">
//                 {selectedVariant.sizes?.map((size) => (
//                   <button
//                     key={size}
//                     onClick={() => setSelectedSize(size)}
//                     className={`p-3 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
//                       selectedSize === size
//                         ? "border-primary bg-blue-50 text-primary"
//                         : "border-gray-200 hover:border-gray-300"
//                     }`}
//                   >
//                     <span className="font-medium">{size}</span>
//                     {selectedSize === size && (
//                       <Check className="w-4 h-4 mt-1 text-primary" />
//                     )}
//                   </button>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-4 text-gray-500">
//                 No sizes available for this product
//               </div>
//             )}

//             {/* Size Guide (اختياري) */}
//             <button className="mt-4 text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
//               <AlertCircle className="w-4 h-4" />
//               Size Guide
//             </button>
//           </div>

//           {/* Stock Status */}
//           <div className="p-4 border-b">
//             {isOutOfStock ? (
//               <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2">
//                 <AlertCircle className="w-5 h-5" />
//                 <span>This item is currently out of stock</span>
//               </div>
//             ) : selectedVariant.stock < 10 ? (
//               <div className="bg-yellow-50 text-yellow-700 p-3 rounded-lg flex items-center gap-2">
//                 <AlertCircle className="w-5 h-5" />
//                 <span>Only {selectedVariant.stock} items left in stock</span>
//               </div>
//             ) : (
//               <div className="bg-green-50 text-green-700 p-3 rounded-lg flex items-center gap-2">
//                 <Check className="w-5 h-5" />
//                 <span>In stock - {selectedVariant.stock} items available</span>
//               </div>
//             )}
//           </div>

//           {/* Action Buttons */}
//           <div className="p-4">
//             <button
//               onClick={addProductToCart}
//               disabled={isOutOfStock || (hasSizes && !selectedSize)}
//               className={`w-full py-3 rounded-lg font-bold text-white flex items-center justify-center gap-2 transition-colors ${
//                 isOutOfStock || (hasSizes && !selectedSize)
//                   ? "bg-gray-400 cursor-not-allowed"
//                   : "bg-primary hover:bg-primary/90"
//               }`}
//             >
//               <ShoppingCart className="w-5 h-5" />
//               {isOutOfStock ? "Out of Stock" : "Add to Cart"}
//               {selectedSize && ` - Size: ${selectedSize}`}
//             </button>

//             <button
//               onClick={() => setShowSizePopup(false)}
//               className="w-full mt-2 py-2 text-gray-600 hover:text-gray-800"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const renderAddToCartButton = () => {
//     return (
//       <button
//         onClick={handleAddToCartClick}
//         disabled={isOutOfStock}
//         className={`w-full mt-3 py-2 rounded-lg font-semibold text-xs md:text-sm flex items-center justify-center gap-2 transition-colors ${
//           isOutOfStock
//             ? "bg-gray-300 text-gray-500 cursor-not-allowed"
//             : "bg-primary text-white hover:bg-primary/90"
//         }`}
//       >
//         <ShoppingCart className="w-4 h-4" />
//         {isOutOfStock ? "Out of Stock" : "Add to Cart"}
//       </button>
//     );
//   };

//   // عرض علامة New أو Featured
//   const renderProductBadges = () => {
//     const discountPercentage = getDiscountPercentage();
//     const hasDiscount = discountPercentage > 0;

//     return (
//       <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
//         {hasDiscount && (
//           <div className="px-2 py-1 rounded-lg font-bold text-xs bg-red-600 text-white flex items-center gap-1">
//             <span className={lang === "ar" ? "font-gess" : "font-sans"}>
//               {lang === "ar" ? "خصم" : "Discount"} {discountPercentage}%
//             </span>
//           </div>
//         )}

//         {product.isNew && (
//           <div
//             className={`px-2 py-1 rounded-lg font-bold text-xs flex items-center gap-1 ${
//               lang === "ar"
//                 ? "bg-green-600 text-white"
//                 : "bg-green-600 text-white"
//             }`}
//           >
//             <span className={lang === "ar" ? "font-gess" : "font-sans"}>
//               {lang === "ar" ? "جديد" : "New"}
//             </span>
//           </div>
//         )}

//         {/* علامة Featured */}
//         {product.isFeatured && (
//           <div
//             className={`px-2 py-1 rounded-lg font-bold text-xs flex items-center gap-1 ${
//               lang === "ar"
//                 ? "bg-yellow-600 text-white"
//                 : "bg-yellow-600 text-white"
//             }`}
//           >
//             <Star className="w-3 h-3" />
//             <span className={lang === "ar" ? "font-gess" : "font-sans"}>
//               {lang === "ar" ? "مميز" : "Featured"}
//             </span>
//           </div>
//         )}
//       </div>
//     );
//   };

//   const renderOutOfStockBadge = () => {
//     if (isOutOfStock) {
//       return (
//         <div className="absolute top-3 right-3 z-10">
//           <div
//             className={`px-2 py-1 rounded-lg font-bold text-xs flex items-center gap-1 ${
//               lang === "ar" ? "bg-red-600 text-white" : "bg-red-600 text-white"
//             }`}
//           >
//             <span className={lang === "ar" ? "font-gess" : "font-sans"}>
//               {lang === "ar" ? "نفذ" : "Out of Stock"}
//             </span>
//           </div>
//         </div>
//       );
//     }
//     return null;
//   };

//   // زر Wishlist
//   const renderWishlistButton = () => {
//     return (
//       <button
//         onClick={handleWishlistClick}
//         className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-colors ${
//           isWishlisted
//             ? "bg-red-100 text-red-600 hover:bg-red-200"
//             : "bg-white/90 text-gray-600 hover:bg-white hover:text-red-600"
//         }`}
//         title={
//           isWishlisted
//             ? lang === "ar"
//               ? "إزالة من المفضلة"
//               : "Remove from wishlist"
//             : lang === "ar"
//             ? "أضف إلى المفضلة"
//             : "Add to wishlist"
//         }
//       >
//         <Heart className={`w-4 h-4 ${isWishlisted ? "fill-red-600" : ""}`} />
//       </button>
//     );
//   };

//   return (
//     <>
//       <div
//         className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full border border-gray-100 cursor-pointer flex flex-col relative"
//         onClick={() =>
//           navigate(`/product/${product.id}?color=${selectedVariant.color}`)
//         }
//       >
//         <div className="relative overflow-hidden aspect-square bg-gray-50">
//           <div className="relative w-full h-full">
//             <Image
//               quality={80}
//               fill
//               sizes="(max-width: 768px) 100vw, 1200px"
//               src={currentImages[currentImageIndex]}
//               alt={`${product.name} - ${selectedVariant.color}`}
//               className="w-full h-full object-cover"
//             />

//             {currentImages.length > 1 && (
//               <>
//                 <button
//                   onClick={prevImage}
//                   className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 transition-all z-10 opacity-0 group-hover:opacity-100"
//                 >
//                   <ChevronLeft className="w-4 h-4" />
//                 </button>
//                 <button
//                   onClick={nextImage}
//                   className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 transition-all z-10 opacity-0 group-hover:opacity-100"
//                 >
//                   <ChevronRight className="w-4 h-4" />
//                 </button>
//               </>
//             )}
//           </div>

//           {renderProductBadges()}
//           {renderWishlistButton()}
//           {renderOutOfStockBadge()}

//           {currentImages.length > 1 && (
//             <div className="absolute bottom-3 right-3 z-10">
//               <span className="bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
//                 {currentImageIndex + 1}/{currentImages.length}
//               </span>
//             </div>
//           )}
//         </div>

//         {renderVariantThumbnails()}

//         <div className="p-4 mt-auto">
//           <div className="text-center">
//             <h3 className="font-medium text-lg text-gray-800 mb-1">
//               {product.name}
//             </h3>
//             <p className="text-sm text-gray-600">{selectedVariant.color}</p>
//           </div>
//           {renderPrice()}

//           {renderAddToCartButton()}
//         </div>
//       </div>

//       {renderAllVariantImages()}

//       {renderSizePopup()}

//       <AuthPopup
//         lang={lang}
//         isOpen={showAuthPopup}
//         onClose={() => setShowAuthPopup(false)}
//       />
//     </>
//   );
// }

"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
        className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 h-full border border-gray-100 cursor-pointer flex flex-col relative"
        onClick={() =>
          navigate(`/product/${product.id}?color=${selectedVariant.color}`)
        }
      >
        {/* عرض الصور */}
        <ProductImages
          currentImages={currentImages}
          currentImageIndex={currentImageIndex}
          productName={product.name}
          variantColor={selectedVariant.color}
          onPrevImage={prevImage}
          onNextImage={nextImage}
          lang={lang}
        />

        {/* علامات المنتج */}
        <ProductBadge
          discountPercentage={discountPercentage}
          isNew={product.isNew}
          isFeatured={product.isFeatured}
          lang={lang}
        />

        {/* زر المفضلة */}
        <ProductWishlistButtons
          isWishlisted={isWishlisted}
          onToggleWishlist={handleWishlistToggle}
          lang={lang}
        />

        {/* علامة نفاذ المخزون */}
        <OutOfStockBadge isOutOfStock={isOutOfStock} lang={lang} />

        {/* عرض المتغيرات */}
        <ProductVariants
          variants={product.variants}
          selectedVariantId={selectedVariant.id}
          onVariantChange={handleVariantChange}
          onShowAllVariants={() => setShowAllVariantImages(true)}
        />

        <div className="p-4 mt-auto">
          <div className="text-center">
            <h3 className="font-medium text-lg text-gray-800 mb-1">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600">{selectedVariant.color}</p>
          </div>

          {/* عرض السعر */}
          <ProductPrice
            pricingType={product.pricingType}
            basePrice={product.basePrice}
            finalPrice={product.finalPrice}
            salePrice={product.salePrice}
            discountPercentage={discountPercentage}
            lang={lang}
          />

          {/* زر إضافة للسلة */}
          <AddToCartButton
            isOutOfStock={isOutOfStock}
            onClick={handleAddToCartClick}
            lang={lang}
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
