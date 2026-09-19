import { beforeAll, describe, expect, it } from "vitest";
import { napraviToken, provjeriToken } from "./token";

beforeAll(() => {
  process.env.ADMIN_SESSION_SECRET = "test-secret-koji-je-dovoljno-dug-1234567890";
});

describe("admin token", () => {
  it("valjan token prolazi", async () => {
    const t = await napraviToken();
    expect(await provjeriToken(t)).toBe(true);
  });
  it("izmijenjen potpis pada", async () => {
    const t = await napraviToken();
    const [exp, sig] = t.split(".");
    expect(await provjeriToken(`${exp}.${sig.slice(0, -2)}aa`)).toBe(false);
  });
  it("istekao token pada", async () => {
    const t = await napraviToken(-1000);
    expect(await provjeriToken(t)).toBe(false);
  });
  it("undefined/prazno pada", async () => {
    expect(await provjeriToken(undefined)).toBe(false);
    expect(await provjeriToken("")).toBe(false);
  });
});
