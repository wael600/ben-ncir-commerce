import db from "@/src/db";
import { PageHeader } from "@/app/admin/_components/PageHeader";
import { ProductForm } from "@/app/admin/products/_component/ProductForm";
import { notFound } from "next/navigation";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  const product = await db.product.findUnique({
    where: { id },
  });

  if (!product) return notFound();

  return (
    <>
      <PageHeader>Edit Product</PageHeader>
      <ProductForm product={product} />
    </>
  );
}