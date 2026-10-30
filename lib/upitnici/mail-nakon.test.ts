import { describe, expect, it } from "vitest";
import type { Seminar } from "@/lib/edukacije";
import { SVA_POLJA, type Tekstovi } from "@/lib/tekstovi";
import { gradEdukacije, nadolazeceEdukacije, renderMailNakon, spojiImena } from "./mail-nakon";

const tekstovi = Object.fromEntries(SVA_POLJA.map((p) => [p.kljuc, p.zadano])) as Tekstovi;

const seminar = (o: Partial<Seminar> = {}) =>
  ({
    slug: "izvlastenje",
    title: "Izvlaštenje u JLS",
    dateLabel: "28. listopada 2026.",
    date: "2026-10-28",
    time: "9.30 - 15.30",
    location: "Hotel Antunović, Zagreb",
    lecturers: [{ name: "Tihomir Kvakarić", bio: "" }],
    ...o,
  }) as Seminar;

const rok = new Date("2026-11-06T07:00:00Z");

describe("spojiImena", () => {
  it("jedno, dva i tri imena", () => {
    expect(spojiImena(["A"])).toBe("A");
    expect(spojiImena(["A", "B"])).toBe("A i B");
    expect(spojiImena(["A", "B", "C"])).toBe("A, B i C");
  });
});

describe("gradEdukacije", () => {
  it("zadnji dio lokacije", () => {
    expect(gradEdukacije("Hotel Bonavia, Rijeka")).toBe("Rijeka");
    expect(gradEdukacije("Online")).toBe("Online");
  });
});

describe("nadolazeceEdukacije", () => {
  const now = new Date("2026-10-31T08:00:00Z");
  it("samo buduće, bez odgođenih i skrivenih, uzlazno, s limitom", () => {
    const lista = [
      seminar({ slug: "prosla", date: "2026-10-28" }),
      seminar({ slug: "c", date: "2026-11-30" }),
      seminar({ slug: "a", date: "2026-11-09" }),
      seminar({ slug: "odgodena", date: "2026-11-10", odgodeno: true }),
      seminar({ slug: "skrivena", date: "2026-11-11", skriveno: true }),
      seminar({ slug: "b", date: "2026-11-19" }),
    ];
    expect(nadolazeceEdukacije(lista, now).map((s) => s.slug)).toEqual(["a", "b", "c"]);
    expect(nadolazeceEdukacije(lista, now, 2).map((s) => s.slug)).toEqual(["a", "b"]);
  });
});

describe("renderMailNakon", () => {
  const nadolazeca = seminar({
    slug: "stegovna",
    title: "Stegovna odgovornost",
    dateLabel: "19. studenoga 2026.",
    lecturers: [{ name: "Ivan Poljak", bio: "" }],
  });

  it("puni mail: naslov, materijali, upitnik s QR-om, nadolazeće", async () => {
    const m = await renderMailNakon({
      seminar: seminar(),
      tekstovi,
      rok,
      materijaliUrl: "https://www.localis.hr/materijali/izvlastenje?k=abc",
      nadolazece: [nadolazeca],
    });
    expect(m.subject).toBe("Hvala što ste bili s nama: Izvlaštenje u JLS");
    expect(m.html).toContain("Preuzmi materijale");
    expect(m.html).toContain("Tihomir Kvakarić");
    expect(m.html).toContain("cid:upitnik-qr");
    expect(m.html).toContain("Što slijedi");
    expect(m.html).toContain("6.11.2026. u 08:00");
    expect(m.text).toContain("https://www.localis.hr/upitnik/izvlastenje");
    expect(m.text).toContain("https://www.localis.hr/materijali/izvlastenje?k=abc");
    expect(m.text).toContain("https://www.localis.hr/edukacije/stegovna");
    expect(m.text).toContain("Ivan Poljak");
    expect(m.qrPng.subarray(1, 4).toString()).toBe("PNG");
  });

  it("bez materijala i bez nadolazećih nema tih odjeljaka", async () => {
    const m = await renderMailNakon({ seminar: seminar(), tekstovi, rok, materijaliUrl: null, nadolazece: [] });
    expect(m.html).not.toContain("Preuzmi materijale");
    expect(m.html).not.toContain("autorsko djelo");
    expect(m.html).not.toContain("Što slijedi");
    expect(m.text).not.toContain("Što slijedi");
  });

  it("escapea HTML u nazivu", async () => {
    const m = await renderMailNakon({
      seminar: seminar({ title: 'A & <B> "C"' }),
      tekstovi,
      rok,
      materijaliUrl: null,
      nadolazece: [],
    });
    expect(m.html).toContain("A &amp; &lt;B&gt; &quot;C&quot;");
    expect(m.html).not.toContain("<B>");
    expect(m.subject).toBe('Hvala što ste bili s nama: A & <B> "C"');
  });
});
