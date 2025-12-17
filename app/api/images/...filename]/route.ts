import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = await params;
    
    // التحقق من امتداد الملف
    const ext = path.extname(filename).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    
    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }

    // المسار المطلق للملف على VPS
    const UPLOAD_DIR = process.env.UPLOAD_DIR || '/var/www/flora/uploads';
    const filePath = path.join(UPLOAD_DIR, filename);

    console.log('Looking for image at:', filePath);
    console.log('File exists?', fs.existsSync(filePath));

    // التحقق من وجود الملف
    if (!fs.existsSync(filePath)) {
      console.error('Image not found:', filePath);
      return NextResponse.json(
        { 
          error: 'Image not found',
          path: filePath,
          uploadDir: UPLOAD_DIR,
          filename: filename 
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

    // إرجاع الصورة
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': stats.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Image serving error:', error);
    return NextResponse.json(
      { error: 'Failed to serve image', details: String(error) },
      { status: 500 }
    );
  }
}