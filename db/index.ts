import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

// Un solo pool anche con l'hot reload di next dev
const globalForDb = globalThis as unknown as { sql?: postgres.Sql }
const client = globalForDb.sql ?? postgres(process.env.DATABASE_URL!, { max: 5, onnotice: () => {} })
if (process.env.NODE_ENV !== "production") globalForDb.sql = client

export const db = drizzle(client, { schema })
export type Db = typeof db
