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
        <Card className="flex overflow-hidden flex-col w-48">
            <div className="relative w-full h-28 bg-gray-100">
                {isValidImage ? (
                    <Image
                        src={fixedImagePath}
                        fill
                        alt={name}
                        className="object-cover"
                        sizes="192px"
                        loading="eager"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                        No image
                    </div>
                )}
            </div>
            <CardHeader className="p-2">
                <CardTitle className="text-xs">{name}</CardTitle>
                <CardDescription suppressHydrationWarning className="text-xs">
                    {formatPrice(priceInCents / 100)}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow p-2 pt-0">
                <p className="line-clamp-2 text-xs text-gray-500">{description || "No description available"}</p>
            </CardContent>
            <CardFooter className="p-2">
                <Button asChild size="sm" className="w-full bg-green-600 hover:bg-green-700 text-xs">
                    <Link href={`/products/${id}/purchase`}>Buy Now</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
