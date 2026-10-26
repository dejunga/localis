import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, CheckCircle2, Users, HelpCircle } from "lucide-react";
import { aktualnaCijena, getSeminar, getSeminarSlugs, isSeminarPast } from "@/lib/edukacije";
import { getPostavke } from "@/lib/postavke";
import { getTekstovi } from "@/lib/tekstovi";
import { MAX_POLAZNIKA, mjestaZaPrikaz } from "@/lib/prijave/limiti";
import { zauzetaMjesta } from "@/lib/prijave/mjesta";
import RegistracijaForm from "./RegistracijaForm";
import PrijaviSeButton from "./PrijaviSeButton";
import PlutajucaPrijava from "./PlutajucaPrijava";
import ProgramRadionice from "./ProgramRadionice";
import RasklopivTekst from "./RasklopivTekst";

// Stranica je statična; regenerira se svakih 5 minuta da edukacije koje su počele
// izgube gumb i formu za prijavu bez novog builda.
export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getSeminarSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const seminar = await getSeminar(slug);

  if (!seminar) return { title: "Edukacija nije pronađena - LOCALIS" };

  const image = seminar.coverImage ?? seminar.lecturers.find((l) => l.photo)?.photo;

  return {
    title: `${seminar.title} - LOCALIS`,
    description: seminar.excerpt,
    alternates: { canonical: `/edukacije/${seminar.slug}` },
    openGraph: {
      type: "article",
      title: seminar.title,
      description: seminar.excerpt,
      images: image ? [image.url] : undefined,
    },
  };
}

