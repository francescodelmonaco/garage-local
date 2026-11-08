import { eq } from "drizzle-orm"
import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/db"
import { vehicleFinancings, vehicles } from "@/db/schema"
import { dbError, isUuid, notFound, parseBody } from "@/lib/api"
import { vehicleInputSchema } from "@/lib/input-validation"

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
    const { id } = await params
    if (!isUuid(id)) return notFound("Veicolo")
    const [row] = await db.select().from(vehicles).leftJoin(vehicleFinancings, eq(vehicleFinancings.vehicle_id, vehicles.id)).where(eq(vehicles.id, id))
    return row ? NextResponse.json({ ...row.vehicles, financing: row.vehicle_financings }) : notFound("Veicolo")
}

export async function PATCH(request: NextRequest, { params }: Params) {
    const { id } = await params
    if (!isUuid(id)) return notFound("Veicolo")
    const parsed = await parseBody(request, vehicleInputSchema)
    if ("response" in parsed) return parsed.response
    try {
        const [row] = await db.update(vehicles).set(parsed.data).where(eq(vehicles.id, id)).returning()
        return row ? NextResponse.json(row) : notFound("Veicolo")
    } catch (error) {
        return dbError(error)
    }
}

/** I registri e il finanziamento si cancellano in cascata (foreign key on delete cascade). */
export async function DELETE(_request: NextRequest, { params }: Params) {
    const { id } = await params
    if (!isUuid(id)) return notFound("Veicolo")
    const [row] = await db.delete(vehicles).where(eq(vehicles.id, id)).returning()
    return row ? NextResponse.json({ ok: true }) : notFound("Veicolo")
}
