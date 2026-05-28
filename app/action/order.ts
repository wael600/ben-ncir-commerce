"use server";
import db from "@/src/db";

export async function userOrderExists(email: string, productId: string): Promise<boolean> {
    const order = await db.order.findFirst({
        where: { 
            user: { email },
            productId: productId
        },
        select: { id: true }
    });
    
    return order !== null;
}
export async function deleteOrder(id: string) {
    await db.order.delete({
        where: { id }
    })
}









