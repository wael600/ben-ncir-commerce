'use server';

import db from "@/src/db";
import { z } from "zod";
import fs from "fs/promises";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

const fileSchema = z.instanceof(File, { message: "File is required" });
const imageSchema = fileSchema.refine(
    file => file.size === 0 || file.type.startsWith("image/"),
);

const addSchema = z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    priceInCents: z.coerce.number().int().min(0),
    File: fileSchema.refine(file => file.size > 0, "required"),
    image: imageSchema.refine(file => file.size > 0, "required"),
});

const editSchema = addSchema.extend({
    File: fileSchema.optional(),
    image: imageSchema.optional(),
});

export async function addProduct(prevState: unknown, formData: FormData) {
    const result = addSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!result.success) {
        return { errors: result.error.flatten().fieldErrors };
    }
    
    const data = result.data;
    
    // Save File
    await fs.mkdir("public/products", { recursive: true });
    const filePath = `public/products/${crypto.randomUUID()}-${data.File.name}`;
    await fs.writeFile(filePath, Buffer.from(await data.File.arrayBuffer()));
    
    // Save Image
    const imagePath = `public/products/${crypto.randomUUID()}-${data.image.name}`;
    await fs.writeFile(imagePath, Buffer.from(await data.image.arrayBuffer()));
    
    await db.product.create({
        data: {
           isAvailableForPurchase: true,
            name: data.name,
            description: data.description,
            priceInCents: data.priceInCents,
            filePath: filePath,
            imagePath: imagePath,
        }
    });
    
    revalidatePath("/admin/products");
    redirect("/admin/products");
}

export async function toggleProductAvailability(id: string, isAvailableForPurchase: boolean) {
    await db.product.update({
        where: { id },
        data: { isAvailableForPurchase }
    });
    revalidatePath("/admin/products");
    redirect("/admin/products");
}

export async function deleteProduct(id: string) {
    const product = await db.product.delete({
        where: { id }
    });
    
    if (!product) {
        throw new Error("Product not found");
    }
    
    // Delete files
    await fs.unlink(product.filePath);
    await fs.unlink(product.imagePath);
    
    revalidatePath("/admin/products");
    redirect("/admin/products");
}

export async function updateProduct(id: string, prevState: unknown, formData: FormData) {
    const result = editSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!result.success) {
        return { errors: result.error.flatten().fieldErrors };
    }
    
    const data = result.data;
    const product = await db.product.findUnique({ where: { id } });
    
    if (!product) {
        throw new Error("Product not found");
    }
    
    let filePath = product.filePath;
    let imagePath = product.imagePath;
    
    // Update File if new file provided
    if (data.File && data.File.size > 0) {
        await fs.unlink(product.filePath);
        filePath = `public/products/${crypto.randomUUID()}-${data.File.name}`;
        await fs.writeFile(filePath, Buffer.from(await data.File.arrayBuffer()));
    }
    
    // Update Image if new image provided
    if (data.image && data.image.size > 0) {
        await fs.unlink(product.imagePath);
        imagePath = `public/products/${crypto.randomUUID()}-${data.image.name}`;
        await fs.writeFile(imagePath, Buffer.from(await data.image.arrayBuffer()));
    }
    
    await db.product.update({
        where: { id },
        data: {
            name: data.name,
            description: data.description,
            priceInCents: data.priceInCents,
            filePath: filePath,
            imagePath: imagePath,
        }
    });
    
    revalidatePath("/admin/products");
    redirect("/admin/products");
}