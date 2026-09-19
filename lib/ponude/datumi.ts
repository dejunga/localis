// Svi datumi su ISO stringovi "YYYY-MM-DD" - isto kao Drizzle `date` kolone.

export function dodajDane(iso: string, dani: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + dani)).toISOString().slice(0, 10);
}

// Radni dani = ponedjeljak-petak. Svaki korak ide na sljedeći dan, ali vikend se ne broji.
// Državni praznici se ne uzimaju u obzir.
export function dodajRadneDane(iso: string, radniDani: number): string {
  let datum = iso;
  let preostalo = radniDani;
  while (preostalo > 0) {
    datum = dodajDane(datum, 1);
    const danUTjednu = new Date(`${datum}T00:00:00Z`).getUTCDay(); // 0 = ned, 6 = sub
    if (danUTjednu !== 0 && danUTjednu !== 6) preostalo--;
  }
  return datum;
}

export function danasZagreb(now = new Date()): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Zagreb" }).format(now);
}

export type DatumiPonude = {
  datumIzdavanja: string;
  vrijediDo: string;
  rokPlacanja: string;
};

// Pravilo (spec): vrijedi do = rok plaćanja = izdavanje + N radnih dana (pon-pet),
// ali nikad nakon datuma edukacije i nikad prije dana izdavanja.
export function izracunajDatumePonude(input: {
  danas: string;
  daniValjanosti: number;
  datumEdukacije: string;
}): DatumiPonude {
  let vrijediDo = dodajRadneDane(input.danas, input.daniValjanosti);
  if (vrijediDo > input.datumEdukacije) vrijediDo = input.datumEdukacije;
  if (vrijediDo < input.danas) vrijediDo = input.danas;
  return { datumIzdavanja: input.danas, vrijediDo, rokPlacanja: vrijediDo };
}
