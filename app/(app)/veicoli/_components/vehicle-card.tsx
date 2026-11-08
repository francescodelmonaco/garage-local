import Link from "next/link"
import { Deadline, LicensePlate } from "@/components/bits"
import { DEADLINE_LABELS } from "@/lib/deadlines"
import { euro, vehicleDetails, vehicleName } from "@/lib/format"
import type { Deadline as DeadlineRow, Vehicle, VehicleExpense } from "@/lib/types"
import { cn } from "@/lib/utils"

/** Card cliccabile del veicolo: identità, costo di possesso, prossima scadenza. `wide` quando è l'unico in elenco. */
export function VehicleCard({ vehicle, expense, next, wide }: { vehicle: Vehicle; expense?: VehicleExpense; next?: DeadlineRow; wide: boolean }) {
    return (
        <Link href={`/veicoli/${vehicle.id}`}
            className={cn("grid gap-4 rounded-xl bg-card p-[22px] transition-[background-color,transform] duration-150 hover:-translate-y-0.5 hover:bg-muted",
                wide && "sm:grid-cols-[1fr_auto_auto] sm:items-center sm:gap-10")}>
            <div className="grid gap-2">
                <LicensePlate plate={vehicle.plate} />
                <span className="text-base font-semibold">{vehicleName(vehicle)}</span>
                <span className="text-xs text-faint">{vehicleDetails(vehicle)}</span>
            </div>
            <Figure label="Costo di possesso">
                <span className="text-xl font-medium num">{euro(expense?.totalCost)}</span>
                <span className="text-xs text-faint">{expense?.monthlyCost != null ? `${euro(expense.monthlyCost)} al mese` : "manca la data di acquisto"}</span>
            </Figure>
            <Figure label="Prossima scadenza">
                {next ? (
                    <>
                        <span className="text-sm">{DEADLINE_LABELS[next.kind]}</span>
                        <span className="text-sm"><Deadline date={next.date} /></span>
                    </>
                ) : <span className="text-sm text-faint">—</span>}
            </Figure>
        </Link>
    )
}

function Figure({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="grid gap-0.5">
            <span className="text-xs text-muted-foreground">{label}</span>
            {children}
        </div>
    )
}
