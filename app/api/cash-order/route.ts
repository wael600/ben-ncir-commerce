import db from "@/src/db";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { render } from "@react-email/render";
import PurchaseReceiptEmail from "@/src/email/PurchaseReceipt";

const resend = new Resend(process.env.RESEND_API_KEY as string);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Cash order body:", body);

    const { productId, name, phone, place } = body;

    if (!productId) {
      return new NextResponse("Missing productId", { status: 400 });
    }

    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    const fakeEmail = phone
      ? `${phone.replace(/\s/g, "")}@cash.local`
      : `anonymous-${Date.now()}@cash.local`;

    const userFields = {
      email: fakeEmail,
      orders: { create: { productId, pricePaidInCents: product.priceInCents } }
    };

    const { orders } = await db.user.upsert({
      where: { email: fakeEmail },
      create: userFields,
      update: userFields,
      select: { orders: { orderBy: { createdAt: "desc" }, take: 1 } }
    });

    const order = orders[0];

    const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
    let fixedImagePath = product.imagePath;
    if (fixedImagePath && !fixedImagePath.startsWith("http")) {
      fixedImagePath = fixedImagePath.replace(/^public\//, "").replace(/^\//, "");
      fixedImagePath = `${serverUrl}/${fixedImagePath}`;
    }

    try {
      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: process.env.ADMIN_EMAIL as string,
        subject: "New Cash Order - " + product.name,
        html: `
          <div style="font-family: sans-serif;">
            <h2>New Cash Order ??</h2>
            <p><strong>Product:</strong> ${product.name}</p>
            <p><strong>Customer:</strong> ${name || "Anonymous"}</p>
            <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
            <p><strong>Place:</strong> ${place || "Not provided"}</p>
            <p><strong>Amount:</strong> TND ${(product.priceInCents / 100).toFixed(3)}</p>
          </div>
        `
      });
    } catch (emailError) {
      console.error("Email failed:", emailError);
    }

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.error("Cash order error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
