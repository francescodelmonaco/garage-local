"use client"

import { Copy, EllipsisVertical, Pencil, Trash2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useApiMutation } from "@/hooks/queries"

type Action = "duplicate" | "delete"

/** Menu ⋮ con Modifica, Duplica, Elimina; le ultime due chiedono conferma. */
export function RowActions({ label, url, onEdit, noun, feminine, duplicate = true, deleteDescription = "L'operazione non si può annullare.", onDeleted }: {
    /** Nome dell'elemento, usato nelle conferme */
    label: string
    /** URL API dell'elemento: DELETE su url, POST su url/duplicate */
    url: string
    onEdit: () => void
    /** Es. "Rifornimento" per i toast */
    noun: string
    /** Accordo dei participi: "Manutenzione eliminata" */
    feminine?: boolean
    duplicate?: boolean
    deleteDescription?: string
    onDeleted?: () => void
}) {
    const [confirm, setConfirm] = useState<Action | null>(null)
    const mutation = useApiMutation((action: Action) =>
        action === "delete" ? { url, method: "DELETE" } : { url: `${url}/duplicate`, method: "POST" })
    const deleting = confirm === "delete"

    function run(action: Action) {
        mutation.mutate(action, {
            onSuccess: () => {
                toast.success(`${noun} ${action === "delete" ? "eliminat" : "duplicat"}${feminine ? "a" : "o"}`)
                if (action === "delete") onDeleted?.()
            },
            onError: (error) => toast.error(error.message),
        })
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm" aria-label={`Azioni per ${label}`}><EllipsisVertical /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={onEdit}><Pencil />Modifica</DropdownMenuItem>
                    {duplicate && <DropdownMenuItem onSelect={() => setConfirm("duplicate")}><Copy />Duplica</DropdownMenuItem>}
                    <DropdownMenuItem variant="destructive" onSelect={() => setConfirm("delete")}><Trash2 />Elimina</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialog open={confirm !== null} onOpenChange={(open) => !open && setConfirm(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{deleting ? `Eliminare ${label}?` : `Duplicare ${label}?`}</AlertDialogTitle>
                        <AlertDialogDescription>{deleting ? deleteDescription : "Verrà creata una copia da modificare."}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annulla</AlertDialogCancel>
                        <AlertDialogAction variant={deleting ? "destructive" : "default"} onClick={() => confirm && run(confirm)}>
                            {deleting ? "Elimina" : "Duplica"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
