"use client"

// Lightweight local DropdownMenuItem to avoid missing module import.
// It renders a button and forwards props/children.
const DropdownMenuItem = (props: any) => createElement("button", props)
import { useTransition, createElement } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"

// Local deleteUser implementation to avoid missing module import.
async function deleteUser(id: string) {
  await fetch(`/api/users/${id}`, { method: "DELETE" })
}

export function DeleteDropDownItem({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  return createElement(
    DropdownMenuItem,
    {
      disabled: isPending,
      onClick: () =>
        startTransition(async () => {
          await deleteUser(id)
          router.refresh()
        }),
      className: "text-red-600",
    },
    createElement(Trash2, { className: "w-4 h-4" }),
    "Delete"
  )
}