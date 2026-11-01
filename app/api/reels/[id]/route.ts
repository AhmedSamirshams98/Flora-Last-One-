import { requireAdmin } from "@/lib/require-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// تحديث Reel
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // هنا يكون Promise
) {
  const gate = await requireAdmin();
  if (gate.error) return gate.error;
  const { id } = await params; // ⚡ unwrap الـ Promise
  const { url } = await request.json();

  if (!url)
    return NextResponse.json({ error: "URL مطلوب" }, { status: 400 });

  const updated = await prisma.reelVideo.update({
    where: { id },
    data: { url },
  });

  return NextResponse.json(updated);
}

// حذف Reel
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // هنا يكون Promise
) {
  const gate = await requireAdmin();
  if (gate.error) return gate.error;
  const { id } = await params; // ⚡ unwrap الـ Promise

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  await prisma.reelVideo.delete({
    where: { id },
  });

  return NextResponse.json({ message: "Reel deleted" }, { status: 200 });
}
