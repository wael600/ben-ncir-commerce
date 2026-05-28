"use client"
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { deleteUser } from "../../products/_action/user";
import { Trash2 } from "lucide-react";

export function DeleteDropDownItem({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    return (
        <DropdownMenuItem
            variant="destructive"
            disabled={isPending}
            onClick={() => {
                startTransition(async () => {
                    await deleteUser(id);
                    router.refresh();
                });
            }}
        >
            <Trash2 className="w-4 h-4" />
            {isPending ? "Deleting..." : "Delete"}
        </DropdownMenuItem>
    );
}
