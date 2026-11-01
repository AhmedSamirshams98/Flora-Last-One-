"use client";

import { toast } from "sonner";
import { confirmAction } from "@/app/components/AdminConfirm";
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";

import { ProductType, ProductSubtype, PricingType, canonicalSubtype } from "@/types/product";
import ProductCard from "./ProductCard";
import ProductForm from "./ProductForm";

interface Variant {
  color: string;
  sizes: string[];
  price: number;
  images: string[];
  stock: number;
  description?: string;
  imageFiles?: number[];
}

interface ProductFormData {
  name: string;
  category: ProductType;
  subcategory?: ProductSubtype;
  pricingType: PricingType;
  basePrice: number;
  salePrice?: number;
  offerId?: string;
  isNew: boolean;
  isFeatured: boolean;
  inStock: boolean;
  variants: Variant[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  // جلب البيانات
  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, offersRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/offers"),
      ]);

      const productsData = await productsRes.json();
      const offersData = await offersRes.json();

      setProducts(productsData);
      setOffers(offersData);
    } catch (error) {
      console.error("❌ فشل في جلب البيانات:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // التعامل مع التعديل
  const handleEdit = (product: any) => {
    setEditingProduct(product);

    const formData: ProductFormData = {
      name: product.name,
      category: product.category,
      subcategory: canonicalSubtype(product.subcategory) || undefined,
      pricingType: product.pricingType,
      basePrice: product.basePrice,
      salePrice: product.salePrice || undefined,
      offerId: product.offerId || undefined,
      isNew: product.isNew,
      isFeatured: product.isFeatured,
      inStock: product.inStock,
      variants: product.variants.map((variant: any) => ({
        color: variant.color,
        sizes: variant.sizes || [],
        price: variant.price,
        images: variant.images,
        stock: variant.stock,
        description: variant.description || "",
        imageFiles: [],
      })),
    };

    // نقوم بفتح النموذج لاحقاً
    setShowForm(true);
  };

  // التعامل مع الحذف
  const handleDelete = async (id: string) => {
    if (!(await confirmAction("هل أنت متأكد من حذف هذا المنتج؟"))) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("تم حذف المنتج بنجاح");
        fetchData();
      } else {
        throw new Error("فشل في الحذف");
      }
    } catch (error) {
      console.error("❌ فشل في حذف المنتج:", error);
      toast.error("حدث خطأ في حذف المنتج");
    }
  };

  // إرسال النموذج
  const handleFormSubmit = async (data: ProductFormData, files: File[]) => {
    setUploading(true);

    try {
      // إعداد FormData
      const formData = new FormData();

      // 1. إضافة بيانات المنتج
      formData.append("data", JSON.stringify(data));

      // 2. إضافة الملفات بأسماء تبدأ بـ "file_"
      files.forEach((file, index) => {
        formData.append(`file_${index}`, file);
      });

      console.log("📤 إرسال البيانات:", data);
      console.log(`📎 عدد الملفات: ${files.length}`);

      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : "/api/products";

      const method = editingProduct ? "PUT" : "POST";

      console.log(`🌐 الإرسال إلى: ${url} (${method})`);

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("❌ خطأ من الخادم:", error);
        throw new Error(error.error || "فشل في العملية");
      }

      const result = await response.json();
      console.log("✅ استجابة ناجحة:", result);

      toast.success(result.message || "تم حفظ المنتج بنجاح");

      // إعادة تحميل البيانات وإغلاق النموذج
      await fetchData();
      setShowForm(false);
      setEditingProduct(null);
    } catch (error) {
      console.error("❌ فشل في حفظ المنتج:", error);
      toast.error(error instanceof Error ? error.message : "حدث خطأ في حفظ المنتج");
    } finally {
      setUploading(false);
    }
  };

  // إغلاق النموذج
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto" style={{ direction: "rtl" }}>
      {/* الهيدر */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl">
            إدارة المنتجات
          </h1>
          <p className="text-primary/75 mt-1">
            إجمالي المنتجات:{" "}
            <span className="font-semibold">{products.length}</span>
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="fl-btn-oval !min-h-11 text-sm"
        >
          <Plus size={20} />
          إضافة منتج جديد
        </button>
      </div>

      {/* قائمة المنتجات */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-primary/75">جاري تحميل المنتجات...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gold/50 rounded-lg">
          <p className="text-primary/70 text-lg">لا توجد منتجات حتى الآن</p>
          <p className="text-primary/50 mt-2">ابدأ بإضافة منتجك الأول</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* نموذج المنتج */}
      {showForm && (
        <ProductForm
          initialData={
            editingProduct
              ? {
                  name: editingProduct.name,
                  category: editingProduct.category,
                  subcategory: editingProduct.subcategory || undefined,
                  pricingType: editingProduct.pricingType,
                  basePrice: editingProduct.basePrice,
                  salePrice: editingProduct.salePrice || undefined,
                  offerId: editingProduct.offerId || undefined,
                  isNew: editingProduct.isNew,
                  isFeatured: editingProduct.isFeatured,
                  inStock: editingProduct.inStock,
                  variants: editingProduct.variants.map((variant: any) => ({
                    color: variant.color,
                    sizes: variant.sizes || [],
                    price: variant.price,
                    images: variant.images,
                    stock: variant.stock,
                    description: variant.description || "",
                    imageFiles: [],
                  })),
                }
              : undefined
          }
          offers={offers}
          onSubmit={handleFormSubmit}
          onCancel={handleCancelForm}
          uploading={uploading}
          isEditing={!!editingProduct}
        />
      )}
    </div>
  );
}
