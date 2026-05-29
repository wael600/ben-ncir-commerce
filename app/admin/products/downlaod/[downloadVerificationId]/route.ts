import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import db from "@/src/db";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ downloadVerificationId: string }> }
) {
    const { downloadVerificationId } = await params;

    const data = await db.downloadVerification.findUnique({
        where: { id: downloadVerificationId, expiresAt: { gt: new Date() } },
        select: { product: { select: { filePath: true, name: true } } },
    });

    if (!data) {
        return NextResponse.redirect(new URL("/products/download/expired", req.url));
    }

    const product = data.product;
    const { size } = await fs.stat(product.filePath);
    const file = await fs.readFile(product.filePath);
    const extension = product.filePath.split(".").pop();

    return new NextResponse(file, {
        headers: {
            "Content-Disposition": `attachment; filename="${product.name}.${extension}"`,
            "Content-Length": size.toString(),
        },
    });
}
