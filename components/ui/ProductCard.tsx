"use client";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { formatPrice } from "@/lib/formatters";
import { Button } from "./button";
import Link from "next/link";
import Image from "next/image";

interface ProductCardProps {
    id: string;
    name: string;
    priceInCents: number;
    description?: string;
    imagePath: string;
}

export function ProductCard({ id, name, priceInCents, description, imagePath }: ProductCardProps) {
    let fixedImagePath = imagePath;
    if (fixedImagePath) {
        fixedImagePath = fixedImagePath.replace(/^public\//, "");
        if (!fixedImagePath.startsWith("/") && !fixedImagePath.startsWith("http")) {
            fixedImagePath = "/" + fixedImagePath;
        }
    }

    const isValidImage = fixedImagePath && fixedImagePath.trim() !== "";

    return (
        <Card className="flex overflow-hidden flex-col">
            <div className="relative w-full h-56 bg-gray-100">
                {isValidImage ? (
                    <Image
                        src={fixedImagePath}
                        fill
                        alt={name}
                        className="object-contain p-2"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        loading="eager"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                    </div>
                )}
            </div>
            <CardHeader className="p-3">
                <CardTitle className="text-base font-bold">{name}</CardTitle>
                <CardDescription suppressHydrationWarning className="text-sm font-semibold text-green-600">
                    {formatPrice(priceInCents / 100)}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow p-3 pt-0">
                <p className="line-clamp-2 text-sm text-gray-500">{description || ""}</p>
            </CardContent>
            <CardFooter className="p-3">
                <Button asChild size="sm" className="w-full bg-green-600 hover:bg-green-700">
                    <Link href={`/products/${id}/purchase`}>Buy Now</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
