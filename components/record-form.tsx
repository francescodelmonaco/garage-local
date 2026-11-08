"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { FORM_ERROR_ID, FormField } from "@/components/form-field"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useApiMutation } from "@/hooks/queries"
import { useBrandSuggestions } from "@/hooks/use-brand-suggestions"
import { ApiError } from "@/lib/fetcher"
import type { FieldDef } from "@/lib/register-meta"

type Values = Record<string, unknown>

export type RecordFormProps = {
    open: boolean
    onClose: () => void
    title: string
    fields: FieldDef[]
    initial?: Values
    request: { url: string; method: string }
    successMessage: string
    onSaved?: (saved: unknown) => void
}

/** Modale di inserimento/modifica guidata dalla definizione dei campi. Il form invia stringhe: converte e valida il server. */
export function RecordForm({ open, onClose, ...props }: RecordFormProps) {
    return (
        <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
            {/* Montato a ogni apertura: lo stato parte sempre dai valori iniziali */}
            {open && <RecordFormBody {...props} onClose={onClose} />}
        </Dialog>
    )
}

function RecordFormBody({ title, fields, initial = {}, request, successMessage, onSaved, onClose }: Omit<RecordFormProps, "open">) {
    const formRef = useRef<HTMLFormElement>(null)
    const [error, setError] = useState<{ message: string; field?: string } | null>(null)
    const [brand, setBrand] = useState(String(initial.brand ?? ""))
    const mutation = useApiMutation((body: Values) => ({ ...request, body }))
    const suggestions = useBrandSuggestions(fields.some((field) => field.suggest), brand)

    useEffect(() => {
        if (error?.field) formRef.current?.querySelector<HTMLElement>(`[name="${error.field}"]`)?.focus()
    }, [error])

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setError(null)
        mutation.mutate(Object.fromEntries(new FormData(event.currentTarget)), {
            onSuccess: (saved) => {
                toast.success(successMessage)
                onSaved?.(saved)
                onClose()
            },
            onError: (err) => setError({ message: err.message, field: err instanceof ApiError ? err.field : undefined }),
        })
    }

    return (
        <DialogContent className="max-h-[90dvh] grid-rows-[auto_1fr_auto] overflow-hidden p-0 sm:max-w-lg">
            <DialogHeader className="px-6 pt-6">
                <DialogTitle>{title}</DialogTitle>
            </DialogHeader>
            <form ref={formRef} id="record-form" onSubmit={submit} noValidate className="grid gap-4 overflow-y-auto px-6 pb-2">
                {fields.map((field) => (
                    <FormField
                        key={field.name}
                        field={field}
                        defaultValue={initial[field.name]}
                        invalid={error?.field === field.name}
                        suggestions={field.suggest && suggestions[field.suggest]}
                        onValueChange={field.suggest === "brand" ? setBrand : undefined}
                    />
                ))}
            </form>
            <DialogFooter className="border-t border-rule px-6 py-4">
                {error && <p id={FORM_ERROR_ID} role="alert" className="mr-auto self-center text-sm text-destructive">{error.message}</p>}
                <Button type="button" variant="ghost" onClick={onClose}>Annulla</Button>
                <Button type="submit" form="record-form" disabled={mutation.isPending}>{mutation.isPending ? "Salvataggio…" : "Salva"}</Button>
            </DialogFooter>
        </DialogContent>
    )
}

