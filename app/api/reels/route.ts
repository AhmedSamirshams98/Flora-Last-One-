import { requireAdmin } from "@/lib/require-session";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const reels = await prisma.reelVideo.findMany({
    orderBy: { id: "desc" },
  });
  return NextResponse.json(reels);
}

export async function POST(request: Request) {
  const gate = await requireAdmin();
  if (gate.error) return gate.error;
  const { url } = await request.json();
  if (!url) return NextResponse.json({ error: "URL مطلوب" }, { status: 400 });

  const reel = await prisma.reelVideo.create({ data: { url } });
  return NextResponse.json(reel);
}
