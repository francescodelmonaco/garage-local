import { desc } from "drizzle-orm"
import { NextResponse, type NextRequest } from "next/server"
import { db } from "@/db"
import { vehicles } from "@/db/schema"
import { dbError, parseBody } from "@/lib/api"
import { vehicleInputSchema } from "@/lib/input-validation"

export async function GET() {
    return NextResponse.json(await db.select().from(vehicles).orderBy(desc(vehicles.created_at)))
}

export async function POST(request: NextRequest) {
    const parsed = await parseBody(request, vehicleInputSchema)
    if ("response" in parsed) return parsed.response
    try {
        const [row] = await db.insert(vehicles).values(parsed.data).returning()
        return NextResponse.json(row, { status: 201 })
    } catch (error) {
        return dbError(error)
    }
}

export const dynamic = "force-dynamic"
