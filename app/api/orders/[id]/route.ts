import db from "@/src/db";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.order.delete({ where: { id } });
  return new NextResponse("Deleted", { status: 200 });
}
