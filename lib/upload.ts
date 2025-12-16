// import path from 'path';
// import fs from 'fs/promises';

// export class UploadService {
//   private getUploadPath(): string {
//     // استخدم نفس المسار في كلا البيئتين
//     return path.join(process.cwd(), 'public/uploads');
//   }

//   private getPublicUrl(filename: string): string {
//     // استخدم المسار النسبي الذي يعمل في كلا البيئتين
//     return `/uploads/${filename}`;
//   }

//   async saveFile(file: File): Promise<string> {
//     try {
//       const bytes = await file.arrayBuffer();
//       const buffer = Buffer.from(bytes);
      
//       // إنشاء اسم فريد للملف
//       const timestamp = Date.now();
//       const randomString = Math.random().toString(36).substring(2, 8);
//       const originalName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
//       const filename = `${timestamp}-${randomString}-${originalName}`;
      
//       const uploadDir = this.getUploadPath();
//       const filePath = path.join(uploadDir, filename);
      
//       // التأكد من وجود المجلد
//       await fs.mkdir(uploadDir, { recursive: true });
      
//       // حفظ الملف
//       await fs.writeFile(filePath, buffer);
      
//       console.log('File saved to:', filePath);
      
//       return this.getPublicUrl(filename);
//     } catch (error) {
//       console.error('Error saving file:', error);
//       throw new Error('Failed to save file');
//     }
//   }

//   async deleteFile(imageUrl: string): Promise<void> {
//     try {
//       const filename = path.basename(imageUrl);
//       const uploadDir = this.getUploadPath();
//       const filePath = path.join(uploadDir, filename);
      
//       await fs.unlink(filePath);
//       console.log('File deleted:', filePath);
//     } catch (error) {
//       console.error('Error deleting file:', error);
//     }
//   }
// }

// export const uploadService = new UploadService();
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';

export class UploadService {
  private getUploadPath(): string {
    return path.join(process.cwd(), 'public/uploads');
  }

  private getPublicUrl(filename: string): string {
    return `/uploads/${filename}`;
  }

  async saveFile(file: File): Promise<string> {
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // إنشاء اسم فريد للملف
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 8);
      const originalName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const filename = `${timestamp}-${randomString}-${originalName}`;

      const uploadDir = this.getUploadPath();
      const filePath = path.join(uploadDir, filename);

      // التأكد من وجود المجلد
      await fs.mkdir(uploadDir, { recursive: true });

      // ضغط الصورة باستخدام sharp
      const optimizedBuffer = await sharp(buffer)
        .resize({ width: 800 }) // يمكن تعديل الحجم حسب الحاجة
        .jpeg({ quality: 80 })  // ضغط JPEG بنسبة 80
        .toBuffer();

      // حفظ الملف المضغوط
      await fs.writeFile(filePath, optimizedBuffer);

      console.log('File saved to:', filePath);
      return this.getPublicUrl(filename);
    } catch (error) {
      console.error('Error saving file:', error);
      throw new Error('Failed to save file');
    }
  }

  async deleteFile(imageUrl: string): Promise<void> {
    try {
      const filename = path.basename(imageUrl);
      const uploadDir = this.getUploadPath();
      const filePath = path.join(uploadDir, filename);

      await fs.unlink(filePath);
      console.log('File deleted:', filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }
}

export const uploadService = new UploadService();
