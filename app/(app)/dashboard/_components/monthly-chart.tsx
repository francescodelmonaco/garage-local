"use client"

import { useState } from "react"
import { BarChart } from "@/components/bar-chart"
import { Note } from "@/components/bits"
import { Panel } from "@/components/panel"
import { euro, euroRound } from "@/lib/format"
import type { MonthlyExpense } from "@/lib/types"
import { cn } from "@/lib/utils"
import { annotatePeak, MONTHS, monthlyValues, SERIES, sumExpenses, type Series } from "../_lib/expenses"

/** Spese mensili di un anno: le categorie sono le schede del grafico. `filters` sono i select di veicolo e anno. */
export function MonthlyChart({ rows, year, filters }: { rows: MonthlyExpense[]; year: number; filters: React.ReactNode }) {
    const [seriesKey, setSeriesKey] = useState<Series["key"]>("tutto")
    const series = SERIES.find((s) => s.key === seriesKey)!
    const values = monthlyValues(rows, year, series.categories)

    return (
        <Panel title="Spese mensili" aside={filters} className="gap-4 lg:col-span-2">
            {/* La scheda selezionata ha la riga da 2px */}
            <div role="tablist" aria-label="Categoria" className="grid grid-cols-2 gap-1 sm:grid-cols-4 sm:gap-0 sm:border-b sm:border-rule">
                {SERIES.map((s) => {
                    const selected = s.key === seriesKey
                    return (
                        <button key={s.key} type="button" role="tab" aria-selected={selected} onClick={() => setSeriesKey(s.key)}
                            className={cn("grid gap-0.5 rounded-lg px-3 py-2 text-left transition-colors sm:-mb-px sm:rounded-none sm:border-b-2 sm:border-transparent sm:px-0 sm:pr-3 sm:hover:border-input",
                                selected && "bg-muted sm:border-foreground sm:bg-transparent sm:hover:border-foreground")}>
                            <span className={cn("text-xs", selected ? "text-foreground" : "text-muted-foreground")}>{s.label}</span>
                            <span className={cn("text-base num", selected ? "font-semibold" : "font-normal")}>{euro(sumExpenses(rows, year, 12, s.categories))}</span>
                        </button>
                    )
                })}
            </div>
            {values.every((v) => v === 0) ? (
                <Note>Nessuna spesa di questo tipo nel {year}.</Note>
            ) : (
                <BarChart
                    label={`${series.label} per mese nel ${year}`}
                    labels={MONTHS}
                    values={values}
                    format={euro}
                    tickFormat={euroRound}
                    height={180}
                    annotations={series.categories === null ? annotatePeak(rows, year, values) : []}
                />
            )}
        </Panel>
    )
}
