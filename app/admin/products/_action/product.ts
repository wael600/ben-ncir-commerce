'use server';

import db from "@/src/db";
import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      }
    );
    stream.end(buffer);
  });
}

async function deleteFromCloudinary(url: string) {
  if (!url || !url.includes("cloudinary")) return;
  try {
    const parts = url.split("/");
    const filename = parts[parts.length - 1].split(".")[0];
    const folder = parts[parts.length - 2];
    await cloudinary.uploader.destroy(`${folder}/${filename}`, { resource_type: "raw" });
    await cloudinary.uploader.destroy(`${folder}/${filename}`, { resource_type: "image" });
  } catch (e) {
    console.error("Cloudinary delete error:", e);
  }
}

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

  const filePath = await uploadToCloudinary(data.File, "ben-ncir/files");
  const imagePath = await uploadToCloudinary(data.image, "ben-ncir/images");

  await db.product.create({
    data: {
      isAvailableForPurchase: true,
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      filePath,
      imagePath,
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

  if (!product) throw new Error("Product not found");

  await deleteFromCloudinary(product.filePath);
  await deleteFromCloudinary(product.imagePath);

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
  if (!product) throw new Error("Product not found");

  let filePath = product.filePath;
  let imagePath = product.imagePath;

  if (data.File && data.File.size > 0) {
    await deleteFromCloudinary(product.filePath);
    filePath = await uploadToCloudinary(data.File, "ben-ncir/files");
  }

  if (data.image && data.image.size > 0) {
    await deleteFromCloudinary(product.imagePath);
    imagePath = await uploadToCloudinary(data.image, "ben-ncir/images");
  }

  await db.product.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      filePath,
      imagePath,
    }
  });

  revalidatePath("/admin/products");
  redirect("/admin/products");
}
