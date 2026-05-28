import db from "@/src/db";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import PurchaseReceiptEmail from "@/src/email/PurchaseReceipt";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const resend = new Resend(process.env.RESEND_API_KEY as string);

export async function POST(request: NextRequest) {
    const event = await stripe.webhooks.constructEvent(
        await request.text(),
        request.headers.get("stripe-signature") as string,
        process.env.STRIPE_WEBHOOK_SECRET as string
    );
    
    if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const productId = paymentIntent.metadata.productId;
        const pricePaidInCents = paymentIntent.amount;

        // ✅ Récupérer le charge pour avoir l'email
        const charges = await stripe.charges.list({ payment_intent: paymentIntent.id });
        const email = charges.data[0]?.billing_details?.email;

        const product = await db.product.findUnique({
            where: { id: productId }
        });
        
        if (product == null || email == null) {
            return new NextResponse('Bad Request', { status: 400 });
        }

        const userFields = {
            email,
            orders: { create: { productId, pricePaidInCents } }
        };

        const { orders } = await db.user.upsert({
            where: { email },
            create: userFields,
            update: userFields,
            select: { orders: { orderBy: { createdAt: "desc" }, take: 1 } }
        });

        const downloadVerification = await db.downloadVerification.create({
            data: { 
                productId: product.id,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) 
            },
            select: { id: true }
        });

        await resend.emails.send({
            from: `Support <${process.env.SENDER_EMAIL}>`,
            to: email,
            subject: "Order Confirmation",
            react: PurchaseReceiptEmail({ 
                order: orders[0], 
                product: product, 
                downloadVerificationId: downloadVerification.id 
            })
        });

        return new NextResponse('Success', { status: 200 });
    }
    
    return new NextResponse('Event not handled', { status: 400 });
}