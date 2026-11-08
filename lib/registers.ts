import { desc, sql, type SQL } from "drizzle-orm"
import type { PgColumn } from "drizzle-orm/pg-core"
import { insurances, maintenances, refuelings, revisions, taxes, vehicles } from "@/db/schema"
import { insuranceInputSchema, maintenanceInputSchema, refuelingInputSchema, revisionInputSchema, taxInputSchema } from "./input-validation"
import type { RegisterName } from "./register-meta"

/** Lato server dei 5 registri: tabella, validazione, colonna dell'importo e ordinamenti ammessi. */
export const registers = {
    rifornimenti: {
        table: refuelings, schema: refuelingInputSchema, amount: refuelings.cost,
        sorts: { date: refuelings.date, cost: refuelings.cost, liters: refuelings.liters, price_per_liter: refuelings.price_per_liter },
    },
    manutenzioni: {
        table: maintenances, schema: maintenanceInputSchema, amount: maintenances.cost,
        sorts: { date: maintenances.date, cost: maintenances.cost, title: maintenances.title, km_at_maintenance: maintenances.km_at_maintenance },
    },
    assicurazioni: {
        table: insurances, schema: insuranceInputSchema, amount: insurances.cost,
        sorts: { end_date: insurances.end_date, start_date: insurances.start_date, cost: insurances.cost, company: insurances.company },
        // La riga in corso per veicolo: solo lei ha uno stato di scadenza, le altre sono storico
        latest: [desc(insurances.end_date), desc(insurances.id)],
    },
    bollo: {
        table: taxes, schema: taxInputSchema, amount: taxes.amount,
        sorts: { year: taxes.year, paid_date: taxes.paid_date, amount: taxes.amount },
        latest: [desc(taxes.year), sql`${taxes.paid_date} desc nulls last`, desc(taxes.id)],
    },
    revisioni: {
        table: revisions, schema: revisionInputSchema, amount: revisions.cost,
        sorts: { date: revisions.date, next_revision_date: revisions.next_revision_date, cost: revisions.cost },
        latest: [desc(revisions.next_revision_date), desc(revisions.id)],
    },
} satisfies Record<RegisterName, { sorts: Record<string, PgColumn>; latest?: SQL[] } & Record<string, unknown>>

export const vehicleSort = { vehicle: vehicles.brand } as const

export function getRegister(name: string) {
    return Object.hasOwn(registers, name) ? registers[name as RegisterName] : null
}
