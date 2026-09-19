import { afterAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { brojacPonuda } from "@/lib/db/schema";
import { sljedeciRedniBroj } from "./izdaj";

const GODINA = 2099; // testna godina - ne dira prave brojeve

describe.skipIf(!process.env.DATABASE_URL)("sljedeciRedniBroj", () => {
  afterAll(async () => {
    await db.delete(brojacPonuda).where(eq(brojacPonuda.godina, GODINA));
  });

  it("10 paralelnih poziva daje 10 različitih brojeva 1..10", async () => {
    await db.delete(brojacPonuda).where(eq(brojacPonuda.godina, GODINA));
    const brojevi = await Promise.all(
      Array.from({ length: 10 }, () => db.transaction((tx) => sljedeciRedniBroj(tx, GODINA))),
    );
    expect([...brojevi].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  }, 30_000);
});
