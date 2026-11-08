import { format, parseISO } from "date-fns"
import { it } from "date-fns/locale"
import type { Vehicle } from "./types"

const euroFormat = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" })
const euroRoundFormat = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 })
const numberFormat = new Intl.NumberFormat("it-IT", { maximumFractionDigits: 2 })

export const euro = (value: number | null | undefined) => value == null ? "—" : euroFormat.format(value)
/** Euro senza decimali: tick e etichette del grafico. */
export const euroRound = (value: number) => euroRoundFormat.format(value)
export const num = (value: number | null | undefined, unit?: string) => value == null ? "—" : `${numberFormat.format(value)}${unit ? ` ${unit}` : ""}`
export const day = (value: string | null | undefined) => value ? format(parseISO(value), "d MMM yyyy", { locale: it }) : "—"
export const plural = (count: number, one: string, many: string) => count === 1 ? one : many

export const vehicleName = (vehicle: { brand: string; model: string }) => `${vehicle.brand} ${vehicle.model}`
/** "Auto · Benzina · 2019", con eventuali dettagli in coda. */
export const vehicleDetails = (vehicle: Pick<Vehicle, "vehicle_type" | "fuel_type" | "year">, ...extra: (string | false)[]) =>
    [vehicle.vehicle_type, vehicle.fuel_type, vehicle.year, ...extra].filter(Boolean).join(" · ")
