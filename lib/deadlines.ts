import { addYears, differenceInCalendarDays, format, parseISO } from "date-fns"

/** Sotto questa soglia una scadenza è "in scadenza". Unica per registri e dashboard. */
export const SOON_DAYS = 30

export type DeadlineStatus = "expired" | "soon" | "ok"
export type DeadlineKind = "assicurazione" | "revisione" | "bollo"

export const DEADLINE_LABELS: Record<DeadlineKind, string> = { assicurazione: "Assicurazione", revisione: "Revisione", bollo: "Bollo" }
/** Registro in cui si gestisce ogni tipo di scadenza. */
export const DEADLINE_LINKS: Record<DeadlineKind, string> = { assicurazione: "/assicurazioni", revisione: "/revisioni", bollo: "/bollo" }

/** Bollo valido per un anno dal pagamento; il 29 febbraio diventa il 28 febbraio. */
export function taxDueDate(paidDate: string | null): string | null {
    return paidDate ? format(addYears(parseISO(paidDate), 1), "yyyy-MM-dd") : null
}

/** Giorni di calendario da oggi alla data (negativi se passata). `parseISO` legge "yyyy-MM-dd" come mezzanotte locale. */
export function daysUntil(date: string, today = new Date()) {
    return differenceInCalendarDays(parseISO(date), today)
}

export function deadlineStatus(days: number): DeadlineStatus {
    if (days < 0) return "expired"
    if (days <= SOON_DAYS) return "soon"
    return "ok"
}

export function describeDeadline(days: number) {
    if (days < 0) return "Scaduta"
    if (days === 0) return "Scade oggi"
    if (days === 1) return "Scade domani"
    return `Tra ${days} giorni`
}
