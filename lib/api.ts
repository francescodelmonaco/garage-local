import { NextResponse } from "next/server"
import type { z } from "zod"
import { inputError } from "./input-validation"

/** Corpo delle risposte di errore, letto da lib/fetcher.ts. */
export type ErrorBody = { error: string; field?: string }

export const badRequest = (body: ErrorBody) => NextResponse.json(body, { status: 400 })
export const notFound = (what = "Elemento") => NextResponse.json({ error: `${what} non trovato.` }, { status: 404 })

/** Body JSON validato con zod; in caso di errore restituisce già la risposta 400 con il campo. */
export async function parseBody<T extends z.ZodType>(request: Request, schema: T): Promise<{ data: z.output<T> } | { response: NextResponse }> {
    const body = await request.json().catch(() => null)
    const result = schema.safeParse(body)
    return result.success ? { data: result.data } : { response: badRequest(inputError(result.error)) }
}

/** Errori Postgres prevedibili tradotti in messaggi da form; gli altri risalgono come 500. */
export function dbError(error: unknown): NextResponse {
    const pg = (error as { cause?: { code?: string; message?: string } }).cause ?? (error as { code?: string; message?: string })
    if (pg?.message === "financing_purchase_date") {
        return badRequest({ error: "Un veicolo finanziato richiede una data di acquisto non successiva alla prima rata.", field: "purchase_date" })
    }
    if (pg?.code === "23503") return badRequest({ error: "Scegli un veicolo valido.", field: "vehicle_id" })
    if (pg?.code === "23514") return badRequest({ error: "Controlla i dati inseriti: alcuni valori non sono ammessi." })
    console.error(error)
    return NextResponse.json({ error: "Errore del database." }, { status: 500 })
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export const isUuid = (value: string | null | undefined): value is string => !!value && UUID.test(value)
