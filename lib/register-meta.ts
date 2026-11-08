// Descrizione dei 5 registri condivisa da client e server: colonne, campi del form, testi.
import { FUEL_TYPES, INSURANCE_COMPANIES, INSURANCE_COVERAGES, MAINTENANCE_TYPES } from "./enums"
import { taxDueDate } from "./deadlines"

export const REGISTER_NAMES = ["manutenzioni", "rifornimenti", "assicurazioni", "bollo", "revisioni"] as const
export type RegisterName = (typeof REGISTER_NAMES)[number]

export const PAGE_SIZE = 15

export type Row = Record<string, string | number | boolean | null> & { id: string; vehicle_id: string }
export type RegisterRow = Row & { vehicle: { id: string; brand: string; model: string; plate: string }; current?: boolean }

export type FieldDef = {
    name: string
    label: string
    type: "text" | "number" | "date" | "select" | "textarea" | "vehicle"
    required?: boolean
    options?: readonly string[]
    /** Numeri interi (km, anni, rate) */
    integer?: boolean
    /** Scorciatoia accanto al campo data: imposta la data a N anni da un altro campo */
    yearsFrom?: { field: string; years: number; label: string }
    /** Suggerimenti da public/brands-models.json */
    suggest?: "brand" | "model"
    hint?: string
    /** Titolo di gruppo mostrato prima del campo */
    section?: string
}

export type ColumnDef = {
    key: string
    label: string
    kind: "date" | "euro" | "number" | "text" | "deadline"
    /** Chiave di ordinamento lato server, se la colonna è ordinabile */
    sort?: string
    value?: (row: Row) => string | number | null
    unit?: string
}

export type RegisterMeta = {
    title: string
    /** "Aggiungi …" */
    noun: string
    feminine?: boolean
    empty: string
    defaultSort: string
    columns: ColumnDef[]
    fields: FieldDef[]
}

const vehicle: FieldDef = { name: "vehicle_id", label: "Veicolo", type: "vehicle", required: true }

export const registerMeta: Record<RegisterName, RegisterMeta> = {
    manutenzioni: {
        title: "Manutenzioni", noun: "manutenzione", feminine: true, empty: "Nessuna manutenzione.", defaultSort: "-date",
        columns: [
            { key: "date", label: "Data", kind: "date", sort: "date" },
            { key: "title", label: "Intervento", kind: "text", sort: "title" },
            { key: "type", label: "Tipo", kind: "text" },
            { key: "km_at_maintenance", label: "Km", kind: "number", sort: "km_at_maintenance", unit: "km" },
            { key: "workshop", label: "Officina", kind: "text" },
            { key: "cost", label: "Costo", kind: "euro", sort: "cost" },
        ],
        fields: [
            vehicle,
            { name: "title", label: "Titolo", type: "text", required: true },
            { name: "type", label: "Tipo di intervento", type: "select", required: true, options: MAINTENANCE_TYPES },
            { name: "date", label: "Data", type: "date", required: true },
            { name: "km_at_maintenance", label: "Km", type: "number", integer: true },
            { name: "cost", label: "Costo (€)", type: "number" },
            { name: "workshop", label: "Officina", type: "text" },
            { name: "description", label: "Descrizione", type: "textarea" },
        ],
    },
    rifornimenti: {
        title: "Rifornimenti", noun: "rifornimento", empty: "Nessun rifornimento.", defaultSort: "-date",
        columns: [
            { key: "date", label: "Data", kind: "date", sort: "date" },
            { key: "liters", label: "Litri", kind: "number", sort: "liters", unit: "l" },
            { key: "price_per_liter", label: "Costo/l", kind: "euro", sort: "price_per_liter" },
            { key: "fuel_type", label: "Carburante", kind: "text" },
            { key: "station", label: "Distributore", kind: "text" },
            { key: "cost", label: "Costo", kind: "euro", sort: "cost" },
        ],
        fields: [
            vehicle,
            { name: "date", label: "Data rifornimento", type: "date", required: true },
            { name: "cost", label: "Costo (€)", type: "number", required: true },
            { name: "liters", label: "Litri (l)", type: "number", required: true },
            { name: "fuel_type", label: "Tipo carburante", type: "select", options: FUEL_TYPES },
            { name: "station", label: "Stazione di servizio", type: "text" },
            { name: "notes", label: "Note", type: "textarea" },
        ],
    },
    assicurazioni: {
        title: "Assicurazioni", noun: "assicurazione", feminine: true, empty: "Nessuna assicurazione.", defaultSort: "-end_date",
        columns: [
            { key: "company", label: "Compagnia", kind: "text", sort: "company" },
            { key: "coverage_type", label: "Copertura", kind: "text" },
            { key: "start_date", label: "Inizio", kind: "date", sort: "start_date" },
            { key: "end_date", label: "Scadenza", kind: "deadline", sort: "end_date" },
            { key: "cost", label: "Costo", kind: "euro", sort: "cost" },
        ],
        fields: [
            vehicle,
            { name: "company", label: "Compagnia", type: "select", required: true, options: INSURANCE_COMPANIES },
            { name: "coverage_type", label: "Copertura", type: "select", options: INSURANCE_COVERAGES },
            { name: "policy_number", label: "Numero polizza", type: "text" },
            { name: "start_date", label: "Inizio", type: "date", required: true },
            { name: "end_date", label: "Scadenza", type: "date", required: true, yearsFrom: { field: "start_date", years: 1, label: "Tra 1 anno" } },
            { name: "cost", label: "Costo (€)", type: "number", required: true },
            { name: "notes", label: "Note", type: "textarea" },
        ],
    },
    bollo: {
        title: "Bollo", noun: "bollo", empty: "Nessun bollo.", defaultSort: "-year",
        columns: [
            { key: "year", label: "Anno", kind: "text", sort: "year" },
            { key: "paid_date", label: "Pagato il", kind: "date", sort: "paid_date" },
            { key: "due", label: "Scadenza", kind: "deadline", value: (row) => taxDueDate(row.paid_date as string | null) },
            { key: "amount", label: "Importo", kind: "euro", sort: "amount" },
        ],
        fields: [
            vehicle,
            { name: "year", label: "Anno di riferimento", type: "number", required: true, integer: true },
            { name: "amount", label: "Importo (€)", type: "number", required: true },
            { name: "paid_date", label: "Data di pagamento", type: "date" },
            { name: "notes", label: "Note", type: "textarea" },
        ],
    },
    revisioni: {
        title: "Revisioni", noun: "revisione", feminine: true, empty: "Nessuna revisione.", defaultSort: "-date",
        columns: [
            { key: "date", label: "Data", kind: "date", sort: "date" },
            { key: "next_revision_date", label: "Prossima", kind: "deadline", sort: "next_revision_date" },
            { key: "km", label: "Km", kind: "number", unit: "km" },
            { key: "workshop", label: "Officina", kind: "text" },
            { key: "cost", label: "Costo", kind: "euro", sort: "cost" },
        ],
        fields: [
            vehicle,
            { name: "date", label: "Data revisione", type: "date", required: true },
            { name: "next_revision_date", label: "Prossima revisione", type: "date", required: true, yearsFrom: { field: "date", years: 2, label: "Tra 2 anni" } },
            { name: "km", label: "Km", type: "number", integer: true },
            { name: "cost", label: "Costo (€)", type: "number" },
            { name: "workshop", label: "Officina", type: "text" },
            { name: "notes", label: "Note", type: "textarea" },
        ],
    },
}
