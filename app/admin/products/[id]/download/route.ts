import { NextRequest, NextResponse } from "next/server";
import db from "@/src/db";
import { notFound } from "next/navigation";

// ✅ Version correcte pour Next.js 16
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  
  try {
    const downloadVerification = await db.downloadVerification.findUnique({
      where: { id: id },
      select: {
        product: {
          select: { filePath: true, name: true }
        },
        expiresAt: true
      }
    });

    if (!downloadVerification || downloadVerification.expiresAt < new Date()) {
      return notFound();
    }

    // Rediriger vers le fichier ou retourner l'URL
    return NextResponse.json({ 
      filePath: downloadVerification.product.filePath,
      productName: downloadVerification.product.name
    });
  } catch (error) {
    console.error("Download error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}