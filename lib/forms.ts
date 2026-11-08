import { BALLOON_OUTCOMES, FUEL_TYPES, VEHICLE_TYPES } from "./enums"
import type { FieldDef } from "./register-meta"

export const vehicleFields: FieldDef[] = [
    { name: "brand", label: "Marca", type: "text", required: true, suggest: "brand" },
    { name: "model", label: "Modello", type: "text", required: true, suggest: "model" },
    { name: "plate", label: "Targa", type: "text", hint: "Facoltativa: maiuscole e senza spazi." },
    { name: "vehicle_type", label: "Tipo veicolo", type: "select", required: true, options: VEHICLE_TYPES },
    { name: "fuel_type", label: "Carburante", type: "select", options: FUEL_TYPES },
    { name: "year", label: "Anno prima immatricolazione", type: "number", integer: true },
    { name: "purchase_date", label: "Data di acquisto", type: "date", hint: "Serve per le medie di spesa in dashboard." },
    { name: "purchase_price", label: "Prezzo di acquisto (€)", type: "number", hint: "Se il veicolo è finanziato: prezzo in contanti, usato solo per il costo del finanziamento." },
    { name: "initial_km", label: "Km all'acquisto", type: "number", integer: true },
    { name: "notes", label: "Note", type: "textarea" },
]

export const purchaseDateField: FieldDef = { name: "purchase_date", label: "Data di acquisto del veicolo", type: "date", required: true, hint: "Manca sul veicolo: verrà salvata insieme al finanziamento." }

export const financingFields: FieldDef[] = [
    { name: "down_payment", label: "Anticipo (€)", type: "number", section: "Piano" },
    { name: "upfront_fees", label: "Spese alla firma (€)", type: "number" },
    { name: "installment_amount", label: "Rata mensile (€)", type: "number", required: true },
    { name: "installment_count", label: "Numero rate", type: "number", required: true, integer: true },
    { name: "first_installment_date", label: "Prima rata", type: "date", required: true },
    { name: "balloon_payment", label: "Maxi-rata (€)", type: "number" },
    { name: "balloon_outcome", label: "Esito maxi-rata", type: "select", options: BALLOON_OUTCOMES },
    { name: "lender", label: "Finanziaria", type: "text", section: "Contratto" },
    { name: "dealer", label: "Concessionaria", type: "text" },
    { name: "contract_number", label: "Numero contratto", type: "text" },
    { name: "financed_amount", label: "Capitale finanziato (€)", type: "number" },
    { name: "tan", label: "TAN (%)", type: "number" },
    { name: "taeg", label: "TAEG (%)", type: "number" },
    { name: "guaranteed_future_value", label: "Valore futuro garantito (€)", type: "number" },
    { name: "collection_fee", label: "Spese incasso (€)", type: "number", hint: "Già incluse nella rata." },
    { name: "credit_insurance", label: "Polizza credito", type: "text" },
    { name: "notes", label: "Note", type: "textarea" },
    { name: "payoff_date", label: "Data estinzione", type: "date", section: "Estinzione anticipata" },
    { name: "payoff_amount", label: "Importo estinzione (€)", type: "number" },
]
