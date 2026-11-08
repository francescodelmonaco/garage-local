// Cookie di sessione `scadenza.firma`, HMAC-SHA256 con SESSION_SECRET.
// Solo Web Crypto: funziona sia in proxy.ts sia nei Route Handler.
export const SESSION_COOKIE = "session"

const encoder = new TextEncoder()
const toHex = (buffer: ArrayBuffer) => Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0")).join("")
const fromHex = (hex: string) => new Uint8Array(hex.match(/../g)?.map((byte) => parseInt(byte, 16)) ?? [])

function hmacKey(secret: string) {
    if (!secret) throw new Error("SESSION_SECRET mancante nel file .env")
    return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"])
}

export async function createSession(secret: string, maxAgeSeconds: number, now = Date.now()) {
    const expires = String(now + maxAgeSeconds * 1000)
    const signature = await crypto.subtle.sign("HMAC", await hmacKey(secret), encoder.encode(expires))
    return `${expires}.${toHex(signature)}`
}

export async function verifySession(token: string | undefined, secret: string, now = Date.now()) {
    const [expires, signature] = token?.split(".") ?? []
    if (!expires || !signature || !/^[0-9a-f]{64}$/.test(signature) || Number(expires) < now) return false
    // verify confronta la firma in tempo costante
    return crypto.subtle.verify("HMAC", await hmacKey(secret), fromHex(signature), encoder.encode(expires))
}

export const sessionMaxAge = () => Number(process.env.SESSION_DAYS || 30) * 24 * 60 * 60
