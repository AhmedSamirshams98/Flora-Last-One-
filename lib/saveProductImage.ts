import path from "path";
import fs from "fs/promises";
import { randomBytes } from "crypto";
import sharp from "sharp";

// ==============================
// 📌 تحديد مسار الرفع حسب البيئة
// ==============================
const getUploadDir = () => {
  if (process.env.NODE_ENV === "development") {
    return path.join(process.cwd(), "public", "uploads", "products");
  }
  return process.env.UPLOAD_DIR_PRODUCTS || "/var/www/flora/uploads/products";
};

const UPLOAD_DIR = getUploadDir();

// ==============================
// 📌 الإعدادات
// ==============================
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// ==============================
// 📌 رفع + ضغط + تحويل صورة منتج مع Debugging
// ==============================
export async function saveProductImage(file: File): Promise<string> {
  try {
    console.log("🔹 Start processing file:", file.name, "Type:", file.type, "Size:", file.size);

    // نوع الملف
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      console.error("❌ File type not allowed:", file.type);
      throw new Error("نوع الملف غير مدعوم");
    }

    // حجم الملف
    if (file.size > MAX_FILE_SIZE) {
      console.error("❌ File size exceeds limit:", file.size);
      throw new Error("حجم الملف أكبر من 5MB");
    }

    // قراءة الملف
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log("📥 File read into buffer, size:", buffer.length);

    // اسم آمن + فريد
    const timestamp = Date.now();
    const randomStr = randomBytes(4).toString("hex");
    const originalName = file.name.replace(/[^a-zA-Z0-9]/g, "_");
    const filename = `${timestamp}-${randomStr}-${originalName}.webp`;

    // ضغط وتحويل إلى WebP
    const compressedBuffer = await sharp(buffer)
      .resize({ width: 800, height: 800, fit: "cover" })
      .webp({ quality: 80 })
      .toBuffer();

    console.log("📦 Image compressed, size:", compressedBuffer.length);

    // إنشاء المجلد إذا لم يكن موجود
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    console.log("📁 Upload folder ensured:", UPLOAD_DIR);

    // حفظ الملف
    const filePath = path.join(UPLOAD_DIR, filename);
    await fs.writeFile(filePath, compressedBuffer);
    console.log("✅ Product image saved:", filePath);

    // إعادة المسار العام
    const publicPath =
      process.env.NODE_ENV === "development"
        ? `/uploads/products/${filename}`
        : `/api/images/products/${filename}`;

    console.log("🔗 Public path to access image:", publicPath);

    return publicPath;
  } catch (error) {
    console.error("❌ Error in saveProductImage:", error);
    throw error;
  }
}
