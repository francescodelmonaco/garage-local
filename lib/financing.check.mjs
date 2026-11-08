// Verifica rapida della logica del finanziamento: `node lib/financing.check.mjs`
import assert from "node:assert/strict"
import { installmentDate, summarizeFinancing } from "./financing.ts"

const today = new Date(2026, 10, 1, 15, 30) // 1° novembre 2026, pomeriggio
const plan = {
    down_payment: 3000, upfront_fees: 500, installment_amount: 300, installment_count: 24,
    first_installment_date: "2026-01-31", balloon_payment: 8000, balloon_outcome: null,
    payoff_date: null, payoff_amount: null,
}

// Sempre dalla prima rata: fine mese senza slittamenti, come make_interval in SQL
assert.deepEqual([0, 1, 2, 3].map((i) => installmentDate("2026-01-31", i)), ["2026-01-31", "2026-02-28", "2026-03-31", "2026-04-30"])
assert.equal(installmentDate("2024-01-31", 1), "2024-02-29")

// Firma + 10 rate (31/01 … 31/10); la maxi-rata è prevista ma non ancora dovuta
let s = summarizeFinancing(plan, "2026-01-15", 30000, today)
assert.equal(s.paid, 3500 + 10 * 300)
assert.equal(s.total, 3500 + 24 * 300 + 8000)
assert.equal(s.remaining, 14 * 300 + 8000)
assert.equal(s.financingCost, 3500 + 24 * 300 + 8000 - 30000)
assert.equal(s.balloonDate, "2028-01-31")
assert.equal(s.endDate, "2028-01-31")
assert.equal(s.needsBalloonOutcome, false)

// La rata di oggi è pagata
s = summarizeFinancing({ ...plan, first_installment_date: "2026-01-01" }, "2026-01-01", null, today)
assert.equal(s.paid, 3500 + 11 * 300)
assert.equal(s.financingCost, null)

// Maxi-rata scaduta: senza esito non conta e chiede l'esito; con riscatto conta; con restituzione sparisce
const past = { ...plan, first_installment_date: "2024-01-31", installment_count: 24 }
s = summarizeFinancing(past, "2024-01-15", 30000, today)
assert.equal(s.balloonDate, "2026-01-31")
assert.equal(s.paid, 3500 + 24 * 300)
assert.equal(s.needsBalloonOutcome, true)
assert.equal(s.remaining, 8000)
s = summarizeFinancing({ ...past, balloon_outcome: "Riscatto" }, "2024-01-15", 30000, today)
assert.equal(s.paid, 3500 + 24 * 300 + 8000)
assert.equal(s.remaining, 0)
assert.equal(s.needsBalloonOutcome, false)
s = summarizeFinancing({ ...past, balloon_outcome: "Restituzione" }, "2024-01-15", 30000, today)
assert.equal(s.total, 3500 + 24 * 300)
assert.equal(s.remaining, 0)
assert.equal(s.financingCost, null)

// Senza maxi-rata il piano finisce con l'ultima rata
s = summarizeFinancing({ ...plan, balloon_payment: null }, "2026-01-15", 10000, today)
assert.equal(s.endDate, "2027-12-31")
assert.equal(s.balloonDate, null)

// Estinzione: rate fino alla data, poi il saldo; maxi-rata ed esito ignorati
s = summarizeFinancing({ ...plan, down_payment: 0, upfront_fees: 0, installment_amount: 400, installment_count: 36, first_installment_date: "2026-01-10", balloon_payment: 9000, balloon_outcome: "Riscatto", payoff_date: "2026-05-15", payoff_amount: 5000 }, "2026-01-01", 20000, today)
assert.equal(s.paid, 5 * 400 + 5000)
assert.equal(s.total, s.paid)
assert.equal(s.remaining, 0)
assert.equal(s.endDate, "2026-05-15")
assert.equal(s.balloonDate, null)

// Estinzione futura: il saldo è nel residuo, non nel pagato
s = summarizeFinancing({ ...plan, payoff_date: "2026-12-15", payoff_amount: 5000 }, "2026-01-15", 30000, today)
assert.equal(s.paid, 3500 + 10 * 300)
assert.equal(s.total, 3500 + 11 * 300 + 5000)

console.log("Finanziamento: OK (date delle rate, pagato, residuo, maxi-rata, estinzione)")
