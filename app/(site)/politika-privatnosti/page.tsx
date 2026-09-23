import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politika privatnosti – LOCALIS",
  description:
    "Kako LOCALIS prikuplja, koristi i štiti osobne podatke posjetitelja web stranice i polaznika edukacija te informacije o kolačićima.",
  alternates: { canonical: "/politika-privatnosti" },
};

const LAST_UPDATED = "23. rujna 2026.";

const linkClass = "text-[var(--navy)] underline underline-offset-2";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold text-[var(--navy)] font-[family-name:var(--font-playfair)] mb-3">
        {title}
      </h2>
      <div className="space-y-3 text-gray-600 leading-relaxed">{children}</div>
    </section>
  );
}

export default function PolitikaPrivatnostiPage() {
  return (
    <div className="pt-32 pb-20 min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-[var(--navy)] font-[family-name:var(--font-playfair)] mb-3">
          Politika privatnosti
        </h1>
        <p className="text-sm text-gray-500">Posljednja izmjena: {LAST_UPDATED}</p>

        <p className="mt-8 text-gray-600 leading-relaxed">
          Ova politika objašnjava koje osobne podatke prikupljamo putem web stranice
          localis.hr, u koje svrhe ih koristimo i koja prava imate. Osobne podatke
          obrađujemo u skladu s Općom uredbom o zaštiti podataka (GDPR), Zakonom o
          provedbi Opće uredbe o zaštiti podataka i Zakonom o elektroničkim
          komunikacijama.
        </p>

        <Section title="1. Voditelj obrade">
          <p>
            LOCALIS, obrt za savjetovanje i edukaciju, vl. Marija Jungić
            <br />
            Ljudevita Gaja 8, 43290 Grubišno Polje
            <br />
            OIB: 07277793412
            <br />
            E-mail:{" "}
            <a href="mailto:info@localis.hr" className={linkClass}>
              info@localis.hr
            </a>
            , telefon:{" "}
            <a href="tel:+385953135158" className={linkClass}>
              095/313-5158
            </a>
          </p>
        </Section>

        <Section title="2. Koje podatke prikupljamo i zašto">
          <p>
            <strong className="text-[var(--navy)]">Kontakt obrazac.</strong> Ime i prezime,
            e-mail adresa, broj telefona (ako ga navedete) i sadržaj poruke. Podatke koristimo
            isključivo kako bismo odgovorili na vaš upit. Pravna osnova je poduzimanje radnji
            na vaš zahtjev prije sklapanja ugovora i naš legitimni interes da odgovorimo na
            upite (čl. 6. st. 1. t. (b) i (f) GDPR-a).
          </p>
          <p>
            <strong className="text-[var(--navy)]">Prijava na edukaciju.</strong> Ime i prezime
            osobe koja prijavljuje, e-mail adresa, broj telefona, naziv i adresa ustanove ili
            tvrtke, OIB, imena i radna mjesta polaznika te napomena. Podatke koristimo za
            organizaciju edukacije, komunikaciju s polaznicima, izdavanje računa i potvrda o
            sudjelovanju. Pravna osnova je izvršenje ugovora i ispunjavanje zakonskih obveza
            (čl. 6. st. 1. t. (b) i (c) GDPR-a).
          </p>
          <p>
            <strong className="text-[var(--navy)]">Statistika posjeta.</strong> Za praćenje
            posjećenosti i brzine stranice koristimo Vercel Web Analytics i Vercel Speed
            Insights. Ti alati ne koriste kolačiće i ne prikupljaju podatke kojima se može
            utvrditi vaš identitet. Bilježe se samo zbirni podaci poput posjećene stranice,
            vrste uređaja, preglednika i države. Pravna osnova je naš legitimni interes za
            praćenje rada stranice (čl. 6. st. 1. t. (f) GDPR-a).
          </p>
        </Section>

        <Section title="3. Kolačići">
          <p>
            Ova stranica ne postavlja kolačiće za praćenje, oglašavanje ni analitiku. Jedini
            podatak koji spremamo u vaš preglednik (localStorage) je oznaka da ste zatvorili
            obavijest o kolačićima, kako vam se ne bi prikazivala pri svakom posjetu. Taj
            podatak ne sadrži osobne podatke i možete ga obrisati u postavkama preglednika.
          </p>
          <p>
            Ako u budućnosti uvedemo kolačiće za koje je potrebna vaša privola, prije toga
            ćemo vas o tome obavijestiti i zatražiti privolu.
          </p>
        </Section>

        <Section title="4. Primatelji podataka">
          <p>
            Vaše podatke ne prodajemo i ne ustupamo trećim osobama u marketinške svrhe. Za rad
            stranice koristimo sljedeće pružatelje usluga, koji podatke obrađuju isključivo po
            našem nalogu:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Vercel Inc. – smještaj web stranice i statistika posjeta</li>
            <li>Zoho Corporation – e-mail usluga putem koje primamo poruke i prijave</li>
          </ul>
          <p>
            Ako se podaci prenose izvan Europskog gospodarskog prostora, prijenos se temelji na
            odgovarajućim zaštitnim mjerama predviđenim GDPR-om, poput odluke o primjerenosti
            ili standardnih ugovornih klauzula.
          </p>
        </Section>

        <Section title="5. Koliko dugo čuvamo podatke">
          <ul className="list-disc pl-5 space-y-1">
            <li>Upite iz kontakt obrasca – koliko je potrebno za odgovor i daljnju komunikaciju.</li>
            <li>
              Podatke iz prijava na edukacije i račune – u rokovima propisanim poreznim i
              računovodstvenim propisima.
            </li>
          </ul>
        </Section>

        <Section title="6. Vaša prava">
          <p>
            U svakom trenutku možete zatražiti pristup svojim podacima, njihov ispravak ili
            brisanje, ograničenje obrade i prijenos podataka te podnijeti prigovor na obradu.
            Ako se obrada temelji na privoli, možete je povući bez utjecaja na zakonitost
            obrade prije povlačenja. Zahtjev pošaljite na{" "}
            <a href="mailto:info@localis.hr" className={linkClass}>
              info@localis.hr
            </a>
            .
          </p>
          <p>
            Ako smatrate da su vaša prava povrijeđena, možete podnijeti pritužbu Agenciji za
            zaštitu osobnih podataka (AZOP), Selska cesta 136, 10000 Zagreb,{" "}
            <a href="https://azop.hr" target="_blank" rel="noopener noreferrer" className={linkClass}>
              azop.hr
            </a>
            .
          </p>
          <p>Ne provodimo automatizirano donošenje odluka niti izradu profila.</p>
        </Section>

        <Section title="7. Izmjene politike">
          <p>
            Ovu politiku možemo povremeno ažurirati. Važeća verzija uvijek je objavljena na
            ovoj stranici, uz datum posljednje izmjene.
          </p>
        </Section>
      </div>
    </div>
  );
}
