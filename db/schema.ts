import { sql } from "drizzle-orm"
import { check, date, index, integer, numeric, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { BALLOON_OUTCOMES, FUEL_TYPES, INSURANCE_COMPANIES, INSURANCE_COVERAGES, MAINTENANCE_TYPES, VEHICLE_TYPES } from "../lib/enums"

export const vehicleTypeEnum = pgEnum("vehicle_type_enum", VEHICLE_TYPES)
export const fuelTypeEnum = pgEnum("fuel_type_enum", FUEL_TYPES)
export const maintenanceTypeEnum = pgEnum("maintenance_type_enum", MAINTENANCE_TYPES)
export const insuranceCoverageEnum = pgEnum("insurance_coverage_enum", INSURANCE_COVERAGES)
export const insuranceCompanyEnum = pgEnum("insurance_company_enum", INSURANCE_COMPANIES)
export const balloonOutcomeEnum = pgEnum("financing_balloon_outcome_enum", BALLOON_OUTCOMES)

const money = (name: string) => numeric(name, { mode: "number" })
const timestamps = {
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}
const vehicleRef = () => uuid("vehicle_id").notNull().references(() => vehicles.id, { onDelete: "cascade" })

export const vehicles = pgTable("vehicles", {
  id: uuid("id").primaryKey().defaultRandom(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  plate: text("plate").notNull().default(""),
  vehicle_type: vehicleTypeEnum("vehicle_type").notNull(),
  fuel_type: fuelTypeEnum("fuel_type"),
  year: integer("year"),
  initial_km: money("initial_km"),
  purchase_date: date("purchase_date"),
  purchase_price: money("purchase_price"),
  notes: text("notes"),
  ...timestamps,
}, (t) => [
  check("vehicles_required_details", sql`${t.brand} ~ '[^[:space:]]' and ${t.model} ~ '[^[:space:]]'`),
  check("vehicles_valid_numbers", sql`(${t.year} is null or ${t.year} between 1886 and 9999)
    and (${t.initial_km} is null or ${t.initial_km} >= 0)
    and (${t.purchase_price} is null or ${t.purchase_price} >= 0)`),
])

export const refuelings = pgTable("refuelings", {
  id: uuid("id").primaryKey().defaultRandom(),
  vehicle_id: vehicleRef(),
  date: date("date").notNull(),
  cost: money("cost").notNull(),
  liters: money("liters").notNull(),
  price_per_liter: money("price_per_liter"),
  fuel_type: fuelTypeEnum("fuel_type"),
  station: text("station"),
  notes: text("notes"),
  ...timestamps,
}, (t) => [
  index("refuelings_vehicle_id_idx").on(t.vehicle_id),
  check("refuelings_valid_details", sql`${t.cost} > 0 and ${t.liters} > 0 and (${t.price_per_liter} is null or ${t.price_per_liter} > 0)`),
])

export const maintenances = pgTable("maintenances", {
  id: uuid("id").primaryKey().defaultRandom(),
  vehicle_id: vehicleRef(),
  title: text("title").notNull(),
  type: maintenanceTypeEnum("type").notNull(),
  date: date("date").notNull(),
  km_at_maintenance: money("km_at_maintenance"),
  cost: money("cost"),
  workshop: text("workshop"),
  description: text("description"),
  ...timestamps,
}, (t) => [
  index("maintenances_vehicle_id_idx").on(t.vehicle_id),
  check("maintenances_valid_details", sql`${t.title} ~ '[^[:space:]]'
    and (${t.cost} is null or ${t.cost} >= 0) and (${t.km_at_maintenance} is null or ${t.km_at_maintenance} >= 0)`),
])

export const insurances = pgTable("insurances", {
  id: uuid("id").primaryKey().defaultRandom(),
  vehicle_id: vehicleRef(),
  company: insuranceCompanyEnum("company").notNull(),
  policy_number: text("policy_number"),
  coverage_type: insuranceCoverageEnum("coverage_type"),
  start_date: date("start_date").notNull(),
  end_date: date("end_date").notNull(),
  cost: money("cost").notNull(),
  notes: text("notes"),
  ...timestamps,
}, (t) => [
  index("insurances_vehicle_id_idx").on(t.vehicle_id),
  index("insurances_vehicle_end_date_idx").on(t.vehicle_id, t.end_date.desc()),
  check("insurances_valid_details", sql`${t.end_date} >= ${t.start_date} and ${t.cost} >= 0`),
])

export const taxes = pgTable("taxes", {
  id: uuid("id").primaryKey().defaultRandom(),
  vehicle_id: vehicleRef(),
  year: integer("year").notNull(),
  amount: money("amount").notNull(),
  paid_date: date("paid_date"),
  notes: text("notes"),
  ...timestamps,
}, (t) => [
  index("taxes_vehicle_id_idx").on(t.vehicle_id),
  index("taxes_vehicle_latest_idx").on(t.vehicle_id, t.year.desc(), t.paid_date.desc().nullsLast(), t.id.desc()),
  check("taxes_valid_details", sql`${t.year} between 1886 and 9999 and ${t.amount} >= 0`),
])

export const revisions = pgTable("revisions", {
  id: uuid("id").primaryKey().defaultRandom(),
  vehicle_id: vehicleRef(),
  date: date("date").notNull(),
  next_revision_date: date("next_revision_date").notNull(),
  km: money("km"),
  cost: money("cost"),
  workshop: text("workshop"),
  notes: text("notes"),
  ...timestamps,
}, (t) => [
  index("revisions_vehicle_id_idx").on(t.vehicle_id),
  index("revisions_vehicle_next_revision_date_idx").on(t.vehicle_id, t.next_revision_date.desc()),
  check("revisions_valid_details", sql`${t.next_revision_date} > ${t.date}
    and (${t.cost} is null or ${t.cost} >= 0) and (${t.km} is null or ${t.km} >= 0)`),
])

export const vehicleFinancings = pgTable("vehicle_financings", {
  vehicle_id: uuid("vehicle_id").primaryKey().references(() => vehicles.id, { onDelete: "cascade" }),
  // piano: entrano nei calcoli
  down_payment: money("down_payment").notNull().default(0),
  upfront_fees: money("upfront_fees").notNull().default(0),
  installment_amount: money("installment_amount").notNull(),
  installment_count: integer("installment_count").notNull(),
  first_installment_date: date("first_installment_date").notNull(),
  balloon_payment: money("balloon_payment"),
  balloon_outcome: balloonOutcomeEnum("balloon_outcome"),
  payoff_date: date("payoff_date"),
  payoff_amount: money("payoff_amount"),
  // contratto: solo archivio
  lender: text("lender"),
  dealer: text("dealer"),
  contract_number: text("contract_number"),
  financed_amount: money("financed_amount"),
  tan: money("tan"),
  taeg: money("taeg"),
  guaranteed_future_value: money("guaranteed_future_value"),
  collection_fee: money("collection_fee"),
  credit_insurance: text("credit_insurance"),
  notes: text("notes"),
  ...timestamps,
}, (t) => [
  check("vehicle_financings_amounts", sql`${t.down_payment} >= 0 and ${t.upfront_fees} >= 0 and ${t.installment_amount} >= 0
    and ${t.installment_count} between 1 and 600
    and (${t.balloon_payment} is null or ${t.balloon_payment} >= 0)
    and (${t.payoff_amount} is null or ${t.payoff_amount} >= 0)
    and (${t.financed_amount} is null or ${t.financed_amount} >= 0)
    and (${t.guaranteed_future_value} is null or ${t.guaranteed_future_value} >= 0)
    and (${t.collection_fee} is null or ${t.collection_fee} >= 0)
    and (${t.tan} is null or ${t.tan} between 0 and 100)
    and (${t.taeg} is null or ${t.taeg} between 0 and 100)`),
  check("vehicle_financings_balloon", sql`${t.balloon_outcome} is null or ${t.balloon_payment} is not null`),
  check("vehicle_financings_payoff", sql`(${t.payoff_date} is null) = (${t.payoff_amount} is null)
    and (${t.payoff_date} is null or (${t.payoff_date} >= ${t.first_installment_date}
      and ${t.payoff_date} <= ${t.first_installment_date} + make_interval(months => ${t.installment_count})))`),
])

export type Vehicle = typeof vehicles.$inferSelect
export type Refueling = typeof refuelings.$inferSelect
export type Maintenance = typeof maintenances.$inferSelect
export type Insurance = typeof insurances.$inferSelect
export type Tax = typeof taxes.$inferSelect
export type Revision = typeof revisions.$inferSelect
export type VehicleFinancing = typeof vehicleFinancings.$inferSelect
