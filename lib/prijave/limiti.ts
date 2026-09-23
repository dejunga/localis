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
