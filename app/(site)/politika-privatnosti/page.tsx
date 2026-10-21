import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politika privatnosti - LOCALIS",
  description:
    "Kako LOCALIS prikuplja, koristi i štiti osobne podatke posjetitelja web stranice i polaznika edukacija te informacije o kolačićima.",
  alternates: { canonical: "/politika-privatnosti" },
};

const LAST_UPDATED = "21. listopada 2026.";

const linkClass = "text-[var(--navy)] underline underline-offset-2";

function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    // scroll-mt: sidro (npr. #edukacije iz forme prijave) ne smije završiti ispod fiksnog navbara.
    <section id={id} className="mt-10 scroll-mt-32">
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
            LOCALIS
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
            <strong className="text-[var(--navy)]">Prijava na edukaciju.</strong> Detaljno je
            opisana u sljedećem odjeljku.
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

        <Section id="edukacije" title="3. Prijave na edukacije i radionice">
          <p>
            <strong className="text-[var(--navy)]">Prijava, provedba i naplata.</strong> Prikupljamo
            ime i prezime, e-mail adresu i broj telefona kontakt osobe, naziv, adresu i OIB
            ustanove ili tvrtke, imena i radna mjesta polaznika te napomenu uz prijavu. Podatke
            koristimo za evidenciju prijava i izradu popisa polaznika, izdavanje ponude, računa i
            potvrde o sudjelovanju te komunikaciju s kontakt osobom i polaznicima u vezi s
            organizacijom i provedbom edukacije. Pravna osnova je izvršenje ugovora i ispunjavanje
            zakonskih obveza (čl. 6. st. 1. t. (b) i (c) GDPR-a). Bez tih podataka prijavu nije
            moguće provesti.
          </p>
          <p>
            Osoba koja prijavljuje druge polaznike dužna ih je obavijestiti o tome da nam je
            prijavila njihove podatke i uputiti ih na ovu politiku.
          </p>
          <p>
            <strong className="text-[var(--navy)]">Obavijesti o budućim edukacijama.</strong> Ako
            pri prijavi to zasebno označite, vašu e-mail adresu koristimo za slanje obavijesti o
            budućim radionicama, edukacijama i stručnim sadržajima u našoj organizaciji. Pravna
            osnova je vaša privola (čl. 6. st. 1. t. (a) GDPR-a). Davanje privole je dobrovoljno i
            ne utječe na prijavu. Privolu možete povući u bilo kojem trenutku porukom na{" "}
            <a href="mailto:info@localis.hr" className={linkClass}>
              info@localis.hr
            </a>
            .
          </p>
          <p>
            <strong className="text-[var(--navy)]">Fotografiranje i snimanje.</strong> Tijekom
            radionica fotografiramo i povremeno snimamo te fotografije i snimke objavljujemo na
            našoj web stranici, profilima na društvenim mrežama i u promotivnim materijalima, radi
            izvješćivanja o održanoj edukaciji i promocije naših edukacija. Pravna osnova je privola
            svakog polaznika (čl. 6. st. 1. t. (a) GDPR-a), koju polaznik daje osobno, na licu
            mjesta. Polaznik koji privolu ne da neće biti fotografiran ni sniman, a uskrata ili
            povlačenje privole ni na koji način ne utječe na sudjelovanje na edukaciji. Fotografije
            i snimke ne ustupamo trećim osobama na daljnje korištenje.
          </p>
        </Section>

        <Section title="4. Kolačići">
          <p>
            Ova stranica ne postavlja kolačiće za praćenje, oglašavanje ni analitiku. Jedini
            podatak koji spremamo u vaš preglednik (localStorage) je oznaka da ste zatvorili
            obavijest o kolačićima, kako vam se ne bi prikazivala pri svakom posjetu. Taj
            podatak ne sadrži osobne podatke i možete ga obrisati u postavkama preglednika.
          </p>
          <p>
            Tehnički nužan kolačić za prijavu koristi se isključivo u administratorskom dijelu
            stranice, kojem pristupa samo LOCALIS, i ne postavlja se posjetiteljima.
          </p>
          <p>
            Ako u budućnosti uvedemo kolačiće za koje je potrebna vaša privola, prije toga
            ćemo vas o tome obavijestiti i zatražiti privolu.
          </p>
        </Section>

        <Section title="5. Primatelji podataka">
          <p>
            Vaše podatke ne prodajemo i ne ustupamo trećim osobama u marketinške svrhe. Za rad
            stranice koristimo sljedeće pružatelje usluga, koji podatke obrađuju isključivo po
            našem nalogu:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Vercel Inc. - smještaj web stranice, statistika posjeta i pohrana ponuda</li>
            <li>Neon Inc. - baza podataka u kojoj se čuvaju prijave na edukacije</li>
            <li>Zoho Corporation - e-mail usluga putem koje primamo poruke i prijave</li>
            <li>knjigovodstveni servis - vođenje poslovnih knjiga i obrada računa</li>
          </ul>
          <p>
            Fotografije i snimke s radionica objavljujemo na našim profilima na društvenim mrežama,
            čiji pružatelji (npr. Meta Platforms) s objavljenim sadržajem postupaju prema vlastitim
            pravilima privatnosti.
          </p>
          <p>
            Ako se podaci prenose izvan Europskog gospodarskog prostora, prijenos se temelji na
            odgovarajućim zaštitnim mjerama predviđenim GDPR-om, poput odluke o primjerenosti
            ili standardnih ugovornih klauzula.
          </p>
        </Section>

        <Section title="6. Koliko dugo čuvamo podatke">
          <ul className="list-disc pl-5 space-y-1">
            <li>Upite iz kontakt obrasca - koliko je potrebno za odgovor i daljnju komunikaciju.</li>
            <li>
              Podatke iz prijava na edukacije (popis polaznika, potvrde o sudjelovanju) - pet godina
              od dana održavanja edukacije.
            </li>
            <li>
              Račune i drugu knjigovodstvenu dokumentaciju - u rokovima propisanim poreznim i
              računovodstvenim propisima.
            </li>
            <li>E-mail adresu za obavijesti o edukacijama - do povlačenja privole.</li>
            <li>
              Fotografije i snimke s radionica - do povlačenja privole. Nakon povlačenja uklanjamo ih
              s kanala kojima upravljamo.
            </li>
          </ul>
        </Section>

        <Section title="7. Vaša prava">
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

        <Section title="8. Izmjene politike">
          <p>
            Ovu politiku možemo povremeno ažurirati. Važeća verzija uvijek je objavljena na
            ovoj stranici, uz datum posljednje izmjene.
          </p>
        </Section>
      </div>
    </div>
  );
}
