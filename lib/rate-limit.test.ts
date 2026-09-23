import { describe, expect, it } from "vitest";
import { hashKljuca, ipIzZaglavlja } from "./rate-limit";

const zaglavlja = (h: Record<string, string>) => new Headers(h);

describe("ipIzZaglavlja", () => {
  it("uzima prvu adresu iz x-forwarded-for", () => {
    expect(ipIzZaglavlja(zaglavlja({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" }))).toBe("1.2.3.4");
  });

  it("pada na x-real-ip kad nema x-forwarded-for", () => {
    expect(ipIzZaglavlja(zaglavlja({ "x-real-ip": "5.6.7.8" }))).toBe("5.6.7.8");
  });

  it("vraća 'nepoznato' bez zaglavlja", () => {
    expect(ipIzZaglavlja(zaglavlja({}))).toBe("nepoznato");
  });
});

describe("hashKljuca", () => {
  it("ne otkriva izvornu vrijednost i ne ovisi o velikim slovima", () => {
    const h = hashKljuca("Marko@Email.com");
    expect(h).toHaveLength(32);
    expect(h).not.toContain("marko");
    expect(h).toBe(hashKljuca("marko@email.com"));
  });
});
