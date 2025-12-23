import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs/promises";
import { ProductSubtype } from "@prisma/client";

// Remove the explicit ContextType and use Next.js's built-in types
// params is now a Promise, so we need to await it

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params promise

    const { id } = await params;
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    const category = formData.get("category") as string;
    const categoryValue: ProductSubtype = category as ProductSubtype; // تأكد أن القيمة صحيحة

    let imagePath: string | undefined;

    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = `${Date.now()}-${file.name}`;
      const uploadPath = path.join(process.cwd(), "public/uploads", fileName);

      await fs.mkdir(path.dirname(uploadPath), { recursive: true });
      await fs.writeFile(uploadPath, buffer);

      imagePath = `/uploads/${fileName}`;
    }

    const updated = await prisma.homeCategory.update({
      where: { id },
      data: {
        category: categoryValue,
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await the params promise
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
