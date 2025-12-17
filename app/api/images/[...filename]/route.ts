import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string[] }> }
) {
  try {
    // ✅ في Next.js 13+ مع [...filename], filename هي string[]
    const { filename } = await context.params;
    
    // دمج الأجزاء لإنشاء اسم الملف الكامل
    const fullFilename = filename.join('/');
    
    if (!fullFilename || fullFilename.includes('..')) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      );
    }

    // التحقق من امتداد الملف
    const ext = path.extname(fullFilename).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    
    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }

    // المسار المطلق للملف
    const UPLOAD_DIR = process.env.UPLOAD_DIR || '/var/www/flora/uploads';
    const filePath = path.join(UPLOAD_DIR, fullFilename);

    console.log('🔍 Looking for image at:', filePath);
    console.log('🔍 Full filename:', fullFilename);

    // التحقق من وجود الملف
    if (!fs.existsSync(filePath)) {
      console.error('❌ Image not found:', filePath);
      return NextResponse.json(
        { 
          error: 'Image not found',
          path: filePath,
          filename: fullFilename,
          uploadDir: UPLOAD_DIR
        },
        { status: 404 }
      );
    }

    // قراءة الملف
    const fileBuffer = fs.readFileSync(filePath);
    const stats = fs.statSync(filePath);
    
    // تحديد نوع المحتوى
    let contentType = 'image/jpeg';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.svg') contentType = 'image/svg+xml';

    console.log('✅ Serving image:', fullFilename, 'Size:', stats.size, 'bytes');

    // إرجاع الصورة
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': stats.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('❌ Image serving error:', error);
    return NextResponse.json(
      { error: 'Failed to serve image', details: String(error) },
      { status: 500 }
    );
  }
}

// ✅ أضف HEAD method
export async function HEAD(
  request: NextRequest,
  context: { params: Promise<{ filename: string[] }> }
) {
  try {
    const { filename } = await context.params;
    const fullFilename = filename.join('/');
    const ext = path.extname(fullFilename).toLowerCase();
    
    if (!['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)) {
      return new NextResponse(null, { status: 400 });
    }

    const UPLOAD_DIR = process.env.UPLOAD_DIR || '/var/www/flora/uploads';
    const filePath = path.join(UPLOAD_DIR, fullFilename);

    if (!fs.existsSync(filePath)) {
      return new NextResponse(null, { status: 404 });
    }

    const stats = fs.statSync(filePath);
    
    let contentType = 'image/jpeg';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.svg') contentType = 'image/svg+xml';

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': stats.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}