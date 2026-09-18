import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { attachDatabasePool } from "@vercel/functions";
import * as schema from "./schema";

// Jedan pool po procesu - Next u devu hot-reloada module, pa ga čuvamo na globalThis.
const globalForDb = globalThis as unknown as { __localisPool?: Pool };

function createPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL nije postavljen.");
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
  // Vercel Fluid compute: zatvori konekcije kad se instanca gasi.
  attachDatabasePool(pool);
  return pool;
}

const pool = globalForDb.__localisPool ?? createPool();
globalForDb.__localisPool = pool;

export const db = drizzle({ client: pool, schema });
export type Db = typeof db;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
