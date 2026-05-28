"use client";

import { toggleProductAvailability } from "../_action/product";
import { startTransition, useState } from "react";
import { deleteProduct } from "../_action/product";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Trash2 } from "lucide-react";
import Link from "next/link";

export function ProductActions({ 
    id, 
    isAvailableForPurchase, 
    hasOrders 
}: { 
    id: string; 
    isAvailableForPurchase: boolean;
    hasOrders: boolean;
}) {
    const [isPending, setIsPending] = useState(false);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-md hover:bg-muted">
                    <MoreVertical className="w-4 h-4" />
                    <span className="sr-only">Actions</span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <Link href={`/admin/products/${id}/download`}>
                        Download
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
    <Link href={`/admin/products/${id}/edit`}>
        Edit
    </Link>
</DropdownMenuItem>
                <DropdownMenuItem 
                    disabled={isPending}
                    onClick={() => {
                        startTransition(async () => {
                            await toggleProductAvailability(id, !isAvailableForPurchase);
                        });
                    }}
                >
                    {isAvailableForPurchase ? "Rupture de stock" : "Make Available"}
                </DropdownMenuItem>
                <DropdownMenuItem 
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                    disabled={hasOrders || isPending}
                    onClick={() => {
                        startTransition(async () => {
                            await deleteProduct(id);
                        });
                    }}
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
