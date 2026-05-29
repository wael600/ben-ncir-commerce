import db from "@/src/db";
import { NextResponse } from "next/server";

export async function GET() {
  const products = await db.product.findMany({
    where: { isAvailableForPurchase: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(products);
}
