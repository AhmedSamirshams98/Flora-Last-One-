import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    // التحقق من وجود المستخدم في قاعدة البيانات
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });

    if (!userExists) {
      console.error("User not found in database:", session.user.id);
      return NextResponse.json(
        { error: "المستخدم غير موجود في النظام" },
        { status: 404 }
      );
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: { isDefault: "desc" },
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json({ error: "فشل في جلب العناوين" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    // التحقق من وجود المستخدم في قاعدة البيانات أولاً
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });

    if (!userExists) {
      console.error("User not found in database:", session.user.id);
      return NextResponse.json(
        { error: "المستخدم غير موجود في النظام. يرجى تسجيل الدخول مرة أخرى" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { fullName, phone, address, city, isDefault = false } = body;

    if (
      !fullName?.trim() ||
      !phone?.trim() ||
      !address?.trim() ||
      !city?.trim()
    ) {
      return NextResponse.json(
        { error: "جميع الحقول مطلوبة" },
        { status: 400 }
      );
    }

    if (isDefault) {
      await prisma.address.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
        },
        data: { isDefault: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        userId: session.user.id,
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        isDefault: Boolean(isDefault),
      },
    });

    console.log("Address created successfully:", newAddress.id);
    return NextResponse.json(newAddress, { status: 201 });
  } catch (error) {
    console.error("Error creating address:", error);
  }
}
