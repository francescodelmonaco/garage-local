import { eq } from "drizzle-orm"
import type { PgTable } from "drizzle-orm/pg-core"
import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/db"
import { dbError, isUuid, notFound, parseBody } from "@/lib/api"
import { getRegister } from "@/lib/registers"

type Params = { params: Promise<{ register: string; id: string }> }

export async function PATCH(request: NextRequest, { params }: Params) {
    const { register: name, id } = await params
    const register = getRegister(name)
    if (!register || !isUuid(id)) return notFound()
    const parsed = await parseBody(request, register.schema)
    if ("response" in parsed) return parsed.response
    try {
        const [row] = await db.update(register.table as PgTable).set(parsed.data as never).where(eq(register.table.id, id)).returning()
        return row ? NextResponse.json(row) : notFound()
    } catch (error) {
        return dbError(error)
    }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
    const { register: name, id } = await params
    const register = getRegister(name)
    if (!register || !isUuid(id)) return notFound()
    const [row] = await db.delete(register.table as PgTable).where(eq(register.table.id, id)).returning()
    return row ? NextResponse.json({ ok: true }) : notFound()
}
