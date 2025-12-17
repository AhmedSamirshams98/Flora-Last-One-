// import { NextRequest, NextResponse } from "next/server";
// import { uploadService } from "@/lib/upload";

// export async function POST(request: NextRequest) {
//   try {
//     const formData = await request.formData();
//     const file = formData.get("file") as File;

//     if (!file) {
//       return NextResponse.json(
//         { error: "No file provided" },
//         { status: 400 }
//       );
//     }

//     // التحقق من نوع الملف
//     if (!file.type.startsWith('image/')) {
//       return NextResponse.json(
//         { error: "File must be an image" },
//         { status: 400 }
//       );
//     }

//     // التحقق من حجم الملف (5MB كحد أقصى)
//     if (file.size > 5 * 1024 * 1024) {
//       return NextResponse.json(
//         { error: "File size must be less than 5MB" },
//         { status: 400 }
//       );
//     }

//     const imageUrl = await uploadService.saveFile(file);

//     return NextResponse.json({ 
//       success: true, 
//       imageUrl 
//     });
//   } catch (error) {
//     console.error("Upload error:", error);
//     return NextResponse.json(
//       { error: "Failed to upload file" },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(request: NextRequest) {
//   try {
//     const { imageUrl } = await request.json();

//     if (!imageUrl) {
//       return NextResponse.json(
//         { error: "Image URL is required" },
//         { status: 400 }
//       );
//     }

//     await uploadService.deleteFile(imageUrl);

//     return NextResponse.json({ 
//       success: true,
//       message: "File deleted successfully" 
//     });
//   } catch (error) {
//     console.error("Delete file error:", error);
//     return NextResponse.json(
//       { error: "Failed to delete file" },
//       { status: 500 }
//     );
//   }
// }