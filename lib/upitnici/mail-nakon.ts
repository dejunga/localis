import QRCode from "qrcode";
import { isSeminarPast, type Seminar } from "@/lib/edukacije";
import { odlomci, telefonZaPoziv, zamijeniPolja, type Tekstovi } from "@/lib/tekstovi";
import { formatRoka } from "./rok";

// Mail nakon edukacije: zahvala, materijali, upitnik (gumb + QR) i nadolazeće edukacije.
// Čista funkcija - isti HTML vide pregled u adminu, probni mail, "Pošalji sada" i cron.

export const SITE_URL = "https://www.localis.hr";
export const QR_CID = "upitnik-qr";

const NAVY = "#14283c";
const ZLATO = "#c9962f";
const TEKST = "#2b2b2b";
const SIVO = "#6b7280";
const FONT = "Arial, Helvetica, sans-serif";

export function upitnikUrl(slug: string): string {
  return `${SITE_URL}/upitnik/${slug}`;
}

export function spojiImena(imena: string[]): string {
  if (imena.length <= 1) return imena[0] ?? "";
  return `${imena.slice(0, -1).join(", ")} i ${imena[imena.length - 1]}`;
}

// "Hotel Bonavia, Rijeka" -> "Rijeka"
export function gradEdukacije(location: string): string {
  return location.split(",").pop()!.trim();
}

export function nadolazeceEdukacije(seminari: Seminar[], now: Date, limit = 5): Seminar[] {
  return seminari
    .filter((s) => !s.odgodeno && !s.skriveno && !isSeminarPast(s, now))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
}

export type MailNakon = { subject: string; html: string; text: string; qrPng: Buffer };

export type MailNakonUlaz = {
  seminar: Seminar;
  tekstovi: Tekstovi;
  rok: Date;
  materijaliUrl: string | null; // null = nema materijala, odjeljak se ne prikazuje
  nadolazece: Seminar[];
};

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const p = (tekst: string, stil = "") =>
  `<p style="margin:0 0 16px;font:15px/1.6 ${FONT};color:${TEKST};${stil}">${esc(tekst).replace(/\n/g, "<br>")}</p>`;

