import { requireAdmin } from "@/lib/require-session";
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
  const gate = await requireAdmin();
  if (gate.error) return gate.error;
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

