'use server';
import db from "@/src/db";
import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { v2 as cloudinary } from "cloudinary";

async function uploadToCloudinary(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  const timestamp = Math.round(Date.now() / 1000);
  const apiKey = process.env.CLOUDINARY_API_KEY!;
  const apiSecret = process.env.CLOUDINARY_API_SECRET!;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;

  const signature = crypto
    .createHash("sha256")
    .update(`folder=ben-ncir&timestamp=${timestamp}${apiSecret}`)
    .digest("hex");

  const formData = new FormData();
  formData.append("file", dataUri);
  formData.append("timestamp", timestamp.toString());
  formData.append("api_key", apiKey);
  formData.append("signature", signature);
  formData.append("folder", "ben-ncir");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    { method: "POST", body: formData }
  );

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.secure_url;
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
  const filePath = await uploadToCloudinary(data.File);
  const imagePath = await uploadToCloudinary(data.image);

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
  const product = await db.product.delete({ where: { id } });
  if (!product) throw new Error("Product not found");
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
    filePath = await uploadToCloudinary(data.File);
  }

  if (data.image && data.image.size > 0) {
    imagePath = await uploadToCloudinary(data.image);
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
