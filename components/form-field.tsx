"use client"

import { addYears, format, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect } from "@/components/ui/native-select"
import { Textarea } from "@/components/ui/textarea"
import { useVehicles } from "@/hooks/queries"
import { vehicleName } from "@/lib/format"
import type { FieldDef } from "@/lib/register-meta"

/** Id del messaggio d'errore del form, collegato al campo non valido con aria-describedby. */
export const FORM_ERROR_ID = "form-error"

type ControlProps = {
    id: string
    name: string
    required?: boolean
    defaultValue: string
    "aria-invalid"?: boolean
    "aria-describedby"?: string
}

/** Un campo del form guidato dalla sua definizione: etichetta, controllo, suggerimenti e nota. */
export function FormField({ field, defaultValue, invalid, suggestions, onValueChange }: {
    field: FieldDef
    defaultValue: unknown
    invalid: boolean
    /** Valori per il datalist dei campi con `suggest` */
    suggestions?: string[]
    onValueChange?: (value: string) => void
}) {
    const id = `field-${field.name}`
    const props: ControlProps = {
        id,
        name: field.name,
        required: field.required,
        defaultValue: String(defaultValue ?? ""),
        "aria-invalid": invalid || undefined,
        "aria-describedby": invalid ? FORM_ERROR_ID : field.hint ? `${id}-hint` : undefined,
    }

    return (
        <div className="grid gap-2">
            {field.section && <h3 className="mt-3 border-t border-rule pt-4 text-sm font-semibold">{field.section}</h3>}
            <Label htmlFor={id}>{field.label}{field.required && <span className="text-muted-foreground"> *</span>}</Label>
            <Control field={field} props={props} listId={suggestions && `${id}-list`} onValueChange={onValueChange} />
            {suggestions && (
                <datalist id={`${id}-list`}>
                    {suggestions.map((value) => <option key={value} value={value} />)}
                </datalist>
            )}
            {field.hint && <p id={`${id}-hint`} className="text-xs text-muted-foreground">{field.hint}</p>}
        </div>
    )
}

function Control({ field, props, listId, onValueChange }: { field: FieldDef; props: ControlProps; listId?: string; onValueChange?: (value: string) => void }) {
    switch (field.type) {
        case "vehicle":
            return <VehicleSelect {...props} />
        case "select":
            return (
                <NativeSelect {...props}>
                    <option value="">{field.required ? "Scegli…" : "—"}</option>
                    {field.options?.map((option) => <option key={option}>{option}</option>)}
                </NativeSelect>
            )
        case "textarea":
            return <Textarea {...props} rows={3} />
        case "date":
            return (
                <div className="flex gap-2">
                    <Input {...props} type="date" className="flex-1" />
                    {field.yearsFrom && <YearsFromButton target={field.name} source={field.yearsFrom.field} years={field.yearsFrom.years} label={field.yearsFrom.label} />}
                </div>
            )
        default:
            return (
                <Input
                    {...props}
                    inputMode={field.type === "number" ? (field.integer ? "numeric" : "decimal") : undefined}
                    list={listId}
                    autoComplete="off"
                    onChange={onValueChange && ((e) => onValueChange(e.target.value))}
                />
            )
    }
}

function VehicleSelect(props: ControlProps) {
    const { data: vehicles } = useVehicles()
    return (
        <NativeSelect {...props} disabled={!vehicles}>
            <option value="">Scegli un veicolo</option>
            {vehicles?.map((v) => <option key={v.id} value={v.id}>{vehicleName(v)}{v.plate ? ` · ${v.plate}` : ""}</option>)}
        </NativeSelect>
    )
}

/** Scorciatoia accanto a un campo data: lo imposta a N anni dalla data di un altro campo dello stesso form. */
function YearsFromButton({ target, source, years, label }: { target: string; source: string; years: number; label: string }) {
    function apply(event: React.MouseEvent<HTMLButtonElement>) {
        const elements = event.currentTarget.form?.elements
        const from = elements?.namedItem(source) as HTMLInputElement | null
        const to = elements?.namedItem(target) as HTMLInputElement | null
        if (from?.value && to) to.value = format(addYears(parseISO(from.value), years), "yyyy-MM-dd")
    }
    return <Button type="button" variant="outline" onClick={apply}>{label}</Button>
}
