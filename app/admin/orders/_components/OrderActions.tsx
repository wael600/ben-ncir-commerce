"use client"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { deleteOrder } from "@/app/action/order"
import { useTransition } from "react"
import { useRouter } from "next/navigation"

export function OrderActions({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    
    return (
        <DropdownMenuItem
            disabled={isPending}
            onClick={() =>
                startTransition(async () => {
                    await deleteOrder(id)
                    router.refresh()
                })
            }
        >
            Delete
        </DropdownMenuItem>
    )
}