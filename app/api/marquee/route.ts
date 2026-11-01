import { requireAdmin } from "@/lib/require-session";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const marquee = await prisma.marquee.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(marquee ? [marquee] : []);
  } catch (error) {
    return NextResponse.json({ error: "فشل في جلب النص" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const gate = await requireAdmin();
  if (gate.error) return gate.error;
  try {
    const data = await request.json();

    await prisma.marquee.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // إنشاء نص جديد
    const marquee = await prisma.marquee.create({
      data: {
        text: data.text,
        textEn: data.textEn || null,
        isActive: true,
      },
    });

    return NextResponse.json(marquee, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "فشل في حفظ النص" }, { status: 500 });
  }
}

export async function DELETE() {
  const gate = await requireAdmin();
  if (gate.error) return gate.error;
  try {
    const activeMarquee = await prisma.marquee.findFirst({
      where: { isActive: true },
    });

    if (!activeMarquee) {
      return NextResponse.json(
        { message: "لا يوجد نص نشط للحذف" },
        { status: 404 }
      );
    }

    await prisma.marquee.delete({
      where: { id: activeMarquee.id },
    });

    return NextResponse.json({
      success: true,
      message: "تم حذف النص بنجاح",
      deletedMarquee: {
        id: activeMarquee.id,
        text: activeMarquee.text,
        textEn: activeMarquee.textEn,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "فشل في حذف النص" }, { status: 500 });
  }
}
