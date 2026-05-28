"use client";
import Image from "next/image";
import { useState } from "react";

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
        fixedImagePath = fixedImagePath.replace(/^public\//, "");
        if (!fixedImagePath.startsWith("/") && !fixedImagePath.startsWith("http")) {
            fixedImagePath = "/" + fixedImagePath;
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-6 space-y-6">
            <div className="flex gap-6 items-start bg-white rounded-xl shadow p-4 border border-gray-100">
                <div className="relative w-40 h-40 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <Image src={fixedImagePath} fill alt={product.name} className="object-cover" />
                </div>
                <div className="flex-1 space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
                    <p className="text-gray-500 text-sm leading-relaxed">{product.description}</p>
                    <p className="text-xl font-bold text-green-600">
                        {(product.priceInCents / 100).toFixed(3)} TND
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
                <CashPaymentForm productId={product.id} priceInCents={product.priceInCents} />
            </div>
        </div>
    );
}

function CashPaymentForm({ productId, priceInCents }: { productId: string; priceInCents: number }) {
    const [submitted, setSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [place, setPlace] = useState("");

    const handleSubmit = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/cash-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId, name, phone, place }),
            });
            if (!res.ok) throw new Error("Failed to place order");
            setSubmitted(true);
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="text-center space-y-3 py-6">
                <div className="text-5xl">✅</div>
                <h3 className="text-xl font-bold text-green-700">Order Confirmed!</h3>
                <p className="text-gray-500">
                    Please pay <span className="font-bold text-green-600">{(priceInCents / 100).toFixed(3)} TND</span> upon delivery.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Cash on Delivery</h3>
            <p className="text-gray-500 text-sm">All fields are optional.</p>
            <div className="space-y-3">
                <input
                    type="text"
                    placeholder="Full Name (optional)"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <input
                    type="tel"
                    placeholder="Phone Number (optional)"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
                <input
                    type="text"
                    placeholder="Place / Address (optional)"
                    value={place}
                    onChange={e => setPlace(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-between hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                <span>{isLoading ? "Placing Order..." : "Confirm Cash Order"}</span>
                <span className="text-lg font-bold">{(priceInCents / 100).toFixed(3)} TND</span>
            </button>
        </div>
    );
}
