import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import type { PolaznikZaIspis } from "./format";

// Sve što PDF treba - čisti podaci, bez DB tipova, da se može renderirati i u testu.
export type PonudaPdfData = {
  broj: string;
  datumIzdavanja: string; // ISO
  vrijediDo: string; // ISO
  rokPlacanja: string; // ISO
  klijent: {
    naziv: string;
    adresa: string;
    oib: string;
    kontakt: string;
    telefon: string;
    email: string;
  };
  edukacija: {
    kicker: string;
    naslov: string;
    predavac: string;
    datumLabel: string;
    mjesto: string;
    ukljuceno: string;
    nazivStavke: string;
  };
  polaznici: PolaznikZaIspis[];
  kolicina: number;
  cijena: number;
  ukupno: number;
  potpisnik: string;
};

export async function renderPonudaPdf(data: PonudaPdfData): Promise<Buffer> {
  // Dinamički import da se react-pdf (težak modul) ne učitava na rutama koje ga ne trebaju.
  const { PonudaPdf } = await import("./PonudaPdf");
  // renderToBuffer traži ReactElement<DocumentProps>; PonudaPdf vraća <Document>, ali njegovi propsi su {data}.
  const element = createElement(PonudaPdf, { data }) as unknown as ReactElement<DocumentProps>;
  return renderToBuffer(element);
}
