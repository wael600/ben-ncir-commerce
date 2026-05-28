"use client";
import { ProductCard } from "@/components/ui/ProductCard";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const CATEGORIES = [
    "Tous",
    "Pince",
    "Accessoires",
    "Pompe a eau",
    "Outils Agricole",
    "Visseuse",
    "Cle INGCO",
    "Pneumatique",
    "Menuiserie",
    "Marteaux",
];

function ProductCardSkeleton() {
    return (
        <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm animate-pulse">
            <div className="h-40 w-full rounded-md bg-slate-200" />
            <div className="space-y-2">
                <div className="h-4 w-3/4 rounded bg-slate-200" />
                <div className="h-4 w-1/2 rounded bg-slate-200" />
            </div>
        </div>
    );
}

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [category, setCategory] = useState("Tous");
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const search = searchParams.get("search") || "";

    useEffect(() => {
        fetch("/api/products")
            .then(res => res.json())
            .then(data => {
                setProducts(data);
                setLoading(false);
            });
    }, []);

    const filtered = products.filter(p => {
        const matchSearch = search === "" ||
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.description?.toLowerCase().includes(search.toLowerCase());
        const matchCategory = category === "Tous" ||
            p.description?.toLowerCase().includes(category.toLowerCase());
        return matchSearch && matchCategory;
    });

    return (
        <div className="space-y-6 p-6">
            {search && (
                <p className="text-gray-500 text-sm">Results for: <strong>{search}</strong></p>
            )}

            {/* Categories */}
            <div className="flex flex-wrap gap-2 justify-center">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                            category === cat
                                ? "bg-green-600 text-white border-green-600"
                                : "bg-white text-gray-600 border-gray-300 hover:border-green-400 hover:text-green-600"
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Products Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(6)].map((_, i) => <ProductCardSkeleton key={i} />)}
                </div>
            ) : filtered.length === 0 ? (
                <p className="text-center text-gray-500">No products found.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filtered.map(product => (
                        <ProductCard key={product.id} {...product} />
                    ))}
                </div>
            )}
        </div>
    );
}
