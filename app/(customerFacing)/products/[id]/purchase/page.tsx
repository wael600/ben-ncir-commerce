import db from "@/src/db";
import { notFound } from "next/navigation";
import Stripe from "stripe";
import { CheckoutForm } from "./_component/CheckoutForm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

interface PurchasePageProps {
  params: Promise<{ id: string }>;
}

export default async function PurchasePage({ params }: PurchasePageProps) {
  const { id } = await params;

  const product = await db.product.findUnique({
    where: { id },
  });

  if (product == null) return notFound();

  const paymentIntent = await stripe.paymentIntents.create({
    amount: product.priceInCents,
    currency: "usd",
    metadata: { productId: product.id },
  });

  if (paymentIntent.client_secret == null) {
    throw new Error("Failed to create payment intent");
  }

  return (
    <CheckoutForm
      clientSecret={paymentIntent.client_secret}
      product={{
        id: product.id,
        imagePath: product.imagePath,
        name: product.name,
        priceInCents: product.priceInCents,
        description: product.description,
      }}
    />
  );
}
