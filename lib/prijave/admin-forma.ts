import type { IzmjenaPrijave } from "./spremi";

// Bez zareza, zagrada i navodnika - adresa ide u zaglavlja maila i ne smije se razbiti na više primatelja.
const EMAIL_RE = /^[^\s@,;<>()"]+@[^\s@,;<>()"]+\.[^\s@,;<>()"]+$/;
const OIB_RE = /^\d{11}$/;

// Ista pravila za uređivanje postojeće i ručni unos nove prijave u adminu.
export function procitajPodatkePrijave(formData: FormData): { podaci: IzmjenaPrijave } | { greska: string } {
  const imena = formData.getAll("polaznik_ime").map((v) => String(v).trim());
  const radna = formData.getAll("polaznik_radno_mjesto").map((v) => String(v).trim());
  const polaznici = imena
    .map((ime, i) => ({ ime, radnoMjesto: radna[i] ?? "" }))
    .filter((p) => p.ime || p.radnoMjesto);
  const p = {
    kontaktIme: String(formData.get("kontaktIme") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    telefon: String(formData.get("telefon") ?? "").trim(),
    organizacija: String(formData.get("organizacija") ?? "").trim(),
    adresa: String(formData.get("adresa") ?? "").trim(),
    oib: String(formData.get("oib") ?? "").trim(),
    napomena: String(formData.get("napomena") ?? "").trim() || null,
    polaznici,
  };
  if (!p.kontaktIme || !p.organizacija || !p.adresa || !p.telefon) {
    return { greska: "Sva polja osim napomene su obavezna." };
  }
  if (!EMAIL_RE.test(p.email)) return { greska: "Neispravan email." };
  if (!OIB_RE.test(p.oib)) return { greska: "OIB mora imati 11 znamenaka." };
  if (polaznici.length === 0 || polaznici.some((x) => !x.ime || !x.radnoMjesto)) {
    return { greska: "Svaki polaznik treba ime i radno mjesto." };
  }
  return { podaci: p };
}
