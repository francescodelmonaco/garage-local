import { euroRound } from "@/lib/format"
import type { MonthlyExpense } from "@/lib/types"

export const MONTHS = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"]

// Le schede del grafico: una serie alla volta, il giallo sui dati
export const SERIES = [
    { key: "tutto", label: "Tutte le spese", categories: null },
    { key: "carburante", label: "Carburante", categories: ["rifornimenti"] },
    { key: "manutenzione", label: "Manutenzione", categories: ["manutenzioni"] },
    { key: "polizze", label: "Polizze e tasse", categories: ["assicurazioni", "bollo", "revisioni"] },
] as const satisfies readonly { key: string; label: string; categories: readonly string[] | null }[]

export type Series = (typeof SERIES)[number]

const CATEGORY_LABELS: Record<string, string> = {
    rifornimenti: "Carburante", manutenzioni: "Manutenzione", assicurazioni: "Assicurazione", bollo: "Bollo", revisioni: "Revisione", acquisto: "Acquisto",
}

const inCategories = (row: MonthlyExpense, categories: readonly string[] | null) => !categories || categories.includes(row.category)

/** Totale di un anno fino al mese `months` incluso, eventualmente solo per alcune categorie. */
export function sumExpenses(rows: MonthlyExpense[], year: number, months = 12, categories: readonly string[] | null = null) {
    return rows.filter((r) => r.year === year && r.month <= months && inCategories(r, categories)).reduce((t, r) => t + r.total, 0)
}

/** Dodici totali mensili di una serie. */
export function monthlyValues(rows: MonthlyExpense[], year: number, categories: readonly string[] | null) {
    return MONTHS.map((_, i) => rows.filter((r) => r.year === year && r.month === i + 1 && inCategories(r, categories)).reduce((t, r) => t + r.total, 0))
}

/** Un mese più di tre volte la mediana dei mesi con spese prende un'etichetta con la sua voce principale. */
export function annotatePeak(rows: MonthlyExpense[], year: number, values: number[]) {
    const nonZero = values.filter((v) => v > 0).sort((a, b) => a - b)
    if (nonZero.length < 3) return []
    const median = nonZero[Math.floor(nonZero.length / 2)]
    const peak = values.indexOf(Math.max(...values))
    if (values[peak] < median * 3) return []
    const top = rows.filter((r) => r.year === year && r.month === peak + 1).sort((a, b) => b.total - a.total)[0]
    if (!top) return []
    const label = CATEGORY_LABELS[top.category]
    return [{ at: peak, label: `${label ?? top.category} ${euroRound(top.total)}`, short: label }]
}
