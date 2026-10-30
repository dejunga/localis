// Lokalni pregled maila nakon edukacije bez baze (zadani tekstovi, primjer poveznice na materijale).
// npx tsx scripts/pregled-maila-nakon.ts <slug> <datum-slanja YYYY-MM-DD> <izlazna-mapa>
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { getSeminar, getSeminars } from "@/lib/edukacije";
import { SVA_POLJA, type Tekstovi } from "@/lib/tekstovi";
import { nadolazeceEdukacije, QR_CID, renderMailNakon, SITE_URL } from "@/lib/upitnici/mail-nakon";
import { rokUpitnika, terminSlanja } from "@/lib/upitnici/rok";

async function main() {
  const [slug, datum, izlaz = "."] = process.argv.slice(2);
  const seminar = await getSeminar(slug, { skrivene: true });
  if (!seminar || !datum) throw new Error("Upotreba: <slug> <YYYY-MM-DD> [izlazna-mapa]");

  const tekstovi = Object.fromEntries(SVA_POLJA.map((p) => [p.kljuc, p.zadano])) as Tekstovi;
  const m = await renderMailNakon({
    seminar,
    tekstovi,
    rok: rokUpitnika(seminar, datum),
    materijaliUrl: `${SITE_URL}/materijali/${slug}?k=PRIMJER`,
    nadolazece: nadolazeceEdukacije(await getSeminars(), terminSlanja(datum)),
  });
  const html = m.html.replace(`cid:${QR_CID}`, `data:image/png;base64,${m.qrPng.toString("base64")}`);
  writeFileSync(join(izlaz, "mail.html"), html);
  writeFileSync(join(izlaz, "mail.txt"), `Predmet: ${m.subject}\n\n${m.text}`);
  console.log(`Spremljeno u ${izlaz}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
