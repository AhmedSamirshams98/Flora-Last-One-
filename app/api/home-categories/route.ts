import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProductType, ProductSubtype } from "@prisma/client";
import { saveCategoryImage } from "@/lib/saveCategoryImage";

// ========================= GET – جلب جميع الأقسام ========================
export async function GET() {
  try {
    const categories = await prisma.homeCategory.findMany();
    return NextResponse.json(categories);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

// ========================= POST – إضافة قسم جديد ========================
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;
    const categoryStr = formData.get("category") as string;
    const subcategoryStr = formData.get("subcategory") as string | null;

    if (!file || !categoryStr) {
      return NextResponse.json({ error: "Image and category are required" }, { status: 400 });
    }

    // تحقق من صحة النوع
    if (categoryStr !== "SHOE" && categoryStr !== "BAG") {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const imageUrl = await saveCategoryImage(file);

    const created = await prisma.homeCategory.create({
      data: {
        image: imageUrl,
        category: categoryStr as ProductType,
        subcategory: subcategoryStr ? (subcategoryStr as ProductSubtype) : null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to upload category" }, { status: 500 });
  }
}

// ========================= PUT – تعديل قسم ========================
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

// ========================= DELETE – حذف قسم ========================
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.homeCategory.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
