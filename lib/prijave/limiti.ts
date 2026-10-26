// Najveće duljine polja javne forme za prijavu. Dijeli se između forme (maxLength)
// i server akcije (stvarna provjera) - zato ovdje nema server-only importa.
export const MAX_DULJINA = {
  ime: 120,
  email: 254,
  telefon: 40,
  organizacija: 200,
  adresa: 250,
  napomena: 2000,
  polaznikIme: 120,
  polaznikRadnoMjesto: 120,
} as const;

export const MAX_POLAZNIKA = 50;

// Broj slobodnih mjesta prikazuje se javno tek kad ih ostane ovoliko ili manje - da potakne prijavu,
// a da se kod poluprazne edukacije ne vidi koliko je ljudi prijavljeno.
export const PRAG_PRIKAZA_MJESTA = 5;

// Slobodna mjesta za javni prikaz: broj do praga uključivo (0 = popunjeno), inače null (ne prikazuje se).
export function mjestaZaPrikaz(slobodno: number | null): number | null {
  return slobodno !== null && slobodno <= PRAG_PRIKAZA_MJESTA ? slobodno : null;
}
