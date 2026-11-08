import { NextResponse, type NextRequest } from "next/server"
import { SESSION_COOKIE, verifySession } from "@/lib/session"

export async function proxy(request: NextRequest) {
    const valid = await verifySession(request.cookies.get(SESSION_COOKIE)?.value, process.env.SESSION_SECRET ?? "")
    if (valid) return NextResponse.next()
    if (request.nextUrl.pathname.startsWith("/api/")) return NextResponse.json({ error: "Accesso richiesto." }, { status: 401 })
    return NextResponse.redirect(new URL("/login", request.url))
}

// Tutto protetto tranne login e asset statici
export const config = {
    matcher: ["/((?!login|api/login|_next/static|_next/image|favicon.ico|brands-models.json).*)"],
}
