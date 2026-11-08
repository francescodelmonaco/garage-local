"use client"

import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { Deadline, DeadlineLabel, EmptyState, LicensePlate, Pending } from "@/components/bits"
import { Panel, Stat, StatGroup } from "@/components/panel"
import { RegisterTable } from "@/components/register-table"
import { RegisterTabs } from "@/components/register-tabs"
import { RowActions } from "@/components/row-actions"
import { TitleRow } from "@/components/title-row"
import { VehicleForm } from "@/components/vehicle-form"
import { useDashboard, useVehicle } from "@/hooks/queries"
import { day, euro, num, vehicleDetails, vehicleName } from "@/lib/format"
import type { RegisterName } from "@/lib/register-meta"
import { PurchasePanel } from "./_components/purchase-panel"

const AVERAGE_NOTE = "media dal giorno di acquisto"
const MISSING_PURCHASE = "manca la data di acquisto"

export default function VehicleDetailPage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()
    const { data: vehicle, isPending, isError } = useVehicle(id)
    const { data: dashboard } = useDashboard()
    const [editing, setEditing] = useState(false)
    const [register, setRegister] = useState<RegisterName>("rifornimenti")

    if (isPending) return <TitleRow title={<Pending className="h-7 w-48" />} subline={<Pending className="h-4 w-64" />} />
    if (isError) {
        return <EmptyState title="Veicolo non trovato."><Link href="/veicoli" className="text-sm hover:underline">Torna ai veicoli</Link></EmptyState>
    }

    const name = vehicleName(vehicle)
    const expense = dashboard?.expenses.find((e) => e.vehicleId === vehicle.id)
    const deadlines = dashboard?.deadlines.filter((d) => d.vehicle.id === vehicle.id) ?? []
    const average = (value: number | null | undefined) => value == null ? MISSING_PURCHASE : AVERAGE_NOTE

    return (
        <>
            <TitleRow
                title={name}
                subline={vehicleDetails(vehicle, vehicle.initial_km !== null && `${num(vehicle.initial_km, "km")} all'acquisto`)}
                actions={
                    <RowActions
                        label={name}
                        noun="Veicolo"
                        url={`/api/vehicles/${vehicle.id}`}
                        onEdit={() => setEditing(true)}
                        deleteDescription="Spariscono anche tutti i registri e il finanziamento del veicolo. Non si può annullare."
                        onDeleted={() => router.push("/veicoli")}
                    />
                }
            >
                <LicensePlate plate={vehicle.plate} />
            </TitleRow>

            <div className="grid gap-4">
                <StatGroup label="Costi del veicolo">
                    <Stat label="Costo di possesso" lead value={expense ? euro(expense.totalCost) : null}
                        sub={vehicle.purchase_date ? `acquisto incluso, dal ${day(vehicle.purchase_date)}` : "acquisto incluso"} />
                    <Stat label="Al mese" value={expense ? euro(expense.monthlyCost) : null} sub={average(expense?.monthlyCost)} />
                    <Stat label="Al giorno" value={expense ? euro(expense.dailyCost) : null} sub={average(expense?.dailyCost)} />
                </StatGroup>

                <div className="grid gap-4 lg:grid-cols-2">
                    <Panel title="Scadenze">
                        {deadlines.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Nessuna polizza, bollo o revisione registrati per questo veicolo.</p>
                        ) : (
                            <ul className="grid divide-y divide-rule">
                                {deadlines.map((d) => (
                                    <li key={d.kind} className="flex min-h-12 items-center justify-between gap-3 py-2">
                                        <span className="text-sm"><DeadlineLabel deadline={d} /></span>
                                        <span className="text-sm">{d.date ? <Deadline date={d.date} /> : <span className="text-muted-foreground">manca la data di pagamento</span>}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </Panel>
                    <PurchasePanel vehicle={vehicle} />
                </div>

                <section aria-label="Registri del veicolo" className="mt-4 min-w-0">
                    <RegisterTabs current={register} onSelect={setRegister} />
                    <RegisterTable key={register} name={register} vehicleId={vehicle.id} />
                </section>
            </div>

            <VehicleForm open={editing} onClose={() => setEditing(false)} vehicle={vehicle} />
        </>
    )
}
