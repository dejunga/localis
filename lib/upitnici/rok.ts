import type { Seminar } from "@/lib/edukacije";

export type StanjeUpitnika = "uskoro" | "otvoren" | "zatvoren";

type Termin = Pick<Seminar, "date" | "time">;
type TerminSRokom = Pick<Seminar, "date" | "time" | "upitnikRokDo">;

const TRAJANJE_MS = 96 * 60 * 60 * 1000;

// Zagreb lokalno -> UTC: pogodi kao UTC, izmjeri offset Zagreba u tom trenutku, oduzmi.
function zagrebUDate(datum: string, sat: number, minuta: number): Date {
  const [y, m, d] = datum.split("-").map(Number);
  const guess = Date.UTC(y, m - 1, d, sat, minuta);
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Zagreb",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date(guess))
      .map((x) => [x.type, Number(x.value)]),
  );
  const offset = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - guess;
  return new Date(guess - offset);
}

// "9.30 - 15.30" -> [[9, 30], [15, 30]]; prihvaća i "10:00".
function sati(time: string): [number, number][] {
  return [...time.matchAll(/(\d{1,2})[.:](\d{2})/g)].map((m) => [Number(m[1]), Number(m[2])]);
}

// Ako se početak ne da pročitati, upitnik se otvara u ponoć na dan edukacije.
export function pocetakEdukacije(s: Termin): Date {
  const [pocetak] = sati(s.time);
  return pocetak ? zagrebUDate(s.date, ...pocetak) : zagrebUDate(s.date, 0, 0);
}

// Kraj je drugo vrijeme u `time`; bez njega 23:59 na dan edukacije.
export function krajEdukacije(s: Termin): Date {
  const kraj = sati(s.time)[1];
  return kraj ? zagrebUDate(s.date, ...kraj) : zagrebUDate(s.date, 23, 59);
}

// Cron (vercel.json "0 7 * * *") šalje mail nakon edukacije u 07:00 UTC zadanog dana.
export function terminSlanja(datum: string): Date {
  return new Date(`${datum}T07:00:00Z`);
}

// Rok je 96 h od kraja edukacije ili od termina maila, što je kasnije - mail poslan danima
// nakon edukacije ne smije stići uz upitnik koji se zatvara sutra.
export function rokUpitnika(s: TerminSRokom, datumSlanja?: string | null): Date {
  if (s.upitnikRokDo) return new Date(s.upitnikRokDo);
  const odKraja = krajEdukacije(s).getTime() + TRAJANJE_MS;
  const odSlanja = datumSlanja ? terminSlanja(datumSlanja).getTime() + TRAJANJE_MS : 0;
  return new Date(Math.max(odKraja, odSlanja));
}

export function stanjeUpitnika(
  s: TerminSRokom,
  now = new Date(),
  datumSlanja?: string | null,
): StanjeUpitnika {
  if (now < pocetakEdukacije(s)) return "uskoro";
  return now < rokUpitnika(s, datumSlanja) ? "otvoren" : "zatvoren";
}

export function edukacijaZavrsila(s: Termin, now = new Date()): boolean {
  return now >= krajEdukacije(s);
}

// "1.11.2026. u 15:30" po zagrebačkom vremenu.
export function formatRoka(d: Date): string {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Zagreb",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(d)
      .map((x) => [x.type, x.value]),
  );
  return `${p.day}.${p.month}.${p.year}. u ${p.hour}:${p.minute}`;
}
