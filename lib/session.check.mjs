// Verifica rapida della sessione: `node lib/session.check.mjs`
import assert from "node:assert/strict"
import { createSession, verifySession } from "./session.ts"

const now = Date.now()
const token = await createSession("segreto", 60, now)
assert.equal(await verifySession(token, "segreto", now), true)
assert.equal(await verifySession(token, "altro-segreto", now), false)
assert.equal(await verifySession(token, "segreto", now + 61_000), false, "scaduto")
const [expires, signature] = token.split(".")
assert.equal(await verifySession(`${Number(expires) + 1}.${signature}`, "segreto", now), false, "scadenza alterata")
assert.equal(await verifySession(`${expires}.${"0".repeat(64)}`, "segreto", now), false, "firma alterata")
for (const bad of [undefined, "", "abc", `${expires}.`, `.${signature}`]) assert.equal(await verifySession(bad, "segreto", now), false)
console.log("Sessione: OK (firma, scadenza, manomissioni)")
