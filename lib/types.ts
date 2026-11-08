import type { Vehicle, VehicleFinancing } from "@/db/schema"
import type { DeadlineKind } from "./deadlines"

export type { Vehicle, VehicleFinancing }
export type VehicleRef = Pick<Vehicle, "id" | "brand" | "model" | "plate">
export type VehicleWithFinancing = Vehicle & { financing: VehicleFinancing | null }

export type VehicleExpense = {
    vehicleId: string
    totalCost: number
    /** null senza data di acquisto: le medie non sono calcolabili */
    yearlyCost: number | null
    monthlyCost: number | null
    dailyCost: number | null
}

/** Ultima polizza, revisione o bollo per veicolo. Il bollo senza data di pagamento non ha scadenza. */
export type Deadline = {
    id: string
    kind: DeadlineKind
    date: string | null
    detail: string | null
    vehicle: VehicleRef
}

export type MonthlyExpense = { vehicle_id: string; year: number; month: number; category: string; total: number }

export type DashboardData = {
    vehicles: Vehicle[]
    expenses: VehicleExpense[]
    deadlines: Deadline[]
    monthly: MonthlyExpense[]
}
