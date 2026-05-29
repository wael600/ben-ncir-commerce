import db from "@/src/db";
import { NextResponse } from "next/server";

export async function GET() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: true },
  });
  return NextResponse.json(orders);
}
