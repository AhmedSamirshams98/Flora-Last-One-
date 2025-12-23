import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs/promises";

// PUT – تعديل قسم
export async function PUT(req: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params; // الآن id متوفر مباشرة
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    const category = formData.get("category") as string;

    let imagePath: string | undefined = undefined;

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
        category,
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

// DELETE – حذف قسم
export async function DELETE(req: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
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
