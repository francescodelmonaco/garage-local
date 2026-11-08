// Valori ammessi dagli enum Postgres (db/schema.ts li usa). Modulo puro: importabile anche dal client.

export const VEHICLE_TYPES = ["Auto", "Moto", "Scooter", "Furgone", "Camper", "Autocarro", "Quad", "Altro"] as const

export const FUEL_TYPES = [
  "Benzina", "Diesel", "GPL", "Metano", "Benzina + GPL", "Benzina + Metano",
  "Elettrico", "Ibrido", "Ibrido Plug-in", "Idrogeno", "Altro",
] as const

export const MAINTENANCE_TYPES = [
  "Tagliando", "Cambio olio", "Filtri", "Freni", "Pneumatici", "Batteria", "Cinghia distribuzione",
  "Candele", "Liquidi", "Climatizzatore", "Sospensioni", "Scarico", "Elettronica", "Carrozzeria", "Altro",
] as const

export const INSURANCE_COVERAGES = [
  "RCA", "RCA + Furto e Incendio", "RCA + Kasko", "Kasko completa", "Mini Kasko", "Altro",
] as const

export const INSURANCE_COMPANIES = [
  "Linear", "Quixa", "Verti", "Prima", "Allianz Direct", "Genertel", "ConTe.it", "Admiral", "Genialloyd",
  "Direct Line", "Generali", "Allianz", "UnipolSai", "Unipol", "Reale Mutua", "Zurich", "AXA", "Poste Italiane",
  "Sara Assicurazioni", "Cattolica Assicurazioni", "Vittoria Assicurazioni", "HDI Assicurazioni", "Groupama",
  "Itas Mutua", "Helvetia", "Aviva", "Italiana Assicurazioni", "Arca Assicurazioni", "Alleanza Assicurazioni",
  "Yolo", "BeRebel", "Ego Insurance", "Net Insurance", "Nobis Assicurazioni", "Tua Assicurazioni",
  "Wopta Assicurazioni", "B2C Innovation", "Connexa InsTech", "FIT", "Bene Assicurazioni", "Intesa Sanpaolo",
  "BNL Gruppo BNP Paribas", "Amex Agenzia Assicurativa", "Altro",
] as const

export const BALLOON_OUTCOMES = ["Riscatto", "Restituzione"] as const
