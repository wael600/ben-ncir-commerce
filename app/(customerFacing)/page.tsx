import db from "@/src/db";
import { ProductCard } from "@/components/ui/ProductCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroCarousel } from "@/components/ui/carousel/HeroCarousel";

async function getMostPopularProducts() {
    return await db.product.findMany({
        where: { isAvailableForPurchase: true, imagePath: { not: "" } },
        select: { id: true, name: true, priceInCents: true, description: true, imagePath: true },
        orderBy: { orders: { _count: "desc" } },
        take: 6,
    });
}

async function getNewestProducts() {
    return await db.product.findMany({
        where: { isAvailableForPurchase: true, imagePath: { not: "" } },
        select: { id: true, name: true, priceInCents: true, description: true, imagePath: true },
        orderBy: { createdAt: "desc" },
        take: 6,
    });
}

export default async function HomePage() {
    const [popularProducts, newestProducts] = await Promise.all([
        getMostPopularProducts(),
        getNewestProducts()
    ]);

    return (
        <main className="space-y-12 p-6">
            <HeroCarousel />
            <ProductGridSection title="Most Popular" products={popularProducts} viewAllHref="/products" />
            <ProductGridSection title="Newest" products={newestProducts} viewAllHref="/products" />
        </main>
    );
}

function ProductGridSection({ products, title, viewAllHref }: { title: string; products: any[]; viewAllHref?: string }) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{title}</h2>
                {viewAllHref && (
                    <Button variant="outline" asChild>
                        <Link href={viewAllHref} className="flex items-center gap-2">
                            <span>View All</span>
                            <ArrowRight className="size-4" />
                        </Link>
                    </Button>
                )}
            </div>
            {products.length === 0 ? (
                <p className="text-gray-500">No products available.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product: any) => (
                        <ProductCard key={product.id} {...product} />
                    ))}
                </div>
            )}
        </div>
    );
}
