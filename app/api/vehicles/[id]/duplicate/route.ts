import { eq } from "drizzle-orm"
import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/db"
import { vehicles } from "@/db/schema"
import { badRequest, dbError, isUuid, notFound } from "@/lib/api"
import { vehicleInputSchema } from "@/lib/input-validation"

/** Copia senza targa (va inserita quella del nuovo mezzo) e senza finanziamento. */
export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    if (!isUuid(id)) return notFound("Veicolo")
    const [source] = await db.select().from(vehicles).where(eq(vehicles.id, id))
    if (!source) return notFound("Veicolo")
    const parsed = vehicleInputSchema.safeParse({ ...source, plate: "" })
    if (!parsed.success) return badRequest({ error: "Correggi il veicolo prima di duplicarlo." })
    try {
        const [row] = await db.insert(vehicles).values(parsed.data).returning()
        return NextResponse.json(row, { status: 201 })
    } catch (error) {
        return dbError(error)
    }
}
