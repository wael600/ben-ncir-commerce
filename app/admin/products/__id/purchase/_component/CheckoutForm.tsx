"use client";

import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, PaymentElement, LinkAuthenticationElement } from "@stripe/react-stripe-js";
import Image from "next/image";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/formatters";
import { FormEvent, useState } from "react";


const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function CheckoutForm({
    product,
    clientSecret
}: {
    product: {
        id: string;
        imagePath: string;
        name: string;
        priceInCents: number;
        description: string;
    };
    clientSecret: string;
}) {
    let fixedImagePath = product.imagePath;
    if (fixedImagePath) {
        fixedImagePath = fixedImagePath.replace(/^public\//, '');
        if (!fixedImagePath.startsWith('/') && !fixedImagePath.startsWith('http')) {
            fixedImagePath = '/' + fixedImagePath;
        }
    }

    return (
        <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
            <div className="flex gap-4 items-center mb-4">
                <div className="aspect-video flex-shrink-0 w-1/3 relative">
                    <Image src={fixedImagePath} fill alt={product.name} className="object-cover rounded" />
                </div>
                <div className="flex-1">
                    <h1 className="text-xl font-bold">{product.name}</h1>
                    <p className="text-gray-600">{product.description}</p>
                    <div className="line-clamp-3 text-sm text-gray-500 mt-1">{product.description}</div>
                    <p className="text-lg font-semibold mt-2">{formatPrice(product.priceInCents / 100)}</p>
                </div>
            </div>
            <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutFormContent priceInCents={product.priceInCents} productId={product.id} />
            </Elements>
        </div>
    );
}

function CheckoutFormContent({ priceInCents, productId }: { priceInCents: number; productId: string }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [email, setEmail] = useState<string>();  

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!stripe || !elements || !email) return;

        setIsProcessing(true);
        setErrorMessage(null);

        const alreadyPurchased = await orderExists(email, productId);
        if (alreadyPurchased) {
            setErrorMessage("You have already purchased this product with this email.");
            setIsProcessing(false);
            return;
        }
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${process.env.NEXT_PUBLIC_SERVER_URL || window.location.origin}/stripe/payment-success`
            },
        });

        if (error) {
            if (error.type === "validation_error") {
                setErrorMessage(error?.message || "Validation error occurred");
            } else {
                setErrorMessage(error?.message || "An unknown error occurred");
            }
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Checkout</CardTitle>
                    <CardDescription className="text-description">Complete your purchase</CardDescription>
                </CardHeader>
            </Card>
            <PaymentElement />
            <div className="mt-4">
                <LinkAuthenticationElement 
                    onChange={(e) => setEmail(e.value.email)}
                />
            </div>
            {errorMessage && (
                <div className="text-red-600 text-sm mt-2">{errorMessage}</div>
            )}
            <button
                type="submit"
                disabled={!stripe || !elements || isProcessing}
                className="w-full mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
                {isProcessing ? "Purchasing..." : `Purchase - ${formatPrice(priceInCents / 100)}`}
            </button>
        </form>
    );
}

async function orderExists(email: string, productId: string): Promise<boolean> {
    // TODO: implement server-side check for existing orders
    return false;
}
