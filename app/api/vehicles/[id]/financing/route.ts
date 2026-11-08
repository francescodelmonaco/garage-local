import { eq } from "drizzle-orm"
import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/db"
import { vehicleFinancings, vehicles } from "@/db/schema"
import { badRequest, dbError, isUuid, notFound, parseBody } from "@/lib/api"
import { financingInputSchema } from "@/lib/input-validation"

type Params = { params: Promise<{ id: string }> }

/** Upsert: un finanziamento per veicolo. Imposta anche la data di acquisto se manca, nella stessa transazione. */
export async function PUT(request: NextRequest, { params }: Params) {
    const { id } = await params
    if (!isUuid(id)) return notFound("Veicolo")
    const parsed = await parseBody(request, financingInputSchema)
    if ("response" in parsed) return parsed.response
    const { purchase_date, ...plan } = parsed.data

    const [vehicle] = await db.select({ purchase_date: vehicles.purchase_date }).from(vehicles).where(eq(vehicles.id, id))
    if (!vehicle) return notFound("Veicolo")
    const purchaseDate = vehicle.purchase_date ?? purchase_date
    if (!purchaseDate) return badRequest({ error: "Inserisci la data di acquisto del veicolo.", field: "purchase_date" })
    if (plan.first_installment_date < purchaseDate) {
        return badRequest({ error: "La prima rata non può precedere la data di acquisto.", field: "first_installment_date" })
    }

    try {
        const row = await db.transaction(async (tx) => {
            if (!vehicle.purchase_date) await tx.update(vehicles).set({ purchase_date: purchaseDate }).where(eq(vehicles.id, id))
            const [saved] = await tx.insert(vehicleFinancings).values({ ...plan, vehicle_id: id })
                .onConflictDoUpdate({ target: vehicleFinancings.vehicle_id, set: plan }).returning()
            return saved
        })
        return NextResponse.json(row)
    } catch (error) {
        return dbError(error)
    }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
    const { id } = await params
    if (!isUuid(id)) return notFound("Finanziamento")
    const [row] = await db.delete(vehicleFinancings).where(eq(vehicleFinancings.vehicle_id, id)).returning()
    return row ? NextResponse.json({ ok: true }) : notFound("Finanziamento")
}
