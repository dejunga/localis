import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { attachDatabasePool } from "@vercel/functions";
import * as schema from "./schema";

// Jedan pool po procesu - Next u devu hot-reloada module, pa ga čuvamo na globalThis.
// Kreira se lijeno: import modula ne smije puknuti ako DATABASE_URL nije postavljen
// (npr. tijekom `next build` prerendera stranica koje importaju server akcije).
const globalForDb = globalThis as unknown as { __localisPool?: Pool; __localisDb?: NodePgDatabase<typeof schema> };

function getPool(): Pool {
  if (globalForDb.__localisPool) return globalForDb.__localisPool;
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL nije postavljen.");
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });
  // Vercel Fluid compute: zatvori konekcije kad se instanca gasi.
  attachDatabasePool(pool);
  globalForDb.__localisPool = pool;
  return pool;
}

function getDb(): NodePgDatabase<typeof schema> {
  if (!globalForDb.__localisDb) {
    globalForDb.__localisDb = drizzle({ client: getPool(), schema });
  }
  return globalForDb.__localisDb;
}

// Proxy: `db.select()...` radi kao prije, ali pool nastaje tek pri prvom pozivu.
export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_target, prop, receiver) {
    const real = getDb();
    const value = Reflect.get(real, prop, receiver);
    return typeof value === "function" ? value.bind(real) : value;
  },
});
export type Db = NodePgDatabase<typeof schema>;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
