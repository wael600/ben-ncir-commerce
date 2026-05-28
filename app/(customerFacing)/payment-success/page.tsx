import { formatPrice } from "@/lib/formatters";
import Image from "next/image";
import Stripe from "stripe";
import { notFound } from "next/navigation";
import db from "@/src/db";
import { Button } from "@/components/ui/button";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default async function PaymentSuccessPage({ 
    searchParams 
}: { 
    searchParams: Promise<{ payment_intent: string }> 
}) {
    const { payment_intent } = await searchParams;
    
    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent);
    
    if (paymentIntent.metadata.productId == null) return notFound();
    
    const product = await db.product.findUnique({ 
        where: { id: paymentIntent.metadata.productId } 
    });
    
    if (product == null) return notFound();
    
    // ✅ Vrai statut depuis Stripe
    const isSuccess = paymentIntent.status === "succeeded";
    
    let fixedImagePath = product.imagePath;
    if (fixedImagePath) {
        fixedImagePath = fixedImagePath.replace(/^public\//, '');
        if (!fixedImagePath.startsWith('/') && !fixedImagePath.startsWith('http')) {
            fixedImagePath = '/' + fixedImagePath;
        }
    }
    
    return (
        <div className="max-w-5xl w-full mx-auto space-y-8 p-6">
            <h1 className={`text-4xl font-bold ${isSuccess ? "text-green-600" : "text-red-600"}`}>
                {isSuccess ? "Payment Successful! 🎉" : "Payment Failed ❌"}
            </h1>

            <div className="flex gap-6 items-center bg-white rounded-xl shadow p-4 border border-gray-100">
                <div className="relative w-48 h-36 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <Image src={fixedImagePath} fill alt={product.name} className="object-cover" />
                </div>
                <div className="flex-1 space-y-1">
                    <h2 className="text-2xl font-bold">{product.name}</h2>
                    <p className="text-lg font-semibold text-blue-600">{formatPrice(product.priceInCents / 100)}</p>
                    <p className="text-gray-500 text-sm">{product.description}</p>
                </div>
            </div>

            {isSuccess ? (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <a 
                        href={`/products/download/${await createDownloadVerification(product.id)}`}
                        className="text-green-800 font-medium underline hover:text-green-600"
                    >
                        Download Your Product
                    </a>
                    <p className="text-green-800 font-medium mt-2">
                        Thank you for your purchase! You will receive a confirmation email shortly.
                    </p>
                </div>
            ) : (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200 space-y-4">
                    <p className="text-red-800">
                        Your payment was not successful. Please try again or contact support.
                    </p>
                    <Button size="lg" asChild>
                        <a href={`/product/${product.id}/purchase`}>Try Again</a>
                    </Button>
                </div>
            )}
        </div>
    );
}

async function createDownloadVerification(productId: string) {
    const verification = await db.downloadVerification.create({
        data: {
            productId,
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24) // Expires in 24 hours
        }
    });
    return verification.id;
}