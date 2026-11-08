import { z } from "zod"
import { BALLOON_OUTCOMES, FUEL_TYPES, INSURANCE_COMPANIES, INSURANCE_COVERAGES, MAINTENANCE_TYPES, VEHICLE_TYPES } from "./enums.ts"
import { installmentDate } from "./financing.ts"

// I form inviano stringhe (Object.fromEntries(FormData)): il vuoto diventa null, mai zero.
const blank = (value: unknown) => value == null || (typeof value === "string" && !value.trim())
const toNumber = (value: unknown) => typeof value === "string" ? Number(value.replace(",", ".")) : value

const text = (message: string) => z.string({ error: message }).trim().min(1, message)
const optionalText = z.string({ error: "Inserisci un testo valido." }).trim().nullish().transform((value) => value || null)
const vehicleId = z.uuid({ error: "Scegli un veicolo valido." })

const number = (message: string) => z.number({ error: message }).finite(message).nonnegative(message)
/** Numero facoltativo: vuoto → null */
const optional = <T extends z.ZodType>(schema: T) => z.preprocess((value) => blank(value) ? null : toNumber(value), schema.nullable())
/** Numero obbligatorio: vuoto → messaggio del campo */
const required = <T extends z.ZodType>(schema: T) => z.preprocess((value) => blank(value) ? undefined : toNumber(value), schema)

const date = (message: string) => z.preprocess((value) => blank(value) ? undefined : value, z.iso.date({ error: message }))
const optionalDate = (message: string) => z.preprocess((value) => blank(value) ? null : value, z.iso.date({ error: message }).nullable())

const oneOf = <T extends readonly [string, ...string[]]>(values: T, message: string) => z.enum(values, { error: message })
const optionalOneOf = <T extends readonly [string, ...string[]]>(values: T, message: string) =>
    z.preprocess((value) => blank(value) ? null : value, z.enum(values, { error: message }).nullable())

const cost = number("Inserisci un costo valido, maggiore o uguale a zero.")
const km = number("Inserisci chilometri interi, maggiori o uguali a zero.").int("Inserisci chilometri interi.")
const year = number("Inserisci un anno valido.").int("Inserisci un anno intero.").min(1886, "Inserisci un anno dal 1886 in poi.")

export const vehicleInputSchema = z.object({
    brand: text("Inserisci la marca del veicolo."),
    model: text("Inserisci il modello del veicolo."),
    plate: z.string({ error: "Inserisci una targa valida." }).trim().transform((value) => value.replace(/\s+/g, "").toUpperCase()).default(""),
    vehicle_type: oneOf(VEHICLE_TYPES, "Scegli il tipo di veicolo."),
    fuel_type: optionalOneOf(FUEL_TYPES, "Scegli un carburante valido."),
    year: optional(year.refine((value) => value <= new Date().getFullYear(), "L’anno di immatricolazione non può essere futuro.")),
    initial_km: optional(km),
    purchase_price: optional(cost),
    purchase_date: optionalDate("Inserisci una data di acquisto valida."),
    notes: optionalText,
})

export const refuelingInputSchema = z.object({
    vehicle_id: vehicleId,
    date: date("Scegli una data valida per il rifornimento."),
    cost: required(cost.positive("Inserisci un costo maggiore di zero.")),
    liters: required(number("Inserisci litri validi.").positive("Inserisci litri maggiori di zero.")),
    fuel_type: optionalOneOf(FUEL_TYPES, "Scegli un carburante valido."),
    station: optionalText,
    notes: optionalText,
}).transform((value) => ({ ...value, price_per_liter: Math.round((value.cost / value.liters) * 1000) / 1000 }))

export const insuranceInputSchema = z.object({
    vehicle_id: vehicleId,
    company: oneOf(INSURANCE_COMPANIES, "Scegli la compagnia assicurativa."),
    policy_number: optionalText,
    coverage_type: optionalOneOf(INSURANCE_COVERAGES, "Scegli una copertura valida."),
    start_date: date("Scegli una data di inizio valida."),
    end_date: date("Scegli una data di scadenza valida."),
    cost: required(cost),
    notes: optionalText,
}).refine((value) => value.end_date >= value.start_date, {
    path: ["end_date"], message: "La scadenza non può precedere l'inizio della polizza.",
})

