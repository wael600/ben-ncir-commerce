import { PageHeader } from "@/app/admin/_components/PageHeader";
import { ProductForm } from "@/app/admin/products/_component/ProductForm";

export default function NewProductPage() {
  return (
    <>
      <PageHeader>New Product</PageHeader>
      <ProductForm />
    </>
  );
}