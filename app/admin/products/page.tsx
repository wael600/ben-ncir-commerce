import { PageHeader } from "../_components/PageHeader";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Table, TableBody, TableHeader, TableHead, TableRow, TableCell } from "@/components/ui/table";
import db from "@/src/db";
import { CheckCircle2, XCircle } from "lucide-react";
import { ProductActions } from "./_component/ProductAction";

export default async function AdminProductsPage() {
    return (
        <>
            <div className="flex items-center justify-between gap-4">
                <PageHeader>Products</PageHeader>
                <Button asChild>
                    <Link href="/admin/products/new">
                        Add Product
                    </Link>
                </Button>
            </div>
            <ProductsTable />
        </>
    );
}

async function ProductsTable() {
    const products = await db.product.findMany({
        select: {
            id: true,
            name: true,
            priceInCents: true,
            isAvailableForPurchase: true,
            _count: { select: { orders: true } }
        },
       orderBy: [ 
    { isAvailableForPurchase: "desc" },  // Available first
    { createdAt: "desc" }                 // Then newest first
]
    });

    if (products.length === 0) {
        return (
            <div className="p-4 text-center text-muted-foreground">
                No products found. Please add a product.
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-0"><span className="sr-only">Available</span></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead className="w-0"><span className="sr-only">Actions</span></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {products.map(product => (
                    <TableRow key={product.id}>
                        <TableCell>
                            {product.isAvailableForPurchase ? (
                                <CheckCircle2 className="text-green-500" />
                            ) : (
                                <XCircle className="text-red-500" />
                            )}
                        </TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{(product.priceInCents / 100).toFixed(3)} TND</TableCell>
                        <TableCell>{product._count.orders}</TableCell>
                        <TableCell>
                            <ProductActions 
                                id={product.id}
                                isAvailableForPurchase={product.isAvailableForPurchase}
                                hasOrders={product._count.orders > 0}
                            />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}