export const maintenanceInputSchema = z.object({
    vehicle_id: vehicleId,
    title: text("Scrivi il titolo dell'intervento."),
    type: oneOf(MAINTENANCE_TYPES, "Scegli il tipo di intervento."),
    date: date("Scegli una data valida per l'intervento."),
    km_at_maintenance: optional(km),
    cost: optional(cost),
    workshop: optionalText,
    description: optionalText,
})

export const revisionInputSchema = z.object({
    vehicle_id: vehicleId,
    date: date("Scegli una data valida per la revisione."),
    next_revision_date: date("Scegli una data valida per la prossima revisione."),
    km: optional(km),
    cost: optional(cost),
    workshop: optionalText,
    notes: optionalText,
}).refine((value) => value.next_revision_date > value.date, {
    path: ["next_revision_date"], message: "La prossima revisione deve essere successiva a quella registrata.",
})

export const taxInputSchema = z.object({
    vehicle_id: vehicleId,
    year: required(year.max(9999, "Inserisci un anno di quattro cifre.")),
    amount: required(number("Inserisci un importo valido, maggiore o uguale a zero.")),
    paid_date: optionalDate("Inserisci una data di pagamento valida."),
    notes: optionalText,
})

const rate = optional(number("Inserisci un tasso valido tra 0 e 100.").max(100, "Inserisci un tasso valido tra 0 e 100."))

export const financingInputSchema = z.object({
    // Solo se il veicolo non ha ancora la data di acquisto
    purchase_date: optionalDate("Inserisci una data di acquisto valida."),
    down_payment: optional(cost).transform((value) => value ?? 0),
    upfront_fees: optional(cost).transform((value) => value ?? 0),
    installment_amount: required(number("Inserisci l'importo della rata.")),
    installment_count: required(number("Inserisci il numero di rate.").int("Inserisci un numero di rate intero.").min(1, "Inserisci almeno una rata.").max(600, "Inserisci al massimo 600 rate.")),
    first_installment_date: date("Scegli la data della prima rata."),
    balloon_payment: optional(cost),
    balloon_outcome: optionalOneOf(BALLOON_OUTCOMES, "Scegli un esito valido per la maxi-rata."),
    payoff_date: optionalDate("Inserisci una data di estinzione valida."),
    payoff_amount: optional(cost),
    lender: optionalText,
    dealer: optionalText,
    contract_number: optionalText,
    financed_amount: optional(cost),
    tan: rate,
    taeg: rate,
    guaranteed_future_value: optional(cost),
    collection_fee: optional(cost),
    credit_insurance: optionalText,
    notes: optionalText,
}).superRefine((value, ctx) => {
    if (value.balloon_outcome && value.balloon_payment === null) {
        ctx.addIssue({ code: "custom", path: ["balloon_payment"], message: "Inserisci la maxi-rata prima di indicarne l'esito." })
    }
    if ((value.payoff_date === null) !== (value.payoff_amount === null)) {
        ctx.addIssue({ code: "custom", path: [value.payoff_amount === null ? "payoff_amount" : "payoff_date"], message: "Per l'estinzione servono sia la data sia l'importo." })
    }
    if (value.payoff_date && value.payoff_date < value.first_installment_date) {
        ctx.addIssue({ code: "custom", path: ["payoff_date"], message: "L'estinzione non può precedere la prima rata." })
    }
    if (value.payoff_date && value.payoff_date > installmentDate(value.first_installment_date, value.installment_count)) {
        ctx.addIssue({ code: "custom", path: ["payoff_date"], message: "L'estinzione deve cadere entro la fine del piano." })
    }
})

export function inputError(error: z.ZodError): { error: string; field: string } {
    const issue = error.issues[0]
    return { error: issue?.message ?? "Controlla i dati inseriti.", field: String(issue?.path[0] ?? "") }
}
