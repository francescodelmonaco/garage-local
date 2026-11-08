import { addMonths, format, parseISO } from "date-fns"
import type { VehicleFinancing } from "../db/schema"

/** Campi del finanziamento che entrano nei calcoli; il resto è archivio del contratto. */
export type FinancingPlan = Pick<VehicleFinancing,
    "down_payment" | "upfront_fees" | "installment_amount" | "installment_count" | "first_installment_date"
    | "balloon_payment" | "balloon_outcome" | "payoff_date" | "payoff_amount">

export type FinancingSummary = {
    /** Voci con data ≤ oggi; la maxi-rata solo se riscattata */
    paid: number
    /** Anticipo, spese, rate e maxi-rata (salvo restituzione), oppure rate fino all'estinzione + saldo */
    total: number
    remaining: number
    /** Costo totale previsto − prezzo in contanti: interessi e spese. null senza prezzo o con restituzione */
    financingCost: number | null
    /** Data della maxi-rata, null se non prevista o se il finanziamento è estinto */
    balloonDate: string | null
    /** Ultimo pagamento del piano: estinzione, maxi-rata o ultima rata */
    endDate: string
    /** Maxi-rata già scaduta senza esito indicato */
    needsBalloonOutcome: boolean
    /** Voci già pagate con la loro data: alimentano la categoria "acquisto" del grafico mensile */
    paidPayments: { date: string; amount: number }[]
}

const iso = (date: Date) => format(date, "yyyy-MM-dd")

/** Rata i-esima, sempre calcolata dalla prima: 31/01 → 28/02 → 31/03, come `make_interval` in SQL. */
export function installmentDate(firstInstallmentDate: string, index: number): string {
    return iso(addMonths(parseISO(firstInstallmentDate), index))
}

/**
 * Unica implementazione del piano (app/api/dashboard/route.ts usa queste stesse voci per il grafico):
 * firma al purchase_date, rate mensili, maxi-rata il mese dopo l'ultima rata, estinzione.
 */
export function summarizeFinancing(plan: FinancingPlan, purchaseDate: string, purchasePrice: number | null, today = new Date()): FinancingSummary {
    const todayIso = iso(today)
    const payments: { date: string; amount: number }[] = [{ date: purchaseDate, amount: plan.down_payment + plan.upfront_fees }]

    let lastInstallment = plan.first_installment_date
    for (let i = 0; i < plan.installment_count; i++) {
        const date = installmentDate(plan.first_installment_date, i)
        if (plan.payoff_date && date > plan.payoff_date) break
        payments.push({ date, amount: plan.installment_amount })
        lastInstallment = date
    }

    const paidPayments = payments.filter((payment) => payment.date <= todayIso)
    let balloonDate: string | null = null
    let endDate = lastInstallment
    let needsBalloonOutcome = false

    if (plan.payoff_date && plan.payoff_amount !== null) {
        payments.push({ date: plan.payoff_date, amount: plan.payoff_amount })
        if (plan.payoff_date <= todayIso) paidPayments.push({ date: plan.payoff_date, amount: plan.payoff_amount })
        endDate = plan.payoff_date
    } else if (plan.balloon_payment !== null) {
        balloonDate = installmentDate(plan.first_installment_date, plan.installment_count)
        endDate = balloonDate
        if (plan.balloon_outcome !== "Restituzione") payments.push({ date: balloonDate, amount: plan.balloon_payment })
        if (plan.balloon_outcome === "Riscatto" && balloonDate <= todayIso) paidPayments.push({ date: balloonDate, amount: plan.balloon_payment })
        needsBalloonOutcome = plan.balloon_outcome === null && balloonDate <= todayIso
    }

    const sum = (list: { amount: number }[]) => list.reduce((total, payment) => total + payment.amount, 0)
    const total = sum(payments)
    const paid = sum(paidPayments)

    return {
        paid,
        total,
        remaining: total - paid,
        financingCost: purchasePrice !== null && plan.balloon_outcome !== "Restituzione" ? total - purchasePrice : null,
        balloonDate,
        endDate,
        needsBalloonOutcome,
        paidPayments,
    }
}
