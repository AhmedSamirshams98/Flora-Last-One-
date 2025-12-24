import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProductType, ProductSubtype } from "@prisma/client";
import { saveCategoryImage } from "@/lib/saveCategoryImage";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    const categoryStr = formData.get("category") as string;
    const subcategoryStr = formData.get("subcategory") as string | null;

    let imagePath: string | undefined;
    if (file && file.size > 0) {
      imagePath = await saveCategoryImage(file);
    }

    // تحقق من صحة النوع العام
    if (categoryStr !== "SHOE" && categoryStr !== "BAG") {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // تحقق من صحة النوع الفرعي إذا موجود
    const validSubcategories: Record<string, string[]> = {
      SHOE: [
        "ALL_SHOES",
        "WINTER_BOOTS",
        "SNEAKERS",
        "PUMPS",
        "BALLERINAS",
        "LOAFERS",
        "SLIPPERS",
        "SANDALS",
      ],
      BAG: [
        "ALL_BAGS",
        "HAND_BAGS",
        "SHOULDER_BAGS",
        "CROSSBODY_BAGS",
        "CLUTCH_BAGS",
        "BACKPACKS",
        "WALLETS",
      ],
    };
    if (
      subcategoryStr &&
      !validSubcategories[categoryStr].includes(subcategoryStr)
    ) {
      return NextResponse.json(
        { error: "Invalid subcategory" },
        { status: 400 }
      );
    }

    const updated = await prisma.homeCategory.update({
      where: { id },
      data: {
        category: categoryStr as ProductType,
        subcategory: subcategoryStr ? (subcategoryStr as ProductSubtype) : null,
        ...(imagePath && { image: imagePath }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

/* =========================
   DELETE – حذف قسم
========================= */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } } // ✅ تم التعديل هنا
) {
  try {
    const { id } =  params;
    await prisma.homeCategory.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
