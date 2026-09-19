import { describe, expect, it } from "vitest";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { renderPonudaPdf, type PonudaPdfData } from "./pdf";

const cabar: PonudaPdfData = {
  broj: "7-112/26",
  datumIzdavanja: "2026-09-17",
  vrijediDo: "2026-09-19",
  rokPlacanja: "2026-09-19",
  klijent: {
    naziv: "GRAD ČABAR",
    adresa: "Narodnog oslobođenja 2, 51306 Čabar",
    oib: "04026778166",
    kontakt: "Ines Loknar Josić",
    telefon: "095/5014046",
    email: "ines.loknar@cabar.hr",
  },
  edukacija: {
    kicker: "Praktična radionica",
    naslov: "Kako izraditi opći akt u JLP(R)S: od pravnog temelja do sudske prakse",
    predavac: "Dipl.iur. Vikica Duvnjak i dipl.iur. Aleksandra Jozić-Ileković",
    datumLabel: "28. rujna 2026.",
    mjesto: "Hotel Antunović, Zagrebačka avenija 100a",
    ukljuceno: "radni materijali, coffee break, potvrda o sudjelovanju",
    nazivStavke:
      "Praktična radionica – Kako izraditi opći akt u JLP(R)S: od pravnog temelja do sudske prakse",
  },
  polaznici: [
    { ime: "Ines Loknar Josić", radnoMjesto: "pročelnica" },
    { ime: "Marija Gašpar", radnoMjesto: "viša savjetnica za imovinsko-pravne poslove" },
  ],
  kolicina: 2,
  cijena: 199,
  ukupno: 398,
  potpisnik: "Milada Sofka, voditeljica ureda",
};

describe("renderPonudaPdf", () => {
  it("renderira PDF sa svim ključnim podacima", async () => {
    const buffer = await renderPonudaPdf(cabar);
    expect(buffer.subarray(0, 5).toString()).toBe("%PDF-");
    const { text, numpages } = await pdfParse(buffer);
    expect(numpages).toBe(1);
    for (const s of [
      "PONUDA BROJ: 7-112/26",
      "GRAD ČABAR",
      "04026778166",
      "Ines Loknar Josić, pročelnica i Marija Gašpar",
      "28. rujna 2026.",
      "17. rujna 2026.",
      "19. rujna 2026.",
      "398,00",
      "199,00",
      "HR00 7-112/26",
      "Milada Sofka, voditeljica ureda",
      "Obrt nije u sustavu PDV-a",
    ]) {
      expect(text).toContain(s);
    }
  }, 30_000);
});
