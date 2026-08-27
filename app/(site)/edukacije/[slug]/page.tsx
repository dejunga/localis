import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, MapPin, Coins, CheckCircle2, Users } from "lucide-react";
import { getSeminar, getSeminarSlugs } from "@/lib/edukacije";
import RegistracijaForm from "./RegistracijaForm";

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

export default async function SeminarPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const seminar = await getSeminar(slug);

  if (!seminar) notFound();

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
            {" — "}
            {seminar.lecturer.role}
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6">
        {/* Info cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 -mt-10 mb-16">
          {infoCards.map(({ icon: Icon, label, value, sub }) => (
            <div
              key={label}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-2"
            >
              <div className="w-9 h-9 bg-[var(--navy)]/8 rounded-lg flex items-center justify-center">
                <Icon size={16} className="text-[var(--navy)]" />
              </div>
              <div>
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">
                  {label}
                </div>
                <div className="text-sm font-semibold text-[var(--navy)]">{value}</div>
                {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mb-20">
          <a
            href="#prijava"
            className="inline-flex items-center px-8 py-3.5 bg-[var(--navy)] text-white font-medium rounded hover:bg-[var(--navy-light)] transition-colors"
          >
            Prijavite se
          </a>
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
          <h2 className="text-xl font-bold text-[var(--navy)] mb-8 font-[family-name:var(--font-playfair)]">
            Program radionice
          </h2>
          <div className="space-y-0 border-l-2 border-gray-100 ml-1.5">
            {seminar.agenda.map((item, i) => (
              <div key={i} className="relative pl-8 pb-8 last:pb-0">
                <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-[var(--gold)]" />
                <div className="text-xs font-semibold text-[var(--gold)] uppercase tracking-wider mb-1">
                  {item.time}
                </div>
                <div className="font-semibold text-[var(--navy)] mb-2">{item.title}</div>
                {item.points && (
                  <ul className="space-y-1">
                    {item.points.map((point) => (
                      <li key={point} className="text-sm text-gray-500 flex items-start gap-2">
                        <span className="text-gray-300">–</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                )}
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
            <div className="relative w-32 h-40 rounded-xl bg-gradient-to-br from-[var(--navy)]/10 to-[var(--navy)]/3 overflow-hidden shrink-0 mx-auto sm:mx-0 flex items-center justify-center">
              {seminar.lecturer.photo ? (
                <Image
                  src={seminar.lecturer.photo.url}
                  alt={seminar.lecturer.photo.alt}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              ) : (
                <span className="text-[var(--navy)]/20 text-4xl font-bold font-[family-name:var(--font-playfair)]">
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
          <h2 className="text-xl font-bold text-[var(--navy)] mb-2 font-[family-name:var(--font-playfair)]">
            Prijava
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            {seminar.registrationDeadline
              ? `Molimo prijavite sudjelovanje najkasnije do ${seminar.registrationDeadline}.`
              : "Popunite prijavnicu ispod, javit ćemo vam se s potvrdom."}
          </p>
          <div className="max-w-xl">
            <RegistracijaForm seminarTitle={seminar.title} />
          </div>
        </section>
      </div>
    </>
  );
}
