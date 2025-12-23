import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs/promises";
import { ProductSubtype } from "@prisma/client";

/* =========================
   GET – جلب جميع الأقسام
========================= */
export async function GET() {
  try {
    const categories = await prisma.homeCategory.findMany();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

/* =========================
   POST – إضافة قسم جديد
========================= */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File;
    const category = formData.get("category") as string;
    const categoryValue: ProductSubtype = category as ProductSubtype; // تأكد أن القيمة صحيحة

    if (!file || !category) {
      return NextResponse.json(
        { error: "Image and category are required" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `${Date.now()}-${file.name}`;
    const uploadPath = path.join(process.cwd(), "public/uploads", fileName);

    await fs.mkdir(path.dirname(uploadPath), { recursive: true });
    await fs.writeFile(uploadPath, buffer);

    const imageUrl = `/uploads/${fileName}`;

    const created = await prisma.homeCategory.create({
      data: {
        image: imageUrl,
        category: categoryValue,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to upload category" },
      { status: 500 }
    );
  }
}
