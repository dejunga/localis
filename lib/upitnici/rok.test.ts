import { describe, expect, it } from "vitest";
import {
  edukacijaZavrsila,
  formatRoka,
  krajEdukacije,
  pocetakEdukacije,
  rokUpitnika,
  stanjeUpitnika,
} from "./rok";

// 28.10.2026. je tri dana nakon prelaska na zimsko vrijeme (UTC+1).
const s = { date: "2026-10-28", time: "9.30 - 15.30" };

describe("rok upitnika", () => {
  it("početak i kraj u zimskom vremenu", () => {
    expect(pocetakEdukacije(s).toISOString()).toBe("2026-10-28T08:30:00.000Z");
    expect(krajEdukacije(s).toISOString()).toBe("2026-10-28T14:30:00.000Z");
  });

  it("rok je kraj + 96 h", () => {
    expect(rokUpitnika(s).toISOString()).toBe("2026-11-01T14:30:00.000Z");
    expect(formatRoka(rokUpitnika(s))).toBe("1. 11. 2026. u 15:30");
  });

  it("kraj u ljetnom vremenu", () => {
    expect(krajEdukacije({ date: "2026-09-14", time: "9.30 - 15.00" }).toISOString()).toBe(
      "2026-09-14T13:00:00.000Z",
    );
  });

  it("čita i točku i dvotočku", () => {
    expect(krajEdukacije({ date: "2026-11-30", time: "11.00 - 17.00" }).toISOString()).toBe(
      "2026-11-30T16:00:00.000Z",
    );
    expect(krajEdukacije({ date: "2026-11-30", time: "10:00 - 16:00" }).toISOString()).toBe(
      "2026-11-30T15:00:00.000Z",
    );
  });

  it("neparsabilno vrijeme: cijeli dan", () => {
    const d = { date: "2026-11-30", time: "cijeli dan" };
    expect(pocetakEdukacije(d).toISOString()).toBe("2026-11-29T23:00:00.000Z");
    expect(krajEdukacije(d).toISOString()).toBe("2026-11-30T22:59:00.000Z");
  });

  it("samo početak: kraj u 23:59", () => {
    expect(krajEdukacije({ date: "2026-11-30", time: "9.00" }).toISOString()).toBe(
      "2026-11-30T22:59:00.000Z",
    );
  });

  it("upitnikRokDo zamjenjuje kraj + 96 h", () => {
    expect(rokUpitnika({ ...s, upitnikRokDo: "2026-11-03T18:00:00+01:00" }).toISOString()).toBe(
      "2026-11-03T17:00:00.000Z",
    );
  });

  it("stanja oko granica", () => {
    expect(stanjeUpitnika(s, new Date("2026-10-28T08:29:00Z"))).toBe("uskoro");
    expect(stanjeUpitnika(s, new Date("2026-10-28T08:30:00Z"))).toBe("otvoren");
    expect(stanjeUpitnika(s, new Date("2026-11-01T14:29:59Z"))).toBe("otvoren");
    expect(stanjeUpitnika(s, new Date("2026-11-01T14:30:00Z"))).toBe("zatvoren");
  });

  it("edukacija završava u trenutku kraja", () => {
    expect(edukacijaZavrsila(s, new Date("2026-10-28T14:29:00Z"))).toBe(false);
    expect(edukacijaZavrsila(s, new Date("2026-10-28T14:30:00Z"))).toBe(true);
  });
});
