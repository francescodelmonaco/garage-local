import { desc, eq, sql } from "drizzle-orm"
import { differenceInCalendarDays, parseISO } from "date-fns"
import { NextResponse } from "next/server"
import { db } from "@/db"
import { vehicleFinancings, vehicles } from "@/db/schema"
import { summarizeFinancing } from "@/lib/financing"
import type { DashboardData, Deadline, MonthlyExpense, VehicleExpense } from "@/lib/types"

// Somme per veicolo dei 5 registri
const totalsQuery = sql`
    select v.id as vehicle_id,
        coalesce((select sum(cost) from maintenances where vehicle_id = v.id), 0)
      + coalesce((select sum(cost) from refuelings where vehicle_id = v.id), 0)
      + coalesce((select sum(cost) from insurances where vehicle_id = v.id), 0)
      + coalesce((select sum(amount) from taxes where vehicle_id = v.id), 0)
      + coalesce((select sum(cost) from revisions where vehicle_id = v.id), 0) as total
    from vehicles v`

// Ultima polizza, revisione e bollo per veicolo; il bollo scade un anno dopo il pagamento
const deadlinesQuery = sql`
    select * from (select distinct on (vehicle_id) vehicle_id, 'assicurazione' as kind, id, end_date::text as date, company::text as detail
        from insurances order by vehicle_id, end_date desc, id desc) i
    union all
    select * from (select distinct on (vehicle_id) vehicle_id, 'revisione', id, next_revision_date::text, null
        from revisions order by vehicle_id, next_revision_date desc, id desc) r
    union all
    select * from (select distinct on (vehicle_id) vehicle_id, 'bollo', id, (paid_date + interval '1 year')::date::text, year::text
        from taxes order by vehicle_id, year desc, paid_date desc nulls last, id desc) t`

// Ogni spesa nel mese del pagamento: assicurazione su start_date, bollo su paid_date (o gennaio dell'anno)
const monthlyQuery = sql`
    with expenses as (
        select vehicle_id, date as day, 'manutenzioni' as category, cost as amount from maintenances
        union all select vehicle_id, date, 'rifornimenti', cost from refuelings
        union all select vehicle_id, start_date, 'assicurazioni', cost from insurances
        union all select vehicle_id, coalesce(paid_date, make_date(year, 1, 1)), 'bollo', amount from taxes
        union all select vehicle_id, date, 'revisioni', cost from revisions
    )
    select vehicle_id, extract(year from day)::int as year, extract(month from day)::int as month, category, sum(amount) as total
    from expenses where amount is not null group by 1, 2, 3, 4`

export async function GET() {
    const [rows, totals, deadlineRows, monthlyRows] = await Promise.all([
        db.select().from(vehicles).leftJoin(vehicleFinancings, eq(vehicleFinancings.vehicle_id, vehicles.id)).orderBy(desc(vehicles.created_at)),
        db.execute<{ vehicle_id: string; total: string }>(totalsQuery),
        db.execute<{ vehicle_id: string; kind: Deadline["kind"]; id: string; date: string | null; detail: string | null }>(deadlinesQuery),
        db.execute<{ vehicle_id: string; year: number; month: number; category: string; total: string }>(monthlyQuery),
    ])

    const totalByVehicle = new Map(totals.map((row) => [row.vehicle_id, Number(row.total)]))
    const monthly: MonthlyExpense[] = monthlyRows.map((row) => ({ ...row, total: Number(row.total) }))
    const today = new Date()
    const expenses: VehicleExpense[] = []

    for (const { vehicles: vehicle, vehicle_financings: financing } of rows) {
        // Acquisto: finanziato = voci già pagate, ognuna nel suo mese; contanti = prezzo nel mese di acquisto
        const payments = financing && vehicle.purchase_date
            ? summarizeFinancing(financing, vehicle.purchase_date, vehicle.purchase_price, today).paidPayments
            : vehicle.purchase_price !== null ? [{ date: vehicle.purchase_date, amount: vehicle.purchase_price }] : []
        for (const { date, amount } of payments) {
            if (!date) continue // senza data resta fuori dal grafico, non dal totale
            const day = parseISO(date)
            monthly.push({ vehicle_id: vehicle.id, year: day.getFullYear(), month: day.getMonth() + 1, category: "acquisto", total: amount })
        }

        const totalCost = payments.reduce((sum, payment) => sum + payment.amount, 0) + (totalByVehicle.get(vehicle.id) ?? 0)
        const days = vehicle.purchase_date ? Math.max(1, differenceInCalendarDays(today, parseISO(vehicle.purchase_date))) : null
        expenses.push({
            vehicleId: vehicle.id,
            totalCost,
            dailyCost: days ? totalCost / days : null,
            monthlyCost: days ? (totalCost / days) * 30 : null,
            yearlyCost: days ? (totalCost / days) * 365 : null,
        })
    }

    const byId = new Map(rows.map(({ vehicles: v }) => [v.id, { id: v.id, brand: v.brand, model: v.model, plate: v.plate }]))
    const deadlines: Deadline[] = deadlineRows
        .map(({ vehicle_id, ...row }) => ({ ...row, vehicle: byId.get(vehicle_id)! }))
        // Prima le scadenze datate (dalla più vicina), poi i bolli senza data di pagamento
        .sort((a, b) => a.date === null ? (b.date === null ? 0 : 1) : b.date === null ? -1 : a.date.localeCompare(b.date))

    const body: DashboardData = { vehicles: rows.map((row) => row.vehicles), expenses, deadlines, monthly }
    return NextResponse.json(body)
}

export const dynamic = "force-dynamic"
