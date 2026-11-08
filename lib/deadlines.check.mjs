// Verifica rapida della logica scadenze: `node lib/deadlines.check.mjs`
import assert from "node:assert/strict"
import { daysUntil, deadlineStatus, describeDeadline, taxDueDate } from "./deadlines.ts"

const today = new Date(2026, 9, 12, 15, 30) // 12 ottobre, pomeriggio

// Una polizza che scade oggi non è ancora scaduta, a qualunque ora
assert.equal(daysUntil("2026-10-12", today), 0)
assert.equal(deadlineStatus(0), "soon")
assert.equal(describeDeadline(0), "Scade oggi")

assert.equal(daysUntil("2026-10-11", today), -1)
assert.equal(deadlineStatus(-1), "expired")
assert.equal(describeDeadline(-1), "Scaduta")
assert.equal(describeDeadline(-365), "Scaduta")

assert.equal(deadlineStatus(30), "soon")
assert.equal(deadlineStatus(31), "ok")
assert.equal(describeDeadline(12), "Tra 12 giorni")

// Un anno di calendario, anche quando comprende il 29 febbraio: non 365 giorni fissi.
assert.equal(taxDueDate("2026-10-12"), "2027-10-12")
assert.equal(taxDueDate("2023-03-01"), "2024-03-01")
assert.equal(taxDueDate("2024-02-29"), "2025-02-28")
assert.equal(taxDueDate(null), null)
assert.equal(deadlineStatus(daysUntil(taxDueDate("2025-10-12"), today)), "soon")
assert.equal(deadlineStatus(daysUntil(taxDueDate("2025-10-11"), today)), "expired")
assert.equal(deadlineStatus(daysUntil(taxDueDate("2025-11-11"), today)), "soon")
assert.equal(deadlineStatus(daysUntil(taxDueDate("2025-11-12"), today)), "ok")

console.log("deadlines ok")
