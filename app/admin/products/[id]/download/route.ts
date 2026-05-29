import { NextRequest, NextResponse } from "next/server";
import db from "@/src/db";
import { notFound } from "next/navigation";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const downloadVerification = await db.downloadVerification.findUnique({
      where: { id: params.id },
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

    return NextResponse.json({ 
      filePath: downloadVerification.product.filePath 
    });
  } catch (error) {
    console.error("Download error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}