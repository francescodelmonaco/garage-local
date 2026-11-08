import { eq } from "drizzle-orm"
import type { PgTable } from "drizzle-orm/pg-core"
import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/db"
import { badRequest, dbError, isUuid, notFound } from "@/lib/api"
import { getRegister } from "@/lib/registers"

export async function POST(_request: NextRequest, { params }: { params: Promise<{ register: string; id: string }> }) {
    const { register: name, id } = await params
    const register = getRegister(name)
    if (!register || !isUuid(id)) return notFound()
    const [source] = await db.select().from(register.table as PgTable).where(eq(register.table.id, id))
    if (!source) return notFound()
    // Ripassa dalla validazione: una vecchia riga incompleta va corretta prima di duplicarla
    const parsed = register.schema.safeParse(source)
    if (!parsed.success) return badRequest({ error: "Correggi la riga prima di duplicarla." })
    try {
        const [row] = await db.insert(register.table as PgTable).values(parsed.data as never).returning()
        return NextResponse.json(row, { status: 201 })
    } catch (error) {
        return dbError(error)
    }
}
