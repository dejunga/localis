// Limiti i tekst privole javnog upitnika. Dijeli se između forme (maxLength) i server akcije -
// zato ovdje nema server-only importa.
export const UPITNIK_MAX_DULJINA = {
  tekst: 2000,
  ime: 120,
  ustanova: 200,
  email: 254,
} as const;

// Kad se tekst promijeni, podigni verziju - uz svaku privolu u bazi pamti se verzija na koju je pristao.
export const UPITNIK_PRIVOLA_TEKST =
  "Pristajem da me LOCALIS kontaktira na navedenu e-mail adresu u vezi s mojim odgovorima u ovom upitniku. Privolu mogu povući u bilo kojem trenutku.";
export const UPITNIK_PRIVOLA_VERZIJA = "2026-10-29";

export const UPITNIK_OBJAVA_TEKST =
  "Dopuštam da LOCALIS moju recenziju objavi na stranici localis.hr, bez mog imena i prezimena.";
export const UPITNIK_OBJAVA_VERZIJA = "2026-10-30";
