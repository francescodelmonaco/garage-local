"use client"

import { Plus } from "lucide-react"
import { useState } from "react"
import { BlockError, EmptyState, Pending } from "@/components/bits"
import { TitleRow } from "@/components/title-row"
import { Button } from "@/components/ui/button"
import { VehicleForm } from "@/components/vehicle-form"
import { useDashboard } from "@/hooks/queries"
import { euro, plural } from "@/lib/format"
import { cn } from "@/lib/utils"
import { VehicleCard } from "./_components/vehicle-card"

export default function VehiclesPage() {
    const { data, isPending, isError, refetch } = useDashboard()
    const [adding, setAdding] = useState(false)
    const vehicles = data?.vehicles ?? []
    const addButton = <Button onClick={() => setAdding(true)}><Plus />Aggiungi veicolo</Button>
    // Colonne scelte dal numero di veicoli: uno solo prende tutta la riga
    const columns = vehicles.length === 1 ? "" : vehicles.length === 2 ? "md:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-3"
    const subline = data && `${vehicles.length} ${plural(vehicles.length, "veicolo", "veicoli")} · ${euro(data.expenses.reduce((t, e) => t + e.totalCost, 0))} di costo di possesso`

    return (
        <>
            <TitleRow title="Veicoli" subline={isPending ? <Pending className="h-4 w-40" /> : subline} actions={addButton} />
            {isError ? <BlockError what="i veicoli" onRetry={() => refetch()} />
                : isPending ? <div className="h-36 rounded-xl bg-card" aria-busy="true" />
                    : vehicles.length === 0 ? <EmptyState title="Il garage è vuoto: aggiungi il primo veicolo.">{addButton}</EmptyState>
                        : (
                            <div className={cn("grid gap-4", columns)}>
                                {vehicles.map((vehicle) => (
                                    <VehicleCard
                                        key={vehicle.id}
                                        vehicle={vehicle}
                                        expense={data.expenses.find((e) => e.vehicleId === vehicle.id)}
                                        next={data.deadlines.find((d) => d.vehicle.id === vehicle.id && d.date)}
                                        wide={vehicles.length === 1}
                                    />
                                ))}
                            </div>
                        )}
            <VehicleForm open={adding} onClose={() => setAdding(false)} />
        </>
    )
}
