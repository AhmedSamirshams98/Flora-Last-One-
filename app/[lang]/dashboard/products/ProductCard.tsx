import { confirmAction } from "@/app/components/AdminConfirm";
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
  const lang: "ar" | "en" = pathname.startsWith("/ar") ? "ar" : "en";

  const finalPrice = product.finalPrice;
  const discountPercentage =
    finalPrice < product.basePrice
      ? Math.round(((product.basePrice - finalPrice) / product.basePrice) * 100)
      : 0;

  return (
    <div className="fl-pcard">
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

      <h3 className="fl-display text-xl text-primary mb-1">{product.name}</h3>
      <p className="text-sm text-primary/75 mb-3">
        {translateSubcategory(product.subcategory || null, lang)}
      </p>

      {/* تفاصيل السعر */}
      <div className="mb-3">
        {product.pricingType === "SINGLE_PRICE" ? (
          <span className="fl-display text-2xl text-primary">
            {finalPrice.toLocaleString()} ج.م
          </span>
        ) : (
          <div className="space-y-1">
            <div className="text-primary/50 line-through text-sm">
              {product.basePrice.toLocaleString()} ج.م
            </div>
            <div className="fl-display text-2xl text-primary">
              {finalPrice.toLocaleString()} ج.م
            </div>
            {discountPercentage > 0 && (
              <span className="bg-gold/25 text-primary px-2 py-1 rounded text-xs">
                خصم {discountPercentage}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* معلومات المنتج */}
      <div className="text-sm text-primary/75 space-y-1">
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
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground min-h-11 rounded-full flex items-center justify-center gap-2"
        >
          <Edit size={16} />
          تعديل
        </button>
        <button
          onClick={async () => {
            if (await confirmAction("هل أنت متأكد من حذف هذا المنتج؟")) {
              onDelete(product.id);
            }
          }}
          className="flex-1 fl-danger min-h-11 rounded-full flex items-center justify-center gap-2"
        >
          <Trash2 size={16} />
          حذف
        </button>
      </div>
    </div>
  );
}