// "2026-10-14" -> "14.10.2026."
function datumBrojevima(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}.${m}.${y}.`;
}

const DANI = ["Nedjelja", "Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak", "Subota"];

// "2026-10-28" -> "Srijeda" (podne UTC da vremenska zona ne pomakne dan)
function danUTjednu(iso: string): string {
  return DANI[new Date(`${iso}T12:00:00Z`).getUTCDay()];
}

// null = baza nedostupna (npr. build bez DATABASE_URL); server akcija svejedno provjerava limit.
async function slobodnaMjesta(slug: string): Promise<number | null> {
  try {
    const [{ maxMjesta }, zauzeto] = await Promise.all([getPostavke(), zauzetaMjesta(slug)]);
    return Math.max(0, maxMjesta - zauzeto);
  } catch {
    return null;
  }
}

function toIsoTime(hrTime: string): string {
  const [h, m] = hrTime.trim().split(".");
  return `${h.padStart(2, "0")}:${(m ?? "00").padStart(2, "0")}:00`;
}

export default async function SeminarPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const seminar = await getSeminar(slug);

  if (!seminar) notFound();

  const odgodeno = Boolean(seminar.odgodeno);
  // Prijave su zatvorene i za održane i za odgođene edukacije.
  const past = odgodeno || isSeminarPast(seminar);
  const slobodno = past ? null : await slobodnaMjesta(seminar.slug);
  const popunjeno = slobodno === 0;
  const { "kontakt.email": email } = await getTekstovi();
  const [startRaw, endRaw] = seminar.time.split("-").map((s) => s.trim());
  const cijena = aktualnaCijena(seminar);
  const price = Number(cijena.price.replace(/\./g, "").replace(",", ".").replace(/[^0-9.]/g, ""));

  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: seminar.title,
    description: seminar.excerpt,
    startDate: `${seminar.date}T${toIsoTime(startRaw)}+02:00`,
    endDate: endRaw ? `${seminar.date}T${toIsoTime(endRaw)}+02:00` : undefined,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: odgodeno
      ? "https://schema.org/EventPostponed"
      : "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: seminar.location,
      address: seminar.locationDetail ?? seminar.location,
    },
    image: (seminar.coverImage ?? seminar.lecturers.find((l) => l.photo)?.photo)?.url,
    organizer: {
      "@type": "Organization",
      name: "LOCALIS",
      url: "https://www.localis.hr",
    },
    performer: seminar.lecturers.map((lecturer) => ({
      "@type": "Person",
      name: lecturer.name,
    })),
    offers: past
      ? undefined
      : {
          "@type": "Offer",
          price: Number.isFinite(price) ? price : undefined,
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
          url: `https://www.localis.hr/edukacije/${seminar.slug}`,
        },
  };

  const rana = cijena.rana ? seminar.ranaPrijava : undefined;
  // vidi mjestaZaPrikaz - broj samo kad ih je ostalo 5 ili manje
  const mjesta = popunjeno ? null : mjestaZaPrikaz(slobodno);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd) }}
      />
      {/* Hero */}
      <section className="bg-[var(--navy)] pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <Link
            href="/edukacije"
            className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft size={15} />
            Nazad na edukacije
          </Link>

          <p className="text-[var(--gold)] font-medium mb-3">{seminar.kicker}</p>

          <h1 className="text-3xl md:text-4xl font-bold text-white font-[family-name:var(--font-playfair)] leading-tight mb-6">
            {(seminar.titleLines ?? [seminar.title]).map((line, i, lines) => (
              <span key={line} className={i > 0 ? "text-[0.85em]" : undefined}>
                {line}
                {i < lines.length - 1 && <br />}
              </span>
            ))}
          </h1>

          {/* Samo lice i ime - funkcija i biografija su u sekciji predavača niže. */}
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {seminar.lecturers.map((lecturer) => (
              <span key={lecturer.name} className="inline-flex items-center gap-3 text-white font-medium">
                <span className="relative size-10 shrink-0 overflow-hidden rounded-full bg-white/10 ring-2 ring-[var(--gold)]/60">
                  {lecturer.photo && (
                    <Image
                      src={lecturer.photo.url}
                      alt=""
                      fill
                      sizes="40px"
                      className="object-cover"
                      style={{ objectPosition: lecturer.photo.position ?? "center top" }}
                    />
                  )}
                </span>
                {lecturer.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6">
        {/* Info ploča: kada, gdje, kotizacija. Na desktopu šira od stupca teksta. */}
        <div className="relative -mt-10 mb-16 lg:-mx-16 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)] divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <div className="p-6 md:p-8">
            <p className="text-sm text-gray-500 mb-2">Kada</p>
            <p className="text-lg font-bold text-[var(--navy)] leading-snug">
              {danUTjednu(seminar.date)}, {seminar.dateLabel}
            </p>
            <p className="mt-1 text-gray-700 tabular-nums">{seminar.time.replace(/\s*-\s*/, " – ")}</p>
          </div>

          <div className="p-6 md:p-8">
            <p className="text-sm text-gray-500 mb-2">Gdje</p>
            <p className="text-lg font-bold text-[var(--navy)] leading-snug">{seminar.location}</p>
            {seminar.locationDetail && (
              <p className="mt-1 text-sm text-gray-600 text-pretty">{seminar.locationDetail}</p>
            )}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(seminar.location)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--navy)] underline decoration-[var(--gold)] decoration-2 underline-offset-4 hover:text-[var(--navy-light)]"
            >
              <MapPin size={15} className="text-[var(--gold)]" />
              Otvori u Google kartama
            </a>
          </div>

          <div className="p-6 md:p-8 bg-[oklch(0.97_0.01_85)]">
            <p className="text-sm text-gray-500 mb-2">Kotizacija po polazniku</p>
            <p className="text-3xl font-bold text-[var(--navy)] tabular-nums leading-none">{cijena.price}</p>
            {rana && (
              <p className="mt-2 text-sm text-gray-600 text-pretty">
                Cijena za rane prijave do {datumBrojevima(rana.do)}, zatim {seminar.price}.
              </p>
            )}
            {/* Grupni popust računa samo automatska ponuda (lib/ponude/popust.ts). */}
            {seminar.ponuda && (
              <dl className="mt-4 space-y-1 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-600">2. polaznik</dt>
                  <dd className="font-semibold text-green-700 tabular-nums">−10 %</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-600">od 3. polaznika</dt>
                  <dd className="font-semibold text-green-700 tabular-nums">−20 %</dd>
                </div>
              </dl>
            )}
            {mjesta != null && mjesta > 0 && (
              <p className="mt-4 inline-flex rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                {mjesta === 1 ? "Još 1 slobodno mjesto" : `Još ${mjesta} slobodnih mjesta`}
              </p>
            )}
            {seminar.priceNote && <p className="mt-3 text-xs text-gray-500 text-pretty">{seminar.priceNote}</p>}
          </div>
        </div>

        {odgodeno && (
          <div className="mb-16 bg-red-50 border-l-4 border-red-600 rounded-r-lg p-6">
            <p className="font-bold text-red-800 mb-1">Edukacija je odgođena</p>
            <p className="text-red-900/80 text-sm leading-relaxed">
              Edukacija neće biti održana {seminar.dateLabel.replace(/\.$/, "")}. Novi termin objavit
              ćemo naknadno, a prijave su do tada zatvorene.
            </p>
          </div>
        )}

        {!past && (
          <div id="prijavi-se-gumb" className="flex justify-center mb-20">
            <PrijaviSeButton />
          </div>
        )}
        {!past && !popunjeno && (
          <PlutajucaPrijava
            naslov={seminar.title}
            datum={seminar.dateLabel}
            cijena={cijena.price}
            mjesta={mjestaZaPrikaz(slobodno)}
          />
        )}

        {/* Description */}
        <section className="mb-16">
          <div
            className={
              seminar.descriptionHighlighted
                ? "bg-[var(--gold)]/6 border-l-4 border-[var(--gold)] rounded-r-lg p-6 text-gray-700 leading-relaxed space-y-4"
                : "prose prose-lg max-w-none text-gray-600 leading-relaxed space-y-4"
            }
          >
            {seminar.description.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          {seminar.helpText && (
            <div className="mt-8 bg-[var(--gold)]/6 border-l-4 border-[var(--gold)] rounded-r-lg p-6">
              {seminar.helpTitle && (
                <h2 className="text-lg font-bold text-[var(--navy)] font-[family-name:var(--font-playfair)] mb-2">
                  {seminar.helpTitle}
                </h2>
              )}
              <p className="text-gray-700 leading-relaxed">{seminar.helpText}</p>
            </div>
          )}
        </section>

        {/* Lecturers - odmah nakon opisa: za ovu publiku predavač je glavni razlog za prijavu */}
        <section className="mb-20 space-y-10">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--navy)] font-[family-name:var(--font-playfair)]">
            {seminar.lecturers.length > 1 ? "Predavači" : "Predavač"}
          </h2>
          {seminar.lecturers.map((lecturer) => (
            <div key={lecturer.name} className="flex flex-col sm:flex-row gap-8 items-start">
              <div className="relative w-36 h-44 rounded-xl bg-gradient-to-br from-[var(--navy)]/10 to-[var(--navy)]/3 overflow-hidden shrink-0 mx-auto sm:mx-0 flex items-center justify-center">
                {lecturer.photo ? (
                  <Image
                    src={lecturer.photo.url}
                    alt={lecturer.photo.alt}
                    fill
                    sizes="144px"
                    className="object-cover"
                    style={{ objectPosition: lecturer.photo.position ?? "center top" }}
                  />
                ) : (
                  <span className="text-[var(--navy)]/20 text-5xl font-bold font-[family-name:var(--font-playfair)]">
                    {lecturer.name.split(" ").find((word) => !word.endsWith("."))?.[0]}
                  </span>
                )}
              </div>
              <div>
                <div className={`font-bold text-[var(--navy)] text-lg ${lecturer.role ? "mb-1" : "mb-4"}`}>
                  {lecturer.name}
                </div>
                {lecturer.role && (
                  <div className="text-[var(--gold)] text-sm font-medium mb-4">{lecturer.role}</div>
                )}
                <RasklopivTekst tekst={lecturer.bio} redaka={5} />
              </div>
            </div>
          ))}

          {seminar.lecturersNote && (
            <div className="bg-[var(--gold)]/6 border-l-4 border-[var(--gold)] rounded-r-lg p-6">
              {seminar.lecturersNote.title && (
                <h2 className="text-lg font-bold text-[var(--navy)] font-[family-name:var(--font-playfair)] mb-2">
                  {seminar.lecturersNote.title}
                </h2>
              )}
              <p className="text-gray-700 leading-relaxed">{seminar.lecturersNote.text}</p>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          {/* Target audience or "Prijavite se i saznajte" */}
          <section>
            <div className="flex items-center gap-2.5 mb-5">
              {seminar.targetAudience ? (
                <Users size={18} className="text-[var(--navy)]" />
              ) : (
                <HelpCircle size={18} className="text-[var(--navy)]" />
              )}
              <h2 className="text-xl font-bold text-[var(--navy)] font-[family-name:var(--font-playfair)]">
                {seminar.targetAudience ? "Kome je namijenjeno" : "Prijavite se i saznajte"}
              </h2>
            </div>
            <ul className="space-y-2.5">
              {(seminar.targetAudience ?? seminar.questions ?? []).map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-gray-600 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Goals */}
          <section>
            <div className="flex items-center gap-2.5 mb-5">
              <CheckCircle2 size={18} className="text-[var(--navy)]" />
              <h2 className="text-xl font-bold text-[var(--navy)] font-[family-name:var(--font-playfair)]">
                Cilj radionice
              </h2>
            </div>
            <ul className="space-y-2.5">
              {seminar.goals.map((goal) => (
                <li key={goal} className="flex items-start gap-2.5 text-gray-600 text-sm">
                  <CheckCircle2 size={14} className="text-[var(--gold)] mt-0.5 shrink-0" />
                  {goal}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <ProgramRadionice agenda={seminar.agenda} />

        {/* Registration */}
        {/* Na desktopu izlazi iz max-w-4xl stupca da forma s izračunom ima mjesta za dva stupca. */}
        <section id="prijava" className="mb-20 scroll-mt-24 lg:-mx-16">
          {/* Krugove reže njihov sloj, ne kartica - overflow-hidden ovdje bi pokvario sticky izračun u formi. */}
          <div className="relative bg-[var(--navy)] rounded-2xl px-3 py-10 sm:px-12 sm:py-14 lg:px-10">
            <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
              <div className="absolute top-0 right-0 w-72 h-72 bg-[var(--gold)]/10 rounded-full -translate-y-1/2 translate-x-1/4" />
              <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
            </div>

            <div className="relative text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="h-px w-8 bg-[var(--gold)]" />
                <span className="text-[var(--gold)] text-sm font-medium uppercase tracking-widest">
                  Osigurajte svoje mjesto
                </span>
                <div className="h-px w-8 bg-[var(--gold)]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 font-[family-name:var(--font-playfair)]">
                {odgodeno
                  ? "Edukacija je odgođena"
                  : past
                    ? "Edukacija je održana"
                    : popunjeno
                      ? "Mjesta su popunjena"
                      : "Prijava"}
              </h2>
              {popunjeno && (
                <p className="text-gray-300 text-sm">
                  Sva mjesta na ovoj edukaciji su popunjena. Javite nam se na{" "}
                  <a href={`mailto:${email}`} className="text-[var(--gold)] underline underline-offset-4">
                    {email}
                  </a>{" "}
                  ili pogledajte{" "}
                  <Link href="/edukacije" className="text-[var(--gold)] underline underline-offset-4">
                    ostale edukacije
                  </Link>
                  .
                </p>
              )}
              {past && (
                <p className="text-gray-300 text-sm">
                  {odgodeno
                    ? "Ova edukacija je odgođena, a prijave su trenutno zatvorene. Novi termin objavit ćemo naknadno."
                    : "Prijave za ovu edukaciju više nisu moguće."}{" "}
                  Pogledajte{" "}
                  <Link href="/edukacije" className="text-[var(--gold)] underline underline-offset-4">
                    nadolazeće edukacije
                  </Link>
                  .
                </p>
              )}
              {!past && !popunjeno && seminar.registrationDeadline && (
                <p className="text-gray-300 text-sm">
                  Molimo prijavite sudjelovanje najkasnije do{" "}
                  <strong className="font-bold text-[var(--gold)]">
                    {seminar.registrationDeadline}
                  </strong>
                </p>
              )}
            </div>

            {!past && !popunjeno && (
              <div
                className={`relative max-w-xl mx-auto bg-white rounded-xl p-4 sm:p-8 shadow-xl text-left ${
                  seminar.ponuda ? "lg:max-w-none" : ""
                }`}
              >
                <RegistracijaForm
                  seminarSlug={seminar.slug}
                  seminarTitle={seminar.title}
                  imaPonudu={Boolean(seminar.ponuda)}
                  cijena={seminar.ponuda && (cijena.cijena ?? seminar.ponuda.cijena)}
                  maxPolaznika={Math.min(MAX_POLAZNIKA, slobodno ?? MAX_POLAZNIKA)}
                />
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
