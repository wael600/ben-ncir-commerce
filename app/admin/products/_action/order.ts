"use server"
import db from "@/src/db";
import {notFound} from "next/navigation";

export async function deleteOrder(id: string) {
    const order = await db.order.findUnique({
        where: { id },
        select: { id: true }
    })
    if (order == null) return notFound();

    return order
}