import path from "path";
import fs from "fs/promises";
import { randomBytes } from "crypto";
import sharp from "sharp";

const getUploadDir = () => {
  if (process.env.NODE_ENV === "development") {
    return path.join(process.cwd(), "public", "uploads", "offers");
  }
  return process.env.UPLOAD_DIR || "/var/www/flora/uploads/offers";
};

const UPLOAD_DIR = getUploadDir();
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

/**
 * حفظ الصورة مع ضغطها وتحويلها إلى WebP
 */
export async function saveOfferImage(file: File): Promise<string> {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error("نوع الملف غير مدعوم");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("حجم الملف أكبر من 5MB");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // إنشاء اسم فريد للملف
  const timestamp = Date.now();
  const randomStr = randomBytes(4).toString("hex");
  const originalName = file.name.replace(/[^a-zA-Z0-9]/g, "_");

  // ضغط وتحويل الصورة إلى WebP
  const compressedBuffer = await sharp(buffer)
    .resize({ width: 410, height: 535, fit: "cover" }) // يطابق أبعاد العرض
    .webp({ quality: 75 })
    .toBuffer();

  const filename = `${timestamp}-${randomStr}-${originalName}.webp`;

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const filePath = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(filePath, compressedBuffer);

  console.log("✓ Offer image saved:", filePath);
  return `/api/images/offers/${filename}`;
}
