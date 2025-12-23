import path from "path";
import fs from "fs/promises";
import { randomBytes } from "crypto";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const getUploadDir = () => {
  if (process.env.NODE_ENV === "development") {
    return path.join(process.cwd(), "public", "uploads", "home-categories");
  }
  return process.env.UPLOAD_DIR || "/var/www/flora/uploads/home-categories";
};

const UPLOAD_DIR = getUploadDir();

export async function saveCategoryImage(file: File): Promise<string> {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error("نوع الملف غير مدعوم");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("حجم الملف أكبر من 5MB");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const timestamp = Date.now();
  const randomStr = randomBytes(4).toString("hex");
  const originalName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
  const filename = `${timestamp}-${randomStr}-${originalName}`;

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const filePath = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(filePath, buffer);

  return `/uploads/home-categories/${filename}`;
}
