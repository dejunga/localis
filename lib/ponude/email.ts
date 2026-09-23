import { getMailConfig, sendMail } from "@/lib/email/transport";
import { IZDAVATELJ } from "./izdavatelj";
import { formatIznos, type PolaznikZaIspis } from "./format";

export type MailKlijentuInput = {
  kontaktIme: string;
  naslov: string;
  datumLabel: string;
  mjesto: string;
  broj: string;
  potpisnik: string;
};

export function tekstMailaKlijentu(i: MailKlijentuInput): string {
  return [
    `Poštovani/a ${i.kontaktIme},`,
    "",
    `zahvaljujemo na prijavi na edukaciju „${i.naslov}" (${i.datumLabel}, ${i.mjesto}).`,
    "",
    `U privitku dostavljamo ponudu br. ${i.broj}.`,
    "Molimo da uplatu izvršite u roku navedenom u ponudi ili da svoje mjesto osigurate dostavom narudžbenice.",
    "",
    `Za sva pitanja stojimo na raspolaganju: ${IZDAVATELJ.email}, ${IZDAVATELJ.telefon}.`,
    "",
    IZDAVATELJ.naziv,
    i.potpisnik,
  ].join("\n");
}

export type InterniMailInput = {
  seminarTitle: string;
  kontaktIme: string;
  email: string;
  telefon: string;
  organizacija: string;
  adresa: string;
  oib: string;
  napomena: string | null;
  polaznici: PolaznikZaIspis[];
  prijavaId: number;
  ponuda: { broj: string; ukupno: string | number } | null;
  greska?: string | null;
};

export function tekstInternogMaila(i: InterniMailInput): string {
  const ponudaLinije = i.ponuda
    ? [`Ponuda: ${i.ponuda.broj}, ukupno ${formatIznos(i.ponuda.ukupno)} EUR (PDF u privitku)`]
    : i.greska
      ? [`PONUDA NIJE IZDANA - provjeri /admin/prijave/${i.prijavaId}`, `Greška: ${i.greska}`]
      : ["Edukacija nema definiranu ponudu - ponuda nije izdana."];
  return [
    `Edukacija: ${i.seminarTitle}`,
    ...ponudaLinije,
    "",
    `Ime i prezime: ${i.kontaktIme}`,
    `Email: ${i.email}`,
    `Telefon: ${i.telefon || "-"}`,
    `Ustanova/tvrtka: ${i.organizacija}`,
    `Adresa: ${i.adresa}`,
    `OIB: ${i.oib}`,
    "",
    "Polaznici:",
    ...i.polaznici.map((p, idx) => `${idx + 1}. ${p.ime} (${p.radnoMjesto})`),
    "",
    i.napomena || "-",
  ].join("\n");
}

export type Privitak = { filename: string; content: Buffer };

export async function posaljiPonuduKlijentu(
  to: string,
  input: MailKlijentuInput,
  privitak: Privitak,
): Promise<void> {
  const mail = getMailConfig();
  if (!mail) throw new Error("SMTP nije konfiguriran.");
  await sendMail({
    from: `"LOCALIS" <${mail.user}>`,
    to,
    replyTo: `"LOCALIS" <${mail.user}>`,
    subject: `Ponuda br. ${input.broj} - ${input.naslov}`,
    text: tekstMailaKlijentu(input),
    attachments: [{ filename: privitak.filename, content: privitak.content, contentType: "application/pdf" }],
  });
}

export async function posaljiInterniMail(input: InterniMailInput, privitak?: Privitak): Promise<void> {
  const mail = getMailConfig();
  if (!mail) throw new Error("SMTP nije konfiguriran.");
  await sendMail({
    from: `"LOCALIS web" <${mail.user}>`,
    to: mail.internalTo,
    replyTo: `"${input.kontaktIme}" <${input.email}>`,
    subject: `Nova prijava na edukaciju - ${input.seminarTitle}`,
    text: tekstInternogMaila(input),
    attachments: privitak
      ? [{ filename: privitak.filename, content: privitak.content, contentType: "application/pdf" }]
      : [],
  });
}

export async function posaljiStornoKlijentu(to: string, broj: string, potpisnik: string): Promise<void> {
  const mail = getMailConfig();
  if (!mail) throw new Error("SMTP nije konfiguriran.");
  await sendMail({
    from: `"LOCALIS" <${mail.user}>`,
    to,
    replyTo: `"LOCALIS" <${mail.user}>`,
    subject: `Storno ponude br. ${broj}`,
    text: [
      "Poštovani,",
      "",
      `obavještavamo vas da je ponuda br. ${broj} stornirana i više nije važeća.`,
      "Ako je potrebno, nova ponuda slijedi zasebnim mailom. Za pitanja nam se obratite na info@localis.hr.",
      "",
      IZDAVATELJ.naziv,
      potpisnik,
    ].join("\n"),
  });
}
