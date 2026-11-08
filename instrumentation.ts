// Applica le migrazioni all'avvio del server (dev e Docker): nessun passo manuale.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return
  const { migrate } = await import("drizzle-orm/postgres-js/migrator")
  const { db } = await import("./db")
  await migrate(db, { migrationsFolder: "drizzle" })
}
