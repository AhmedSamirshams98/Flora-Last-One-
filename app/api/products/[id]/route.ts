import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveProductImage } from "@/lib/saveProductImage";
import { calculateFinalPrice } from "@/lib/pricing";

// ==============================
// 📌 GET منتج واحد
// ==============================
export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { variants: true, offer: true },
  });

  if (!product) {
    return NextResponse.json({ error: "غير موجود" }, { status: 404 });
  }

  return NextResponse.json(product);
}

// ==============================
// 📌 PUT تحديث منتج
// ==============================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const dataString = formData.get("data") as string;

    if (!dataString) {
      return NextResponse.json(
        { error: "بيانات المنتج مطلوبة" },
        { status: 400 }
      );
    }

    const data = JSON.parse(dataString);

    console.log(`🔄 تحديث المنتج: ${id}`);

    // ==============================
    // 📸 رفع الصور الجديدة بالترتيب
    // ==============================
    const uploadedImages: string[] = [];
    const fileKeys = Array.from(formData.keys()).filter((key) =>
      key.startsWith("file_")
    );

    // رتب المفاتيح حسب الرقم
    fileKeys.sort((a, b) => {
      const numA = parseInt(a.split("_")[1]);
      const numB = parseInt(b.split("_")[1]);
      return numA - numB;
    });

    console.log(`📋 عدد الملفات الجديدة: ${fileKeys.length}`);

    // ارفع الملفات بالترتيب
    for (const key of fileKeys) {
      const value = formData.get(key);
      if (value instanceof File && value.size > 0) {
        try {
          const imageUrl = await saveProductImage(value);
          uploadedImages.push(imageUrl);
          console.log(`✅ [${key}] تم الرفع: ${imageUrl}`);
        } catch (error) {
          console.error(`❌ فشل رفع [${key}]:`, error);
          throw new Error(`فشل في رفع الصورة: ${key}`);
        }
      }
    }

    console.log(`📊 إجمالي الصور الجديدة: ${uploadedImages.length}`);

    // ==============================
    // 💰 حساب السعر
    // ==============================
    const pricing = await calculateFinalPrice({
      basePrice: data.basePrice,
      salePrice: data.salePrice,
      offerId: data.offerId,
    });

    // ==============================
    // 🎯 معالجة المتغيرات
    // ==============================
    const processedVariants =
      data.variants?.map((variant: any, index: number) => {
        const images: string[] = [];

        console.log(`🔍 معالجة المتغير ${index}:`, {
          color: variant.color,
          imageFiles: variant.imageFiles,
          existingImages: variant.images?.length || 0,
        });

        // 1. إضافة الصور الجديدة المرفوعة
        if (variant.imageFiles && Array.isArray(variant.imageFiles)) {
          variant.imageFiles.forEach((fileIndex: number) => {
            if (uploadedImages[fileIndex]) {
              images.push(uploadedImages[fileIndex]);
              console.log(
                `  ✅ صورة جديدة [${fileIndex}]: ${uploadedImages[fileIndex]}`
              );
            } else {
              console.warn(`  ⚠️ صورة [${fileIndex}] غير موجودة`);
            }
          });
        }

        // 2. الاحتفاظ بالصور الموجودة مسبقاً (غير blob)
        if (variant.images && Array.isArray(variant.images)) {
          variant.images.forEach((img: string) => {
            if (!img.startsWith("blob:") && !images.includes(img)) {
              images.push(img);
              console.log(`  ♻️ صورة قديمة محفوظة: ${img}`);
            }
          });
        }

        // 3. إذا لم توجد صور، أضف placeholder
        if (images.length === 0) {
          console.warn(`  ⚠️ لا توجد صور للمتغير ${index}، إضافة placeholder`);
          images.push("/placeholder.jpg");
        }

        console.log(`  ✅ إجمالي الصور: ${images.length}`);

        return {
          color: variant.color || "Default",
          sizes: Array.isArray(variant.sizes) ? variant.sizes : [],
          price: variant.price || pricing.finalPrice,
          images,
          stock: variant.stock || 0,
          description: variant.description || "",
          code: variant.code || `VAR-${Date.now()}-${index}`,
        };
      }) || [];

    console.log(`🎨 إجمالي المتغيرات المعالجة: ${processedVariants.length}`);

    // ==============================
    // 🔄 تحديث المنتج والمتغيرات
    // ==============================

    // أولاً: حذف جميع المتغيرات القديمة
    await prisma.productVariant.deleteMany({
      where: { productId: id },
    });

    console.log(`🗑️ تم حذف المتغيرات القديمة`);

    // ثانياً: تحديث المنتج وإنشاء المتغيرات الجديدة
    const updated = await prisma.product.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        subcategory: data.subcategory ?? null,
        basePrice: data.basePrice,
        salePrice: data.salePrice ?? null,
        offerId: pricing.offerId,
        offerPrice: pricing.offerPrice,
        pricingType: pricing.pricingType,
        finalPrice: pricing.finalPrice,
        isNew: data.isNew ?? false,
        isFeatured: data.isFeatured ?? false,
        inStock: data.inStock ?? true,
        variants: {
          create: processedVariants,
        },
      },
      include: {
        variants: true,
        offer: true,
      },
    });

    console.log(`✅ تم تحديث المنتج بنجاح: ${id}`);
    console.log(`📦 المتغيرات الجديدة: ${updated.variants.length}`);

    return NextResponse.json({
      success: true,
      product: updated,
      message: "✅ تم تحديث المنتج بنجاح",
    });
  } catch (error) {
    console.error("❌ خطأ في تحديث المنتج:", error);
    return NextResponse.json(
      {
        error: "فشل في التحديث",
        details: error instanceof Error ? error.message : "خطأ غير معروف",
      },
      { status: 500 }
    );
  }
}

// ==============================
// 📌 DELETE حذف
// ==============================
export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log(`🗑️ حذف المنتج: ${id}`);

    // حذف المنتج (سيتم حذف المتغيرات تلقائياً بسبب cascade)
    await prisma.product.delete({
      where: { id },
    });

    console.log(`✅ تم حذف المنتج بنجاح: ${id}`);

    return NextResponse.json({
      success: true,
      message: "تم الحذف بنجاح",
    });
  } catch (error) {
    console.error("❌ خطأ في حذف المنتج:", error);
    return NextResponse.json(
      {
        error: "فشل في الحذف",
        details: error instanceof Error ? error.message : "خطأ غير معروف",
      },
      { status: 500 }
    );
  }
}
