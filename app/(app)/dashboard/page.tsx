"use client"

import { format } from "date-fns"
import { Plus } from "lucide-react"
import { useState } from "react"
import { BlockError, EmptyState, Pending } from "@/components/bits"
import { Stat, StatGroup } from "@/components/panel"
import { RecordForm } from "@/components/record-form"
import { TitleRow } from "@/components/title-row"
import { Button } from "@/components/ui/button"
import { VehicleForm } from "@/components/vehicle-form"
import { useDashboard } from "@/hooks/queries"
import { daysUntil } from "@/lib/deadlines"
import { day, plural, vehicleName } from "@/lib/format"
import { registerMeta } from "@/lib/register-meta"
import type { Deadline } from "@/lib/types"
import { Overview } from "./_components/overview"

export default function DashboardPage() {
    const { data, isPending, isError, refetch } = useDashboard()
    const [form, setForm] = useState<"refuel" | "vehicle" | null>(null)
    const hasVehicles = !!data?.vehicles.length

    return (
        <>
            <TitleRow
                title="Panoramica"
                subline={isPending ? <Pending className="h-4 w-72" /> : data && nextDeadlineSentence(data.deadlines)}
                actions={hasVehicles && <Button onClick={() => setForm("refuel")}><Plus />Aggiungi rifornimento</Button>}
            />

            {isError ? <BlockError what="la panoramica" onRetry={() => refetch()} />
                : isPending ? <DashboardSkeleton />
                    : !hasVehicles ? (
                        <EmptyState title="Il garage è vuoto: aggiungi il primo veicolo per registrarne spese e scadenze.">
                            <Button onClick={() => setForm("vehicle")}><Plus />Aggiungi veicolo</Button>
                        </EmptyState>
                    ) : <Overview data={data} />}

            <RecordForm
                open={form === "refuel"}
                onClose={() => setForm(null)}
                title="Aggiungi rifornimento"
                fields={registerMeta.rifornimenti.fields}
                initial={{ vehicle_id: data?.vehicles.length === 1 ? data.vehicles[0].id : undefined, date: format(new Date(), "yyyy-MM-dd") }}
                request={{ url: "/api/registri/rifornimenti", method: "POST" }}
                successMessage="Rifornimento aggiunto"
            />
            <VehicleForm open={form === "vehicle"} onClose={() => setForm(null)} />
        </>
    )
}

/** La frase sotto il titolo: la scadenza più vicina, in parole. */
function nextDeadlineSentence(deadlines: Deadline[]) {
    const next = deadlines.find((d) => d.date)
    if (!next?.date) {
        const missingTax = deadlines.find((d) => d.kind === "bollo" && !d.date)
        return missingTax ? `Manca la data di pagamento del bollo ${missingTax.detail} di ${vehicleName(missingTax.vehicle)}.` : "Nessuna scadenza registrata."
    }
    const days = daysUntil(next.date)
    const subject = next.kind === "bollo" ? `Il bollo ${next.detail}` : next.kind === "assicurazione" ? "L'assicurazione" : "La revisione"
    const what = `${subject} dell'${vehicleName(next.vehicle)}`
    if (days < 0) return `${what} è scadut${next.kind === "bollo" ? "o" : "a"} il ${day(next.date)}.`
    if (days === 0) return `${what} scade oggi.`
    return `${what} scade il ${day(next.date)}, tra ${days} ${plural(days, "giorno", "giorni")}.`
}

function DashboardSkeleton() {
    return (
        <div className="grid gap-4" aria-busy="true">
            <StatGroup>
                {[0, 1, 2].map((i) => <Stat key={i} label={<Pending className="h-3 w-24" />} value={null} sub={<Pending className="h-3 w-40" />} />)}
            </StatGroup>
            <div className="grid gap-4 lg:grid-cols-3">
                <div className="h-[380px] rounded-xl bg-card lg:col-span-2" />
                <div className="h-[380px] rounded-xl bg-card" />
            </div>
        </div>
    )
}
