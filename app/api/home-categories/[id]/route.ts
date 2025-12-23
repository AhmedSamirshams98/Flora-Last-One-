import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs/promises";
import { ProductSubtype } from "@prisma/client";
import { saveCategoryImage } from "@/lib/saveCategoryImage";

// Remove the explicit ContextType and use Next.js's built-in types
// params is now a Promise, so we need to await it

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    const category = formData.get("category") as string;

    let imagePath: string | undefined;
    if (file && file.size > 0) {
      imagePath = await saveCategoryImage(file);
    }

    const updated = await prisma.homeCategory.update({
      where: { id },
      data: {
        category: category as ProductSubtype,
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
