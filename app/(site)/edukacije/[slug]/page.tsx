import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, MapPin, Coins, CheckCircle2, Users } from "lucide-react";
import { getSeminar, getSeminarSlugs } from "@/lib/edukacije";
import RegistracijaForm from "./RegistracijaForm";
import PrijaviSeButton from "./PrijaviSeButton";

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

  if (!seminar) return { title: "Edukacija nije pronađena – LOCALIS" };

  return {
    title: `${seminar.title} – LOCALIS`,
    description: seminar.excerpt,
    alternates: { canonical: `/edukacije/${seminar.slug}` },
    openGraph: {
      type: "article",
      title: seminar.title,
      description: seminar.excerpt,
      images: seminar.coverImage ? [seminar.coverImage.url] : undefined,
    },
  };
}

function toIsoTime(hrTime: string): string {
  const [h, m] = hrTime.trim().split(".");
  return `${h.padStart(2, "0")}:${(m ?? "00").padStart(2, "0")}:00`;
}

export default async function SeminarPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const seminar = await getSeminar(slug);

  if (!seminar) notFound();

  const [startRaw, endRaw] = seminar.time.split("–").map((s) => s.trim());
  const price = Number(seminar.price.replace(/\./g, "").replace(",", ".").replace(/[^0-9.]/g, ""));

  const eventJsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: seminar.title,
    description: seminar.excerpt,
    startDate: `${seminar.date}T${toIsoTime(startRaw)}+02:00`,
    endDate: endRaw ? `${seminar.date}T${toIsoTime(endRaw)}+02:00` : undefined,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: seminar.location,
      address: seminar.locationDetail ?? seminar.location,
    },
    image: seminar.coverImage ? [seminar.coverImage.url] : undefined,
    organizer: {
      "@type": "Organization",
      name: "LOCALIS",
      url: "https://www.localis.hr",
    },
    performer: {
      "@type": "Person",
      name: seminar.lecturer.name,
    },
    offers: {
      "@type": "Offer",
      price: Number.isFinite(price) ? price : undefined,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: `https://www.localis.hr/edukacije/${seminar.slug}`,
    },
  };

  const infoCards = [
    { icon: Calendar, label: "Datum", value: seminar.dateLabel },
    { icon: Clock, label: "Vrijeme", value: seminar.time },
    {
      icon: MapPin,
      label: "Lokacija",
      value: seminar.location,
      sub: seminar.locationDetail,
    },
    { icon: Coins, label: "Kotizacija", value: seminar.price, sub: seminar.priceNote },
  ];

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

          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-10 bg-[var(--gold)]" />
            <span className="text-[var(--gold)] text-sm font-medium uppercase tracking-widest">
              {seminar.kicker}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white font-[family-name:var(--font-playfair)] leading-tight mb-4">
            {seminar.title}
          </h1>

          <p className="text-gray-300">
            <span className="text-white font-medium">{seminar.lecturer.name}</span>
            {", "}
            {seminar.lecturer.role}
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6">
        {/* Info cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 -mt-10 mb-16">
          {infoCards.map(({ icon: Icon, label, value, sub }) => (
            <div
              key={label}
              className="bg-white rounded-xl border border-gray-100 shadow-md p-6 flex flex-col gap-3"
            >
              <div className="w-12 h-12 bg-[var(--navy)]/8 rounded-lg flex items-center justify-center">
                <Icon size={22} className="text-[var(--navy)]" />
              </div>
              <div>
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">
                  {label}
                </div>
                <div className="text-lg font-bold text-[var(--navy)] leading-snug">{value}</div>
                {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mb-20">
          <PrijaviSeButton />
        </div>

        {/* Description */}
        <section className="mb-16">
          <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed space-y-4">
            {seminar.description.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>

          {seminar.helpText && (
            <div className="mt-8 bg-[var(--gold)]/6 border-l-4 border-[var(--gold)] rounded-r-lg p-6">
              <p className="text-gray-700 leading-relaxed">{seminar.helpText}</p>
            </div>
          )}
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          {/* Target audience */}
          <section>
            <div className="flex items-center gap-2.5 mb-5">
              <Users size={18} className="text-[var(--navy)]" />
              <h2 className="text-xl font-bold text-[var(--navy)] font-[family-name:var(--font-playfair)]">
                Kome je namijenjeno
              </h2>
            </div>
            <ul className="space-y-2.5">
              {seminar.targetAudience.map((item) => (
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

        {/* Agenda */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-[var(--navy)] mb-8 font-[family-name:var(--font-playfair)]">
            Program radionice
          </h2>
          <div className="space-y-4">
            {seminar.agenda.map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-gray-100 bg-white shadow-sm p-6 sm:p-7"
              >
                <span className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-full bg-[var(--navy)] text-white text-sm font-semibold w-fit mb-4">
                  {item.time}
                </span>
                <div className="space-y-6">
                  {item.topics.map((topic, ti) => (
                    <div key={ti}>
                      <div className="font-bold text-[var(--navy)] text-lg font-[family-name:var(--font-playfair)] mb-2">
                        {topic.title}
                      </div>
                      {topic.points && (
                        <ul className="space-y-1.5">
                          {topic.points.map((point, pi) =>
                            typeof point === "string" ? (
                              <li
                                key={pi}
                                className="text-sm text-gray-600 flex items-start gap-2"
                              >
                                <span className="text-[var(--gold)] mt-0.5">→</span>
                                {point}
                              </li>
                            ) : (
                              <li key={pi}>
                                <div className="text-sm text-gray-600 flex items-start gap-2">
                                  <span className="text-[var(--gold)] mt-0.5">→</span>
                                  {point.label}
                                </div>
                                <ul className="pl-6 mt-1.5 space-y-1">
                                  {point.subPoints.map((sub) => (
                                    <li
                                      key={sub}
                                      className="text-sm text-gray-500 flex items-start gap-2"
                                    >
                                      <span className="text-gray-300 mt-0.5">–</span>
                                      {sub}
                                    </li>
                                  ))}
                                </ul>
                              </li>
                            ),
                          )}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Lecturer */}
        <section className="mb-20">
          <h2 className="text-xl font-bold text-[var(--navy)] mb-8 font-[family-name:var(--font-playfair)]">
            O predavaču
          </h2>
          <div className="flex flex-col sm:flex-row gap-8 items-start">
            <div className="relative w-44 h-56 rounded-xl bg-gradient-to-br from-[var(--navy)]/10 to-[var(--navy)]/3 overflow-hidden shrink-0 mx-auto sm:mx-0 flex items-center justify-center">
              {seminar.lecturer.photo ? (
                <Image
                  src={seminar.lecturer.photo.url}
                  alt={seminar.lecturer.photo.alt}
                  fill
                  sizes="176px"
                  className="object-cover"
                />
              ) : (
                <span className="text-[var(--navy)]/20 text-5xl font-bold font-[family-name:var(--font-playfair)]">
                  {seminar.lecturer.name.split(" ").find((word) => !word.endsWith("."))?.[0]}
                </span>
              )}
            </div>
            <div>
              <div className="font-bold text-[var(--navy)] text-lg mb-1">
                {seminar.lecturer.name}
              </div>
              <div className="text-[var(--gold)] text-sm font-medium mb-4">
                {seminar.lecturer.role}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{seminar.lecturer.bio}</p>
            </div>
          </div>
        </section>

        {/* Registration */}
        <section id="prijava" className="mb-20 scroll-mt-24">
          <div className="relative bg-[var(--navy)] rounded-2xl overflow-hidden px-6 py-12 sm:px-12 sm:py-14">
            <div className="absolute inset-0 pointer-events-none">
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
                Prijava
              </h2>
              <p className="text-gray-300 text-sm">
                {seminar.registrationDeadline ? (
                  <>
                    Molimo prijavite sudjelovanje najkasnije do{" "}
                    <strong className="font-bold text-[var(--gold)]">
                      {seminar.registrationDeadline}
                    </strong>
                  </>
                ) : (
                  "Popunite prijavnicu ispod, javit ćemo vam se s potvrdom."
                )}
              </p>
            </div>

            <div className="relative max-w-xl mx-auto bg-white rounded-xl p-6 sm:p-8 shadow-xl text-left">
              <RegistracijaForm seminarTitle={seminar.title} />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
