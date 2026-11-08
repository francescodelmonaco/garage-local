import { and, asc, count, desc, eq, ilike, or, sum, getTableColumns, type SQL } from "drizzle-orm"
import type { PgTable } from "drizzle-orm/pg-core"
import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/db"
import { vehicles } from "@/db/schema"
import { dbError, isUuid, notFound, parseBody } from "@/lib/api"
import { getRegister, vehicleSort } from "@/lib/registers"
import { PAGE_SIZE } from "@/lib/register-meta"

type Params = { params: Promise<{ register: string }> }

/** Righe paginate con veicolo collegato, numero totale e somma dell'importo su tutte le righe filtrate. */
export async function GET(request: NextRequest, { params }: Params) {
    const register = getRegister((await params).register)
    if (!register) return notFound("Registro")
    const { table, amount, sorts } = register
    const query = request.nextUrl.searchParams

    const vehicleId = query.get("vehicleId")
    const search = query.get("search")?.trim()
    const pattern = search ? `%${search}%` : null
    const where = and(
        isUuid(vehicleId) ? eq(table.vehicle_id, vehicleId) : undefined,
        pattern ? or(ilike(vehicles.brand, pattern), ilike(vehicles.model, pattern), ilike(vehicles.plate, pattern)) : undefined,
    )

    // Ordinamento solo su colonne in whitelist: "-date" = discendente
    const sortParam = query.get("sort") ?? ""
    const sortKey = sortParam.replace(/^-/, "")
    const sortColumn = { ...sorts, ...vehicleSort }[sortKey as keyof typeof sorts] ?? Object.values(sorts)[0]
    const direction = sortParam.startsWith("-") || !sortParam ? desc : asc
    const orderBy: SQL[] = [direction(sortColumn), desc(table.id)]

    const page = Math.max(0, Number(query.get("page")) || 0)
    const join = eq(vehicles.id, table.vehicle_id)

    const [rows, [stats]] = await Promise.all([
        db.select({ ...getTableColumns(table as PgTable), vehicle: { id: vehicles.id, brand: vehicles.brand, model: vehicles.model, plate: vehicles.plate } })
            .from(table as PgTable).innerJoin(vehicles, join).where(where).orderBy(...orderBy).limit(PAGE_SIZE).offset(page * PAGE_SIZE),
        db.select({ count: count(), total: sum(amount).mapWith(Number) }).from(table as PgTable).innerJoin(vehicles, join).where(where),
    ])

    // Registri con scadenza: segna la riga in corso di ogni veicolo
    const current = new Set<string>()
    if ("latest" in register && rows.length) {
        const latest = await db.selectDistinctOn([table.vehicle_id], { id: table.id }).from(table as PgTable)
            .orderBy(table.vehicle_id, ...register.latest)
        for (const row of latest) current.add(row.id)
    }

    return NextResponse.json({
        rows: rows.map((row) => ({ ...row, current: current.has((row as unknown as { id: string }).id) })),
        count: stats.count,
        total: stats.total ?? 0,
        pageSize: PAGE_SIZE,
    })
}

export async function POST(request: NextRequest, { params }: Params) {
    const register = getRegister((await params).register)
    if (!register) return notFound("Registro")
    const parsed = await parseBody(request, register.schema)
    if ("response" in parsed) return parsed.response
    try {
        const [row] = await db.insert(register.table as PgTable).values(parsed.data as never).returning()
        return NextResponse.json(row, { status: 201 })
    } catch (error) {
        return dbError(error)
    }
}