function gumb(href: string, oznaka: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 20px"><tr>
<td bgcolor="${NAVY}" style="border-radius:6px"><a href="${esc(href)}" style="display:inline-block;padding:12px 26px;font:bold 15px ${FONT};color:#ffffff;text-decoration:none;border-radius:6px">${esc(oznaka)}</a></td>
</tr></table>`;
}

const naslov = (tekst: string) =>
  `<h2 style="margin:28px 0 12px;font:bold 17px ${FONT};color:${NAVY};border-top:2px solid ${ZLATO};padding-top:20px">${esc(tekst)}</h2>`;

export async function renderMailNakon({
  seminar,
  tekstovi: t,
  rok,
  materijaliUrl,
  nadolazece,
}: MailNakonUlaz): Promise<MailNakon> {
  const polja = {
    naziv: seminar.title,
    datum: seminar.dateLabel,
    predavaci: spojiImena(seminar.lecturers.map((l) => l.name)),
    rok: formatRoka(rok),
  };
  const z = (kljuc: keyof Tekstovi) => zamijeniPolja(t[kljuc], polja);
  const url = upitnikUrl(seminar.slug);
  const qrPng = await QRCode.toBuffer(url, { width: 320, margin: 1, errorCorrectionLevel: "M" });

  const nadolazeceRedci = nadolazece.map((s) => ({
    s,
    meta: `${s.dateLabel} · ${gradEdukacije(s.location)}`,
    predavaci: spojiImena(s.lecturers.map((l) => l.name)),
    href: `${SITE_URL}/edukacije/${s.slug}`,
  }));
  const telefon = t["kontakt.telefon"];
  const email = t["kontakt.email"];
  const web = SITE_URL.replace("https://", "");

  // --- HTML ---
  const dijelovi: string[] = [];
  dijelovi.push(...odlomci(z("mailNakon.uvod")).map((o) => p(o)));
  if (materijaliUrl) {
    dijelovi.push(p(z("mailNakon.materijali")), gumb(materijaliUrl, z("mailNakon.materijali.gumb")));
  }
  dijelovi.push(
    p(z("mailNakon.upitnik")),
    gumb(url, z("mailNakon.upitnik.gumb")),
    `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px"><tr>
<td style="padding-right:16px;vertical-align:middle"><img src="cid:${QR_CID}" width="120" height="120" alt="QR kod upitnika" style="display:block;border:0"></td>
<td style="vertical-align:middle;font:13px/1.5 ${FONT};color:${SIVO}">${esc(z("mailNakon.qr"))}</td>
</tr></table>`,
    p(z("mailNakon.upitnik.rok"), `font-size:13px;color:${SIVO}`),
  );
  if (nadolazeceRedci.length > 0) {
    dijelovi.push(naslov(z("mailNakon.nadolazece.naslov")));
    for (const r of nadolazeceRedci) {
      dijelovi.push(`<p style="margin:0 0 14px;font:14px/1.5 ${FONT};color:${TEKST}">
<span style="color:${ZLATO};font-weight:bold">${esc(r.meta)}</span><br>
<a href="${esc(r.href)}" style="color:${NAVY};font-weight:bold;text-decoration:none">${esc(r.s.title)}</a>${
        r.predavaci ? `<br><span style="color:${SIVO}">${esc(r.predavaci)}</span>` : ""
      }</p>`);
    }
    dijelovi.push(
      `<p style="margin:0 0 16px;font:14px ${FONT};color:${TEKST}">${esc(z("mailNakon.nadolazece.prijave"))} <a href="${SITE_URL}" style="color:${NAVY}">${web}</a></p>`,
    );
  }
  dijelovi.push(p(z("mailNakon.zakljucak"), "margin-top:24px"));
  dijelovi.push(`<p style="margin:0;font:14px/1.6 ${FONT};color:${TEKST}">${esc(z("mailNakon.potpis")).replace(/\n/g, "<br>")}<br>
<a href="mailto:${esc(email)}" style="color:${NAVY}">${esc(email)}</a> · <a href="tel:${esc(telefonZaPoziv(telefon))}" style="color:${NAVY}">${esc(telefon)}</a> · <a href="${SITE_URL}" style="color:${NAVY}">${web}</a></p>`);

  const html = `<!DOCTYPE html>
<html lang="hr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(zamijeniPolja(t["mailNakon.naslov"], polja))}</title></head>
<body style="margin:0;padding:0;background:#f3f4f6">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f3f4f6"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="width:100%;max-width:600px;border-radius:8px">
<tr><td style="padding:24px 32px 18px;border-bottom:3px solid ${ZLATO}"><a href="${SITE_URL}"><img src="${SITE_URL}/images/email/logo-localis.png" width="190" alt="${esc(t["firma.naziv"])}" style="display:block;border:0;height:auto"></a></td></tr>
<tr><td style="padding:28px 32px 32px">
${dijelovi.join("\n")}
</td></tr>
</table>
<p style="margin:16px 0 0;max-width:600px;font:12px/1.5 ${FONT};color:${SIVO}">${esc(z("mailNakon.odjava"))}</p>
</td></tr></table>
</body></html>`;

  // --- tekst ---
  const redci: string[] = [...odlomci(z("mailNakon.uvod"))];
  if (materijaliUrl) redci.push(z("mailNakon.materijali"), `${z("mailNakon.materijali.gumb")}: ${materijaliUrl}`);
  redci.push(z("mailNakon.upitnik"), `${z("mailNakon.upitnik.gumb")}: ${url}`, z("mailNakon.upitnik.rok"));
  if (nadolazeceRedci.length > 0) {
    redci.push(
      [
        `${z("mailNakon.nadolazece.naslov")}:`,
        ...nadolazeceRedci.map((r) => `- ${r.meta} – ${r.s.title}${r.predavaci ? ` (${r.predavaci})` : ""}\n  ${r.href}`),
      ].join("\n"),
      `${z("mailNakon.nadolazece.prijave")} ${SITE_URL}`,
    );
  }
  redci.push(
    z("mailNakon.zakljucak"),
    `${z("mailNakon.potpis")}\n${email} · ${telefon} · ${web}`,
    z("mailNakon.odjava"),
  );

  return { subject: zamijeniPolja(t["mailNakon.naslov"], polja), html, text: redci.join("\n\n"), qrPng };
}
