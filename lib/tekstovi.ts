import { eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/lib/db";
import { tekstovi } from "@/lib/db/schema";

// redak = jedno polje u retku; tekst = jedan odlomak; odlomci = prazan red počinje novi
// odlomak; popis = svaki redak je jedna stavka.
export type VrstaTeksta = "redak" | "tekst" | "odlomci" | "popis";

type Polje = { kljuc: string; oznaka: string; vrsta: VrstaTeksta; zadano: string };
type Grupa = { id: string; naslov: string; polja: readonly Polje[] };

// Tekstovi koje Marija uređuje u /admin/tekstovi. Ovdje je izvorni tekst: vrijedi dok u bazi
// nema izmjene, a izmjena jednaka izvornom tekstu ili prazna briše se iz baze.
// Novi tekst na stranici = novo polje ovdje + t["kljuc"] u komponenti.
export const GRUPE_TEKSTOVA = [
  {
    id: "pocetna",
    naslov: "Početna",
    polja: [
      {
        kljuc: "pocetna.hero.nadnaslov",
        oznaka: "Vrh stranice: mali zlatni naslov",
        vrsta: "redak",
        zadano: "Savjetovanje i edukacija za lokalnu samoupravu",
      },
      {
        kljuc: "pocetna.hero.naslov",
        oznaka: "Vrh stranice: glavni naslov",
        vrsta: "redak",
        zadano: "Pitanja koja muče struku, konačno na dnevnom redu.",
      },
      {
        kljuc: "pocetna.hero.uvod",
        oznaka: "Vrh stranice: tekst ispod naslova",
        vrsta: "tekst",
        zadano:
          "Osnažujemo one koji svakodnevno vode gradove i općine - uz edukaciju, organizaciju seminara i poslovno savjetovanje prilagođeno vašim potrebama.",
      },
      {
        kljuc: "pocetna.usluge.uvod",
        oznaka: "Naše usluge: uvod",
        vrsta: "tekst",
        zadano:
          "Edukacije i stručni seminari su ono čime se najviše bavimo. Uz njih nudimo savjetovanje, administrativnu podršku i digitalne usluge.",
      },
      {
        kljuc: "pocetna.usluge.obrazovanje",
        oznaka: "Naše usluge: Edukacija i praktične radionice",
        vrsta: "tekst",
        zadano:
          "Prilagođene edukacije za službenike lokalne samouprave i sve koji se u radu susreću s tim temama - od radionica do online tečajeva.",
      },
      {
        kljuc: "pocetna.usluge.seminari",
        oznaka: "Naše usluge: Organizacija seminara i poslovnih događaja",
        vrsta: "tekst",
        zadano:
          "Profesionalna organizacija stručnih skupova i poslovnih događaja, od ideje do zadnjeg detalja na dan događaja.",
      },
      {
        kljuc: "pocetna.usluge.savjetovanje",
        oznaka: "Naše usluge: Poslovno savjetovanje",
        vrsta: "tekst",
        zadano:
          "Stručno savjetovanje u svim fazama poslovanja - od pokretanja obrta do EU fondova i strateškog planiranja.",
      },
      {
        kljuc: "pocetna.usluge.administracija",
        oznaka: "Naše usluge: Uredske i administrativne djelatnosti",
        vrsta: "tekst",
        zadano:
          "Priprema dokumenata, digitalizacija i administrativna podrška koja vam oslobađa vrijeme za ono što radite najbolje.",
      },
      {
        kljuc: "pocetna.usluge.digitalne",
        oznaka: "Naše usluge: Digitalne i podatkovne usluge",
        vrsta: "tekst",
        zadano:
          "Razvoj web stranica, aplikacija i baza podataka te analiza i vizualizacija podataka prilagođena vašim potrebama.",
      },
      {
        kljuc: "pocetna.onama.naslov",
        oznaka: "O nama (na početnoj): naslov",
        vrsta: "redak",
        zadano: "Stručno, ali prije svega praktično",
      },
      {
        kljuc: "pocetna.onama.tekst",
        oznaka: "O nama (na početnoj): tekst",
        vrsta: "odlomci",
        zadano:
          "LOCALIS je osnovan s ciljem da pomogne u rješavanju svakodnevnih izazova s kojima se suočavaju službenici jedinica lokalne samouprave - ali i svi koji se u svom radu susreću s temama iz sustava lokalne samouprave: pravnici, zaposlenici u kadrovskim odjelima, poduzetnici i obrtnici.\n\nTeme koje obrađujemo napokon dolaze na dnevni red - svaku obrađujemo stručno, ali prije svega praktično, tako da polaznici odlaze s konkretnim smjernicama koje mogu odmah primijeniti u svom radu.",
      },
      {
        kljuc: "pocetna.onama.istaknuto",
        oznaka: "O nama (na početnoj): stavke s kvačicom",
        vrsta: "popis",
        zadano: [
          "Teme biramo prema stvarnim potrebama struke, ne prema trendovima",
          "Predavači koji podjednako dobro poznaju teoriju i praksu",
          "Praktične smjernice koje polaznici odmah primjenjuju u radu",
          "Ukorijenjeni u lokalnoj zajednici i posvećeni njenom razvoju",
        ].join("\n"),
      },
      {
        kljuc: "pocetna.predavaci.uvod",
        oznaka: "Predavači (na početnoj): tekst ispod naslova",
        vrsta: "tekst",
        zadano:
          "Stručnjaci iz pravosuđa, državne uprave, sveučilišta i prakse koji o temama govore iz prve ruke.",
      },
    ],
  },
  {
    id: "zajednicko",
    naslov: "Na više stranica",
    polja: [
      {
        kljuc: "tim.citat",
        oznaka: "Citat Milade Sofke (početna i O nama)",
        vrsta: "tekst",
        zadano:
          "Vjerujem da svaka osoba i svaka organizacija ima potencijal za rast. Moja je uloga pomoći im da ga prepoznaju i razviju.",
      },
      {
        kljuc: "cta.naslov",
        oznaka: "Plavi okvir s kontaktom na dnu stranica: naslov",
        vrsta: "redak",
        zadano: "Javite nam se",
      },
      {
        kljuc: "cta.tekst",
        oznaka: "Plavi okvir s kontaktom na dnu stranica: tekst",
        vrsta: "tekst",
        zadano:
          "Ako u svom radu prepoznajete pitanja koja godinama čekaju odgovor, LOCALIS je tu da ih zajedno raspravimo i riješimo.",
      },
    ],
  },
  {
    id: "o-nama",
    naslov: "O nama",
    polja: [
      {
        kljuc: "onama.uvod",
        oznaka: "Vrh stranice: tekst ispod naslova",
        vrsta: "tekst",
        zadano:
          "Osnažujemo one koji svakodnevno vode gradove i općine - edukacijama i savjetovanjem koji polaze od stvarnih pitanja iz prakse.",
      },
      {
        kljuc: "onama.prica.misao",
        oznaka: "Naša priča: veliki naslov",
        vrsta: "redak",
        zadano: "Pitanja koja muče struku, konačno na dnevnom redu.",
      },
      {
        kljuc: "onama.prica.tekst",
        oznaka: "Naša priča: tekst",
        vrsta: "odlomci",
        zadano:
          "LOCALIS je osnovan s ciljem da pomogne u rješavanju svakodnevnih izazova s kojima se u stvarnosti suočavaju službenici jedinica lokalne samouprave i zaposlenici pravnih osoba koje su osnovane za obavljanje poslova od značaja za lokalnu samoupravu - ali i ostali koji se u svakodnevnom radu susreću s temama iz sustava lokalne samouprave: pravnici u javnom i privatnom sektoru, zaposlenici u kadrovskim odjelima, poduzetnici, obrtnici i drugi stručnjaci koji u svom radu primjenjuju pravne propise.\n\nLOCALIS je nastao iz prepoznate potrebe za profesionalnim edukacijskim i savjetodavnim uslugama koje su dostupne i izvan velikih gradskih centara.\n\nZato smo ovdje mi, LOCALIS - zajedno s vama obrađujemo teme koje muče struku i koje napokon dolaze na dnevni red. Svaku temu obrađujemo stručno, ali prije svega praktično - polaznici odlaze s konkretnim smjernicama koje mogu odmah primijeniti u svom radu.",
      },
      {
        kljuc: "onama.radimo.tekst",
        oznaka: "Što radimo: tekst",
        vrsta: "tekst",
        zadano:
          "Polazimo od samog izvora - članka 19. Zakona o lokalnoj i područnoj (regionalnoj) samoupravi - i prolazimo kroz sva područja koja taj zakon stavlja u nadležnost gradova i općina, uključujući i često zapostavljene nadležnosti poput prometa.",
      },
      {
        kljuc: "onama.kome",
        oznaka: "Kome se obraćamo",
        vrsta: "tekst",
        zadano:
          "Program je namijenjen službenicima gradova i općina, ali i zaposlenicima u ustanovama i trgovačkim društvima osnovanima za obavljanje poslova od značaja za lokalnu samoupravu - te svima onima kojima je u poslu potreban pouzdan, ažuran i primjenjiv izvor znanja o pitanjima koja se tiču lokalne samouprave.",
      },
      {
        kljuc: "onama.zasto",
        oznaka: "Zašto LOCALIS",
        vrsta: "tekst",
        zadano:
          "Teme biramo prema stvarnim potrebama struke, a ne prema trenutnim trendovima, i ne bježimo od pitanja koja se godinama zaobilaze. Naši predavači podjednako dobro poznaju teoriju i praksu, pa iz svake radionice polaznici izlaze s jasnim, primjenjivim zaključcima.",
      },
      {
        kljuc: "onama.predavaci",
        oznaka: "Naši predavači: tekst",
        vrsta: "tekst",
        zadano:
          "Radionice i predavanja vode vrhunski iskusni stručnjaci i rukovodeći službenici, dokazani u praktičnom rješavanju problema lokalne samouprave, uz fakultetske profesore koji svoje akademsko znanje pretaču u primjenjiva rješenja. Ta kombinacija prakse i znanosti jamči da svaka edukacija donosi odgovore koji doista vrijede u svakodnevnom radu, a ne teoriju koja ostaje na papiru.",
      },
      {
        kljuc: "onama.vrijednosti.ciljano",
        oznaka: "Naše vrijednosti: Ciljano djelovanje",
        vrsta: "tekst",
        zadano: "Svaki program i savjet prilagođen je vašim specifičnim potrebama i ciljevima.",
      },
      {
        kljuc: "onama.vrijednosti.transparentnost",
        oznaka: "Naše vrijednosti: Transparentnost",
        vrsta: "tekst",
        zadano: "Otvorena komunikacija i jasni dogovori - bez skrivenih troškova ili iznenađenja.",
      },
      {
        kljuc: "onama.vrijednosti.zajednica",
        oznaka: "Naše vrijednosti: Predanost zajednici",
        vrsta: "tekst",
        zadano: "Ukorijenjeni smo u lokalnoj zajednici i posvećeni njenom razvoju.",
      },
    ],
  },
  {
    id: "usluge",
    naslov: "Usluge",
    polja: [
      {
        kljuc: "usluge.uvod",
        oznaka: "Vrh stranice: tekst ispod naslova",
        vrsta: "tekst",
        zadano:
          "Edukacije i stručni seminari za lokalnu samoupravu su ono čime se najviše bavimo. Uz njih nudimo savjetovanje, administrativnu podršku i digitalna rješenja.",
      },
      {
        kljuc: "usluge.obrazovanje.opis",
        oznaka: "Edukacija i praktične radionice: opis",
        vrsta: "tekst",
        zadano:
          "Nudimo prilagođene edukacije za službenike u jedinicama lokalne samouprave i zaposlenike pravnih osoba koje su osnovane za obavljanje poslova od značaja za lokalnu samoupravu. Naše edukacije pružaju akademski profesori i stručnjaci praktičari koji pokrivaju širok spektar tema - od mekih vještina do specifičnih stručnih znanja.",
      },
      {
        kljuc: "usluge.obrazovanje.ukljucuje",
        oznaka: "Edukacija i praktične radionice: što uključuje",
        vrsta: "popis",
        zadano: [
          "Prilagođene edukacije oblikovane prema stvarnim potrebama i specifičnostima svake jedinice",
          "Radionice i interaktivna predavanja o aktualnim temama i zakonodavnim novinama",
          "Analiza postojećeg stanja u praksi i konkretna, praktična rješenja",
          "Edukativni materijali, priručnici i radni listovi za polaznike",
          "Online tečajevi i e-learning moduli",
          "Stručni skupovi, konferencije i okrugli stolovi uz vanjske predavače",
          "Individualno mentorstvo za novoizabrane pročelnike i rukovoditelje",
          "Provjera znanja i potvrde o sudjelovanju",
        ].join("\n"),
      },
      {
        kljuc: "usluge.seminari.opis",
        oznaka: "Organizacija seminara i poslovnih događaja: opis",
        vrsta: "tekst",
        zadano:
          "Brinemo o kompletnoj organizaciji vaših poslovnih događaja. Od ideje do realizacije - logistika, program, predavači, materijali - sve na jednom mjestu.",
      },
      {
        kljuc: "usluge.seminari.ukljucuje",
        oznaka: "Organizacija seminara i poslovnih događaja: što uključuje",
        vrsta: "popis",
        zadano: [
          "Planiranje i koordinacija",
          "Odabir lokacije i tehničke opreme",
          "Organizacija predavača i panela",
          "Marketinška podrška događaju",
          "Post-event izvještaj i analiza",
        ].join("\n"),
      },
      {
        kljuc: "usluge.savjetovanje.opis",
        oznaka: "Poslovno savjetovanje: opis",
        vrsta: "tekst",
        zadano:
          "Stručno savjetovanje u svim fazama poslovanja - od pokretanja obrta ili tvrtke do optimizacije postojećih procesa i dugoročnog strateškog planiranja.",
      },
      {
        kljuc: "usluge.savjetovanje.ukljucuje",
        oznaka: "Poslovno savjetovanje: što uključuje",
        vrsta: "popis",
        zadano: [
          "Analiza poslovanja i preporuke",
          "Izrada poslovnih planova",
          "Podrška pri aplikacijama za EU fondove",
          "Upravljanje projektima",
          "Podrška pri pokretanju djelatnosti",
        ].join("\n"),
      },
      {
        kljuc: "usluge.administracija.opis",
        oznaka: "Uredske i administrativne djelatnosti: opis",
        vrsta: "tekst",
        zadano:
          "Administrativna podrška koja vam oslobađa vrijeme za ono što radite najbolje. Uredna dokumentacija bez stresa.",
      },
      {
        kljuc: "usluge.administracija.ukljucuje",
        oznaka: "Uredske i administrativne djelatnosti: što uključuje",
        vrsta: "popis",
        zadano: [
          "Priprema i uređivanje poslovnih dokumenata prema vašim smjernicama",
          "Prijepis dokumenata iz papirnatog u digitalni oblik",
          "Pisanje pisama, dopisa i sažetaka za internu ili vanjsku komunikaciju",
          "Izrada nacrta ugovora, odluka i drugih poslovnih dokumenata",
          "Digitalizacija postojeće dokumentacije radi lakšeg pretraživanja i pohrane",
          "Formatiranje i priprema e-knjiga i drugih digitalnih publikacija",
        ].join("\n"),
      },
      {
        kljuc: "usluge.digitalne.opis",
        oznaka: "Digitalne i podatkovne usluge: opis",
        vrsta: "tekst",
        zadano:
          "Uz edukacije i savjetovanje za lokalnu samoupravu, LOCALIS nudi i razvoj digitalnih rješenja za treće strane - od jednostavnih web stranica i baza podataka do analize i vizualizacije podataka prilagođene potrebama klijenata.",
      },
      {
        kljuc: "usluge.digitalne.ukljucuje",
        oznaka: "Digitalne i podatkovne usluge: što uključuje",
        vrsta: "popis",
        zadano: [
          "Izrada i razvoj web stranica prilagođenih potrebama klijenta",
          "Razvoj web aplikacija po mjeri",
          "Izrada prijavnih sustava, baza klijenata i internih alata",
          "Optimizacija postojećih baza podataka",
          "Prilagodba, nadogradnja i održavanje postojećih softverskih rješenja",
          "Analiza podataka, izrada izvještaja i interaktivnih dashboarda",
          "Automatizacija ponavljajućih administrativnih procesa",
        ].join("\n"),
      },
    ],
  },
  {
    id: "edukacije",
    naslov: "Edukacije",
    polja: [
      {
        kljuc: "edukacije.uvod",
        oznaka: "Vrh stranice: tekst ispod naslova",
        vrsta: "tekst",
        zadano:
          "Radionice, seminari i predavanja za službenike lokalne samouprave i sve koji se u svom radu susreću s tim temama.",
      },
    ],
  },
  {
    id: "kontakt",
    naslov: "Kontakt",
    polja: [
      {
        kljuc: "kontakt.uvod",
        oznaka: "Vrh stranice: tekst ispod naslova",
        vrsta: "tekst",
        zadano: "Pišite nam ili nazovite. Na poruke odgovaramo u roku od 24 sata.",
      },
      {
        kljuc: "kontakt.obrazac.uvod",
        oznaka: "Obrazac: tekst ispod naslova „Pošaljite poruku”",
        vrsta: "tekst",
        zadano: "Napišite nam pitanje ili što trebate, javit ćemo vam se.",
      },
    ],
  },
] as const satisfies readonly Grupa[];

export type KljucTeksta = (typeof GRUPE_TEKSTOVA)[number]["polja"][number]["kljuc"];
export type Tekstovi = Record<KljucTeksta, string>;

export const SVA_POLJA: readonly Polje[] = (GRUPE_TEKSTOVA as readonly Grupa[]).flatMap((g) => g.polja);
const POLJA_PO_KLJUCU = new Map(SVA_POLJA.map((p) => [p.kljuc, p]));

export const MAX_DULJINA_TEKSTA = 5000;

function zadaniTekstovi(): Tekstovi {
  return Object.fromEntries(SVA_POLJA.map((p) => [p.kljuc, p.zadano])) as Tekstovi;
}

// cache: više komponenti na istoj stranici (npr. CTA i About) dijeli jedan upit po zahtjevu.
export const getTekstovi = cache(async (): Promise<Tekstovi> => {
  const t = zadaniTekstovi();
  try {
    for (const row of await db.select().from(tekstovi)) {
      if (POLJA_PO_KLJUCU.has(row.kljuc)) t[row.kljuc as KljucTeksta] = row.vrijednost;
    }
  } catch (e) {
    // Baza nedostupna (npr. build bez DATABASE_URL) - stranica ide s izvornim tekstom
    // i dohvaća izmjene pri sljedećoj regeneraciji.
    console.error("Tekstovi iz baze nisu dohvaćeni, koristim izvorne.", e);
  }
  return t;
});

// Unos iz forme: \r\n -> \n, bez razmaka na krajevima redaka i bez praznih redova viška.
export function normalizirajTekst(unos: string): string {
  return unos
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((r) => r.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Spremaju se samo stvarne izmjene; prazno ili isto kao izvorno = makni iz baze.
export async function spremiTekstove(unosi: Map<string, string>): Promise<void> {
  await db.transaction(async (tx) => {
    for (const [kljuc, unos] of unosi) {
      const polje = POLJA_PO_KLJUCU.get(kljuc);
      if (!polje) continue;
      const vrijednost = normalizirajTekst(unos);
      if (!vrijednost || vrijednost === polje.zadano) {
        await tx.delete(tekstovi).where(eq(tekstovi.kljuc, kljuc));
      } else {
        await tx
          .insert(tekstovi)
          .values({ kljuc, vrijednost })
          .onConflictDoUpdate({ target: tekstovi.kljuc, set: { vrijednost, updatedAt: new Date() } });
      }
    }
  });
}

export function jeKljucTeksta(kljuc: string): boolean {
  return POLJA_PO_KLJUCU.has(kljuc);
}

// "odlomci": prazan red dijeli odlomke.
export function odlomci(tekst: string): string[] {
  return tekst.split(/\n\s*\n/).map((o) => o.trim()).filter(Boolean);
}

// "popis": svaki neprazni redak je jedna stavka.
export function stavke(tekst: string): string[] {
  return tekst.split("\n").map((s) => s.trim()).filter(Boolean);
}
