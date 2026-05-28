"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatNumber, formatPrice } from "@/lib/formatters";
import { useState } from "react";
import { addProduct, updateProduct } from "../_action/product";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";

export function ProductForm({ product }: { product?: any | null }) {
    const [priceInCents, setPriceInCents] = useState<number | undefined>(product?.priceInCents);
    const action = product ? updateProduct.bind(null, product.id) : addProduct;
    const [state, formAction] = useActionState(action, { errors: {} });
    const errors = state?.errors || {};
    
    return <form action={formAction} className="space-y-8">
        <div className="space-y-2">
            <label htmlFor="name">Name</label>
            <Input 
                id="name" 
                name="name" 
                type="text" 
                required 
                defaultValue={product?.name || ""}
            />
            {errors.name && <div className="text-destructive">{errors.name}</div>}
        </div>
        <div className="space-y-2">
            <label htmlFor="priceInCents">Price In Cents</label>
            <Input 
                id="priceInCents" 
                name="priceInCents" 
                type="number"  
                required 
                min="0"
                value={priceInCents || ""} 
                onChange={e => setPriceInCents(Math.max(0, Number(e.target.value) || 0))} 
            />
            {errors.priceInCents && <div className="text-destructive">{errors.priceInCents}</div>}
            <div className="text-sm text-muted-foreground" suppressHydrationWarning>
                {priceInCents ? formatPrice(priceInCents / 100) : formatPrice(0)}
            </div>
        </div>
        <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
                id="description" 
                name="description" 
                required={product == null} 
                defaultValue={product?.description || ""} 
            />
            {errors.description && <div className="text-destructive">{errors.description}</div>}
        </div>
        <div className="space-y-2">
            <label htmlFor="File">File</label>
            <Input id="File" name="File" type="file" required={product == null} />
            {product?.filePath && (
                <div className="text-sm text-muted-foreground">Current file: {product.filePath.split('/').pop()}</div>
            )}
            {errors.File && <div className="text-destructive">{errors.File}</div>}
        </div>
        <div className="space-y-2">
            <label htmlFor="image">Image</label>
            <Input id="image" name="image" type="file" required={product == null} />
            {product?.imagePath && (
                <Image 
                    src={product.imagePath.startsWith("http") ? product.imagePath : `/${product.imagePath.replace(/^public\//, "")}`} 
                    alt="Product Image" 
                    width={200} 
                    height={200} 
                    className="mt-2 rounded-md"
                />
            )}
            {errors.image && <div className="text-destructive">{errors.image}</div>}
        </div>
        <SubmitButton />
    </form>
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save"}
        </Button>
    );
}
