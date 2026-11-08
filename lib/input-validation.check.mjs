// Verifica rapida delle validazioni: `node lib/input-validation.check.mjs`
import assert from "node:assert/strict"

const schemas = await import("./input-validation.ts")
const { INSURANCE_COMPANIES, MAINTENANCE_TYPES } = await import("./enums.ts")
const Constants = { public: { Enums: { insurance_company_enum: INSURANCE_COMPANIES, maintenance_type_enum: MAINTENANCE_TYPES } } }
const id = "123e4567-e89b-42d3-a456-426614174000"
const vehicle = { brand: " Fiat ", model: " Panda ", vehicle_type: "Auto", plate: " ab 123 cd " }
const parsed = schemas.vehicleInputSchema.parse(vehicle)
assert.equal(parsed.brand, "Fiat")
assert.equal(parsed.plate, "AB123CD")
assert.equal(parsed.purchase_price, null)
assert.equal(schemas.vehicleInputSchema.parse({ ...vehicle, plate: "", initial_km: "0" }).initial_km, 0)
for (const input of [{}, { ...vehicle, brand: " \t " }, { ...vehicle, model: "" }, { ...vehicle, vehicle_type: "auto" }, { ...vehicle, year: "2026.5" }, { ...vehicle, purchase_price: "NaN" }, { ...vehicle, initial_km: "-1" }]) {
    assert.equal(schemas.vehicleInputSchema.safeParse(input).success, false)
}

const cases = [
    [schemas.refuelingInputSchema, { vehicle_id: id, date: "2026-10-12", cost: 60, liters: 30 }, ["vehicle_id", "date", "cost", "liters"]],
    [schemas.insuranceInputSchema, { vehicle_id: id, company: Constants.public.Enums.insurance_company_enum[0], start_date: "2026-10-12", end_date: "2027-10-12", cost: 0 }, ["vehicle_id", "company", "start_date", "end_date", "cost"]],
    [schemas.maintenanceInputSchema, { vehicle_id: id, title: "Tagliando", type: Constants.public.Enums.maintenance_type_enum[0], date: "2026-10-12", cost: 0, km_at_maintenance: 0 }, ["vehicle_id", "title", "type", "date"]],
    [schemas.revisionInputSchema, { vehicle_id: id, date: "2026-10-12", next_revision_date: "2028-10-12" }, ["vehicle_id", "date", "next_revision_date"]],
    [schemas.taxInputSchema, { vehicle_id: id, year: 2026, amount: 0 }, ["vehicle_id", "year", "amount"]],
]
for (const [schema, valid, required] of cases) {
    assert.equal(schema.safeParse(valid).success, true)
    assert.equal(schema.safeParse(null).success, false)
    for (const field of required) {
        const missing = { ...valid }
        delete missing[field]
        assert.equal(schema.safeParse(missing).success, false, `Campo obbligatorio: ${field}`)
        assert.equal(schema.safeParse({ ...valid, [field]: "   " }).success, false)
    }
    for (const value of [-1, NaN, Infinity, "20 euro"]) {
        const field = "amount" in valid ? "amount" : "cost"
        assert.equal(schema.safeParse({ ...valid, [field]: value }).success, false)
    }
}
assert.equal(schemas.refuelingInputSchema.safeParse({ ...cases[0][1], cost: 0 }).success, false)
assert.equal(schemas.refuelingInputSchema.safeParse({ ...cases[0][1], date: "2026-02-30" }).success, false)
assert.equal(schemas.insuranceInputSchema.safeParse({ ...cases[1][1], end_date: "2025-10-12" }).success, false)
assert.equal(schemas.revisionInputSchema.safeParse({ ...cases[3][1], next_revision_date: "2026-10-12" }).success, false)
assert.equal(schemas.maintenanceInputSchema.safeParse({ ...cases[2][1], km_at_maintenance: 1.5 }).success, false)
// Finanziamento: FormData di sole stringhe, vuoti a null (anticipo e spese a zero)
const financing = { installment_amount: "300", installment_count: "24", first_installment_date: "2026-01-31", down_payment: "", tan: "", balloon_outcome: "" }
const parsedFinancing = schemas.financingInputSchema.parse(financing)
assert.equal(parsedFinancing.installment_amount, 300)
assert.equal(parsedFinancing.down_payment, 0)
assert.equal(parsedFinancing.tan, null)
assert.equal(parsedFinancing.balloon_outcome, null)
for (const [input, field] of [
    [{ ...financing, installment_amount: "" }, "installment_amount"],
    [{ ...financing, installment_count: "0" }, "installment_count"],
    [{ ...financing, installment_count: "2.5" }, "installment_count"],
    [{ ...financing, first_installment_date: "" }, "first_installment_date"],
    [{ ...financing, tan: "101" }, "tan"],
    [{ ...financing, balloon_outcome: "Riscatto" }, "balloon_payment"],
    [{ ...financing, balloon_payment: "8000", balloon_outcome: "riscatto" }, "balloon_outcome"],
    [{ ...financing, payoff_date: "2026-05-15" }, "payoff_amount"],
    [{ ...financing, payoff_amount: "5000" }, "payoff_date"],
    [{ ...financing, payoff_date: "2026-01-30", payoff_amount: "1" }, "payoff_date"],
    [{ ...financing, payoff_date: "2028-02-01", payoff_amount: "1" }, "payoff_date"],
]) {
    const result = schemas.financingInputSchema.safeParse(input)
    assert.equal(result.success, false, `Finanziamento non valido: ${field}`)
    assert.equal(schemas.inputError(result.error).field, field)
}
assert.equal(schemas.financingInputSchema.safeParse({ ...financing, balloon_payment: "8000", balloon_outcome: "Riscatto", payoff_date: "2028-01-31", payoff_amount: "1" }).success, true)
console.log("Validazioni server: OK (campi vuoti, tipi, date, numeri, enum e normalizzazione)")

// Form: tutto stringa; prezzo al litro calcolato dal server
const fromForm = schemas.refuelingInputSchema.parse({ vehicle_id: id, date: "2026-10-12", cost: "60", liters: "40", fuel_type: "", station: "" })
assert.equal(fromForm.price_per_liter, 1.5)
assert.equal(fromForm.fuel_type, null)
assert.equal(schemas.maintenanceInputSchema.parse({ ...cases[2][1], cost: "" }).cost, null)
console.log("Validazioni form: OK")
