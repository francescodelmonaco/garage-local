"use client"

import { useState } from "react"
import { Stat, StatGroup } from "@/components/panel"
import { NativeSelect } from "@/components/ui/native-select"
import { day, euro, plural, vehicleName } from "@/lib/format"
import type { DashboardData } from "@/lib/types"
import { cn } from "@/lib/utils"
import { MONTHS, sumExpenses } from "../_lib/expenses"
import { DeadlinesPanel } from "./deadlines-panel"
import { MonthlyChart } from "./monthly-chart"
import { RecentPanel } from "./recent-panel"

const FILTER_CLASS = "h-9 w-auto rounded-full bg-transparent text-sm"

/** Corpo della panoramica: saldi dell'anno, grafico mensile, scadenze, ultime righe. */
export function Overview({ data }: { data: DashboardData }) {
    const currentYear = new Date().getFullYear()
    const years = [...new Set([currentYear, ...data.monthly.map((r) => r.year)])].sort((a, b) => b - a)
    const [year, setYear] = useState(currentYear)
    const [vehicleId, setVehicleId] = useState("")
    const multi = data.vehicles.length > 1
    const ofVehicle = (id: string) => !vehicleId || id === vehicleId

    const rows = data.monthly.filter((r) => ofVehicle(r.vehicle_id))
    // Nell'anno in corso il confronto è sugli stessi mesi dell'anno prima
    const monthsElapsed = year === currentYear ? new Date().getMonth() + 1 : 12
    const spent = sumExpenses(rows, year)
    const change = sumExpenses(rows, year, monthsElapsed) - sumExpenses(rows, year - 1, monthsElapsed)
    const hasPrevious = rows.some((r) => r.year === year - 1)
    const baseline = year === currentYear ? `rispetto a gen–${MONTHS[monthsElapsed - 1]} ${year - 1}` : `rispetto al ${year - 1}`
    const ownership = data.expenses.filter((e) => ofVehicle(e.vehicleId)).reduce((t, e) => t + e.totalCost, 0)
    const firstPurchase = data.vehicles.filter((v) => ofVehicle(v.id)).map((v) => v.purchase_date).filter(Boolean).sort()[0]

    const filters = (
        <div className="flex gap-2">
            {multi && (
                <NativeSelect aria-label="Veicolo" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} className={FILTER_CLASS}>
                    <option value="">Tutti i veicoli</option>
                    {data.vehicles.map((v) => <option key={v.id} value={v.id}>{vehicleName(v)}</option>)}
                </NativeSelect>
            )}
            <NativeSelect aria-label="Anno" value={year} onChange={(e) => setYear(Number(e.target.value))} className={FILTER_CLASS}>
                {years.map((y) => <option key={y}>{y}</option>)}
            </NativeSelect>
        </div>
    )

    return (
        <div className="grid gap-4">
            <StatGroup label={`Spese ${year}`}>
                <Stat label={`Speso nel ${year}`} value={euro(spent)} lead sub={hasPrevious ? (
                    <>
                        <span className={cn("num", change > 0 && "text-destructive")}>{change > 0 ? "+" : change < 0 ? "−" : ""}{euro(Math.abs(change))}</span> {baseline}
                    </>
                ) : `Nessuna spesa registrata nel ${year - 1}`} />
                <Stat label="Media al mese" value={euro(spent / monthsElapsed)} sub={`su ${monthsElapsed} ${plural(monthsElapsed, "mese", "mesi")} del ${year}`} />
                <Stat label="Costo di possesso" value={euro(ownership)} sub={firstPurchase ? `acquisto incluso, dal ${day(firstPurchase)}` : "acquisto incluso"} />
            </StatGroup>

            <div className="grid gap-4 lg:grid-cols-3">
                <MonthlyChart rows={rows} year={year} filters={filters} />
                <DeadlinesPanel deadlines={data.deadlines} multi={multi} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <RecentPanel name="rifornimenti" />
                <RecentPanel name="manutenzioni" />
            </div>
        </div>
    )
}
