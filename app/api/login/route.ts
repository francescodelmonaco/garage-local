import { createHash, timingSafeEqual } from "node:crypto"
import { NextResponse, type NextRequest } from "next/server"
import { SESSION_COOKIE, createSession, sessionMaxAge } from "@/lib/session"

const sha256 = (value: string) => createHash("sha256").update(value).digest()

export async function POST(request: NextRequest) {
    const expected = process.env.APP_PASSPHRASE
    if (!expected) return NextResponse.json({ error: "APP_PASSPHRASE non configurata nel file .env." }, { status: 500 })

    const { passphrase } = await request.json().catch(() => ({}))
    // Hash prima del confronto: stessa lunghezza, confronto in tempo costante
    if (typeof passphrase !== "string" || !timingSafeEqual(sha256(passphrase), sha256(expected))) {
        // ponytail: nessun rate limit, l'app è pensata per localhost/LAN; aggiungerlo se esposta su internet
        await new Promise((resolve) => setTimeout(resolve, 500))
        return NextResponse.json({ error: "Passphrase errata." }, { status: 401 })
    }

    const maxAge = sessionMaxAge()
    const response = NextResponse.json({ ok: true })
    response.cookies.set(SESSION_COOKIE, await createSession(process.env.SESSION_SECRET ?? "", maxAge), {
        httpOnly: true,
        sameSite: "lax",
        secure: request.nextUrl.protocol === "https:" || request.headers.get("x-forwarded-proto") === "https",
        path: "/",
        maxAge,
    })
    return response
}

export async function DELETE() {
    const response = NextResponse.json({ ok: true })
    response.cookies.delete(SESSION_COOKIE)
    return response
}
