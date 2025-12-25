import Image from "next/image";
import { Edit, Trash2 } from "lucide-react";
import { Product, translateSubcategory } from "@/types/product";
import { useRouter } from "next/router";
import { usePathname } from "next/navigation";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export default function ProductCard({
  product,
  onEdit,
  onDelete,
}: ProductCardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const lang: "ar" | "en" = pathname.startsWith("/ar") ? "ar" : "en";

  const finalPrice = product.finalPrice;
  const discountPercentage =
    finalPrice < product.basePrice
      ? Math.round(((product.basePrice - finalPrice) / product.basePrice) * 100)
      : 0;

  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition">
      {product.variants[0]?.images[0] && (
        <div className="relative w-full h-48 mb-4">
          <Image
            src={product.variants[0].images[0]}
            alt={product.name}
            fill
            className="object-cover rounded"
          />
        </div>
      )}

      <h3 className="font-bold text-lg mb-2">{product.name}</h3>
      <p className="text-sm text-gray-600 mb-3">
        {translateSubcategory(product.subcategory || null, lang)}
      </p>

      {/* تفاصيل السعر */}
      <div className="mb-3">
        {product.pricingType === "SINGLE_PRICE" ? (
          <span className="text-2xl font-bold text-gray-900">
            {finalPrice.toLocaleString()} ج.م
          </span>
        ) : (
          <div className="space-y-1">
            <div className="text-gray-400 line-through text-sm">
              {product.basePrice.toLocaleString()} ج.م
            </div>
            <div className="text-2xl font-bold text-red-600">
              {finalPrice.toLocaleString()} ج.م
            </div>
            {discountPercentage > 0 && (
              <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs">
                خصم {discountPercentage}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* معلومات المنتج */}
      <div className="text-sm text-gray-600 space-y-1">
        <div>المخزون: {product.inStock ? "متوفر" : "غير متوفر"}</div>
        <div>
          القطع: {product.variants.reduce((sum, v) => sum + v.stock, 0)}
        </div>
        <div>الألوان: {product.variants.length}</div>
      </div>

      {/* أزرار التحكم */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onEdit(product)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded flex items-center justify-center gap-2"
        >
          <Edit size={16} />
          تعديل
        </button>
        <button
          onClick={() => {
            if (window.confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
              onDelete(product.id);
            }
          }}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded flex items-center justify-center gap-2"
        >
          <Trash2 size={16} />
          حذف
        </button>
      </div>
    </div>
  );
}
