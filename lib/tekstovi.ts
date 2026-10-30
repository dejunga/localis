import { eq } from "drizzle-orm";
import { cache } from "react";
import { db } from "@/lib/db";
import { tekstovi } from "@/lib/db/schema";

// redak = jedno polje u retku; tekst = jedan odlomak; odlomci = prazan red počinje novi
// odlomak; popis = svaki redak je jedna stavka; telefon/email = redak s provjerom oblika.
export type VrstaTeksta = "redak" | "tekst" | "odlomci" | "popis" | "telefon" | "email";

type Polje = { kljuc: string; oznaka: string; vrsta: VrstaTeksta; zadano: string };
type Grupa = { id: string; naslov: string; opis?: string; polja: readonly Polje[] };

// Tekstovi koje Marija uređuje u /admin/tekstovi. Ovdje je izvorni tekst: vrijedi dok u bazi
// nema izmjene, a izmjena jednaka izvornom tekstu ili prazna briše se iz baze.
// Novi tekst na stranici = novo polje ovdje + t["kljuc"] u komponenti.
// Ključeve ne preimenovati - izmjene u bazi vezane su uz njih.
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
        kljuc: "pocetna.hero.sljedeca",
        oznaka: "Vrh stranice: oznaka okvira sa sljedećom edukacijom",
        vrsta: "redak",
        zadano: "Sljedeća edukacija",
      },
      {
        kljuc: "pocetna.hero.sljedeca.gumb",
        oznaka: "Vrh stranice: poveznica u okviru sa sljedećom edukacijom",
        vrsta: "redak",
        zadano: "Program i prijava",
      },
      {
        kljuc: "pocetna.nadolazece.naslov",
        oznaka: "Nadolazeće edukacije: naslov",
        vrsta: "redak",
        zadano: "Nadolazeće edukacije",
      },
      {
        kljuc: "pocetna.nadolazece.sve",
        oznaka: "Nadolazeće edukacije: poveznica desno od naslova",
        vrsta: "redak",
        zadano: "Sve edukacije",
      },
      {
        kljuc: "pocetna.nadolazece.gumb",
        oznaka: "Nadolazeće edukacije: poveznica u svakom retku",
        vrsta: "redak",
        zadano: "Pogledajte program",
      },
      {
        kljuc: "pocetna.usluge.naslov",
        oznaka: "Naše usluge: naslov",
        vrsta: "redak",
        zadano: "Naše usluge",
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
        oznaka: "Naše usluge: kratki opis edukacija i radionica",
        vrsta: "tekst",
        zadano:
          "Prilagođene edukacije za službenike lokalne samouprave i sve koji se u radu susreću s tim temama - od radionica do online tečajeva.",
      },
      {
        kljuc: "pocetna.usluge.seminari",
        oznaka: "Naše usluge: kratki opis organizacije seminara",
        vrsta: "tekst",
        zadano:
          "Profesionalna organizacija stručnih skupova i poslovnih događaja, od ideje do zadnjeg detalja na dan događaja.",
      },
      {
        kljuc: "pocetna.usluge.savjetovanje",
        oznaka: "Naše usluge: kratki opis poslovnog savjetovanja",
        vrsta: "tekst",
        zadano:
          "Stručno savjetovanje u svim fazama poslovanja - od pokretanja obrta do EU fondova i strateškog planiranja.",
      },
      {
        kljuc: "pocetna.usluge.administracija",
        oznaka: "Naše usluge: kratki opis administrativnih djelatnosti",
        vrsta: "tekst",
        zadano:
          "Priprema dokumenata, digitalizacija i administrativna podrška koja vam oslobađa vrijeme za ono što radite najbolje.",
      },
      {
        kljuc: "pocetna.usluge.digitalne",
        oznaka: "Naše usluge: kratki opis digitalnih usluga",
        vrsta: "tekst",
        zadano:
          "Razvoj web stranica, aplikacija i baza podataka te analiza i vizualizacija podataka prilagođena vašim potrebama.",
      },
      {
        kljuc: "pocetna.usluge.gumb",
        oznaka: "Naše usluge: poveznica na dvije velike kartice",
        vrsta: "redak",
        zadano: "Saznajte više",
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
        kljuc: "pocetna.onama.gumb",
        oznaka: "O nama (na početnoj): gumb",
        vrsta: "redak",
        zadano: "Više o nama",
      },
      {
        kljuc: "pocetna.predavaci.naslov",
        oznaka: "Predavači (na početnoj): naslov",
        vrsta: "redak",
        zadano: "Predavači na našim edukacijama",
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
    opis: "Ovi tekstovi stoje na više mjesta - izmjena vrijedi svugdje odjednom.",
    polja: [
      {
        kljuc: "tim.ime",
        oznaka: "Voditeljica ureda: ime i prezime (početna, O nama, Kontakt)",
        vrsta: "redak",
        zadano: "Milada Sofka",
      },
      {
        kljuc: "tim.uloga",
        oznaka: "Voditeljica ureda: funkcija",
        vrsta: "redak",
        zadano: "Voditeljica ureda",
      },
      {
        kljuc: "tim.citat",
        oznaka: "Voditeljica ureda: citat (početna i O nama)",
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
      {
        kljuc: "podnozje.opis",
        oznaka: "Podnožje: rečenica ispod logotipa",
        vrsta: "redak",
        zadano: "Edukacija i savjetovanje za bolji poslovni razvoj.",
      },
    ],
  },
  {
    id: "podaci",
    naslov: "Kontakt i službeni podaci",
    opis:
      "Vrijede na cijeloj stranici: kontakt, podnožje, okvir na dnu stranica, politika privatnosti. Ponude (PDF), e-mailovi i poruke o greškama u obrascima imaju svoje podatke u kodu.",
    polja: [
      {
        kljuc: "kontakt.telefon",
        oznaka: "Telefon (kako se prikazuje, npr. 095/313-5158)",
        vrsta: "telefon",
        zadano: "095/313-5158",
      },
      {
        kljuc: "kontakt.email",
        oznaka: "E-mail",
        vrsta: "email",
        zadano: "info@localis.hr",
      },
      {
        kljuc: "firma.naziv",
        oznaka: "Naziv subjekta",
        vrsta: "redak",
        zadano: "LOCALIS",
      },
      { kljuc: "firma.oib", oznaka: "OIB", vrsta: "redak", zadano: "07277793412" },
      { kljuc: "firma.mb", oznaka: "MB", vrsta: "redak", zadano: "99344858" },
      { kljuc: "firma.iban", oznaka: "IBAN", vrsta: "redak", zadano: "HR2124020061140660868" },
    ],
  },
  {
    id: "o-nama",
    naslov: "O nama",
    polja: [
      { kljuc: "onama.naslov", oznaka: "Vrh stranice: naslov", vrsta: "redak", zadano: "O nama" },
      {
        kljuc: "onama.uvod",
        oznaka: "Vrh stranice: tekst ispod naslova",
        vrsta: "tekst",
        zadano:
          "Osnažujemo one koji svakodnevno vode gradove i općine - edukacijama i savjetovanjem koji polaze od stvarnih pitanja iz prakse.",
      },
      {
        kljuc: "onama.prica.oznaka",
        oznaka: "Naša priča: mala zlatna oznaka",
        vrsta: "redak",
        zadano: "Naša priča",
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
        kljuc: "onama.radimo.naslov",
        oznaka: "Što radimo: naslov",
        vrsta: "redak",
        zadano: "Što radimo",
      },
      {
        kljuc: "onama.radimo.tekst",
        oznaka: "Što radimo: tekst",
        vrsta: "tekst",
        zadano:
          "Polazimo od samog izvora - članka 19. Zakona o lokalnoj i područnoj (regionalnoj) samoupravi - i prolazimo kroz sva područja koja taj zakon stavlja u nadležnost gradova i općina, uključujući i često zapostavljene nadležnosti poput prometa.",
      },
      {
        kljuc: "onama.radimo.podrucja",
        oznaka: "Što radimo: područja (oznake)",
        vrsta: "popis",
        zadano: [
          "Uređenje naselja i stanovanje",
          "Prostorno i urbanističko planiranje",
          "Komunalno gospodarstvo",
          "Predškolski odgoj i osnovno obrazovanje",
          "Socijalna skrb",
          "Primarna zdravstvena zaštita",
          "Kultura i šport",
          "Zaštita potrošača",
          "Zaštita okoliša",
          "Protupožarna i civilna zaštita",
          "Promet",
        ].join("\n"),
      },
      {
        kljuc: "onama.radimo.istaknuto",
        oznaka: "Što radimo: istaknuto područje (prepisati točno kao u popisu iznad; prazno = vraća izvorno)",
        vrsta: "redak",
        zadano: "Komunalno gospodarstvo",
      },
      {
        kljuc: "onama.radimo.napomena",
        oznaka: "Što radimo: sitni tekst ispod područja",
        vrsta: "tekst",
        zadano: "Istaknuto: komunalno gospodarstvo, koje najviše opterećuje svakodnevni rad.",
      },
      {
        kljuc: "onama.kome.naslov",
        oznaka: "Kome se obraćamo: naslov",
        vrsta: "redak",
        zadano: "Kome se obraćamo",
      },
      {
        kljuc: "onama.kome",
        oznaka: "Kome se obraćamo: tekst",
        vrsta: "tekst",
        zadano:
          "Program je namijenjen službenicima gradova i općina, ali i zaposlenicima u ustanovama i trgovačkim društvima osnovanima za obavljanje poslova od značaja za lokalnu samoupravu - te svima onima kojima je u poslu potreban pouzdan, ažuran i primjenjiv izvor znanja o pitanjima koja se tiču lokalne samouprave.",
      },
      {
        kljuc: "onama.zasto.naslov",
        oznaka: "Zašto LOCALIS: naslov",
        vrsta: "redak",
        zadano: "Zašto LOCALIS",
      },
      {
        kljuc: "onama.zasto",
        oznaka: "Zašto LOCALIS: tekst",
        vrsta: "tekst",
        zadano:
          "Teme biramo prema stvarnim potrebama struke, a ne prema trenutnim trendovima, i ne bježimo od pitanja koja se godinama zaobilaze. Naši predavači podjednako dobro poznaju teoriju i praksu, pa iz svake radionice polaznici izlaze s jasnim, primjenjivim zaključcima.",
      },
      {
        kljuc: "onama.predavaci.naslov",
        oznaka: "Naši predavači: naslov",
        vrsta: "redak",
        zadano: "Naši predavači",
      },
      {
        kljuc: "onama.predavaci",
        oznaka: "Naši predavači: tekst",
        vrsta: "tekst",
        zadano:
          "Radionice i predavanja vode vrhunski iskusni stručnjaci i rukovodeći službenici, dokazani u praktičnom rješavanju problema lokalne samouprave, uz fakultetske profesore koji svoje akademsko znanje pretaču u primjenjiva rješenja. Ta kombinacija prakse i znanosti jamči da svaka edukacija donosi odgovore koji doista vrijede u svakodnevnom radu, a ne teoriju koja ostaje na papiru.",
      },
      { kljuc: "onama.tim.naslov", oznaka: "Naš tim: naslov", vrsta: "redak", zadano: "Naš tim" },
      {
        kljuc: "onama.vrijednosti.naslov",
        oznaka: "Naše vrijednosti: naslov",
        vrsta: "redak",
        zadano: "Naše vrijednosti",
      },
      {
        kljuc: "onama.vrijednosti.ciljano.naslov",
        oznaka: "Prva vrijednost: naziv",
        vrsta: "redak",
        zadano: "Ciljano djelovanje",
      },
      {
        kljuc: "onama.vrijednosti.ciljano",
        oznaka: "Prva vrijednost: opis",
        vrsta: "tekst",
        zadano: "Svaki program i savjet prilagođen je vašim specifičnim potrebama i ciljevima.",
      },
      {
        kljuc: "onama.vrijednosti.transparentnost.naslov",
        oznaka: "Druga vrijednost: naziv",
        vrsta: "redak",
        zadano: "Transparentnost",
      },
      {
        kljuc: "onama.vrijednosti.transparentnost",
        oznaka: "Druga vrijednost: opis",
        vrsta: "tekst",
        zadano: "Otvorena komunikacija i jasni dogovori - bez skrivenih troškova ili iznenađenja.",
      },
      {
        kljuc: "onama.vrijednosti.zajednica.naslov",
        oznaka: "Treća vrijednost: naziv",
        vrsta: "redak",
        zadano: "Predanost zajednici",
      },
      {
        kljuc: "onama.vrijednosti.zajednica",
        oznaka: "Treća vrijednost: opis",
        vrsta: "tekst",
        zadano: "Ukorijenjeni smo u lokalnoj zajednici i posvećeni njenom razvoju.",
      },
    ],
  },
  {
    id: "usluge",
    naslov: "Usluge",
    opis: "Nazivi usluga vrijede i na početnoj i u podnožju.",
    polja: [
      { kljuc: "usluge.naslov", oznaka: "Vrh stranice: naslov", vrsta: "redak", zadano: "Usluge" },
      {
        kljuc: "usluge.uvod",
        oznaka: "Vrh stranice: tekst ispod naslova",
        vrsta: "tekst",
        zadano:
          "Edukacije i stručni seminari za lokalnu samoupravu su ono čime se najviše bavimo. Uz njih nudimo savjetovanje, administrativnu podršku i digitalna rješenja.",
      },
      {
        kljuc: "usluge.ukljucuje.oznaka",
        oznaka: "Oznaka iznad popisa kod svake usluge",
        vrsta: "redak",
        zadano: "Što uključuje",
      },
      {
        kljuc: "usluge.ponuda.gumb",
        oznaka: "Poveznica na kontakt kod usluga (osim edukacija)",
        vrsta: "redak",
        zadano: "Zatražite ponudu",
      },
      {
        kljuc: "usluge.obrazovanje.naziv",
        oznaka: "Edukacija i praktične radionice: naziv",
        vrsta: "redak",
        zadano: "Edukacija i praktične radionice",
      },
      {
        kljuc: "usluge.obrazovanje.opis",
        oznaka: "Edukacija i praktične radionice: opis",
        vrsta: "tekst",
        zadano:
          "Nudimo prilagođene edukacije za službenike u jedinicama lokalne samouprave i zaposlenike pravnih osoba koje su osnovane za obavljanje poslova od značaja za lokalnu samoupravu. Naše edukacije pružaju akademski profesori i stručnjaci praktičari koji pokrivaju širok spektar tema - od mekih vještina do specifičnih stručnih znanja.",
      },
      {
        kljuc: "usluge.nadolazece.oznaka",
        oznaka: "Edukacija i praktične radionice: oznaka iznad nadolazećih edukacija",
        vrsta: "redak",
        zadano: "Nadolazeće edukacije",
      },
      {
        kljuc: "usluge.nadolazece.gumb",
        oznaka: "Edukacija i praktične radionice: gumb",
        vrsta: "redak",
        zadano: "Sve edukacije",
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
        kljuc: "usluge.seminari.naziv",
        oznaka: "Organizacija seminara: naziv",
        vrsta: "redak",
        zadano: "Organizacija seminara i poslovnih događaja",
      },
      {
        kljuc: "usluge.seminari.opis",
        oznaka: "Organizacija seminara: opis",
        vrsta: "tekst",
        zadano:
          "Brinemo o kompletnoj organizaciji vaših poslovnih događaja. Od ideje do realizacije - logistika, program, predavači, materijali - sve na jednom mjestu.",
      },
      {
        kljuc: "usluge.seminari.ukljucuje",
        oznaka: "Organizacija seminara: što uključuje",
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
        kljuc: "usluge.savjetovanje.naziv",
        oznaka: "Poslovno savjetovanje: naziv",
        vrsta: "redak",
        zadano: "Poslovno savjetovanje",
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
        kljuc: "usluge.administracija.naziv",
        oznaka: "Uredske i administrativne djelatnosti: naziv",
        vrsta: "redak",
        zadano: "Uredske i administrativne djelatnosti",
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
        kljuc: "usluge.digitalne.naziv",
        oznaka: "Digitalne i podatkovne usluge: naziv",
        vrsta: "redak",
        zadano: "Digitalne i podatkovne usluge",
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
    opis: "Popis edukacija, programi, predavači i cijene uređuju se u kodu.",
    polja: [
      { kljuc: "edukacije.naslov", oznaka: "Vrh stranice: naslov", vrsta: "redak", zadano: "Edukacije" },
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
    opis: "Telefon, e-mail i službeni podaci su gore, u dijelu „Kontakt i službeni podaci”.",
    polja: [
      { kljuc: "kontakt.naslov", oznaka: "Vrh stranice: naslov", vrsta: "redak", zadano: "Kontakt" },
      {
        kljuc: "kontakt.uvod",
        oznaka: "Vrh stranice: tekst ispod naslova",
        vrsta: "tekst",
        zadano: "Pišite nam ili nazovite. Na poruke odgovaramo u roku od 24 sata.",
      },
      {
        kljuc: "kontakt.oznaka.telefon",
        oznaka: "Vrh stranice: oznaka iznad telefona (računalo)",
        vrsta: "redak",
        zadano: "Telefon",
      },
      {
        kljuc: "kontakt.oznaka.email",
        oznaka: "Vrh stranice: oznaka iznad e-maila (računalo)",
        vrsta: "redak",
        zadano: "E-mail",
      },
      {
        kljuc: "kontakt.gumb.nazovi",
        oznaka: "Vrh stranice: gumb za poziv (mobitel)",
        vrsta: "redak",
        zadano: "Nazovi",
      },
      {
        kljuc: "kontakt.gumb.email",
        oznaka: "Vrh stranice: gumb za e-mail (mobitel)",
        vrsta: "redak",
        zadano: "Pošalji e-mail",
      },
      {
        kljuc: "kontakt.edukacije.naslov",
        oznaka: "Okvir s poveznicom na edukacije: naslov",
        vrsta: "redak",
        zadano: "Želite se prijaviti na edukaciju?",
      },
      {
        kljuc: "kontakt.edukacije.tekst",
        oznaka: "Okvir s poveznicom na edukacije: tekst",
        vrsta: "tekst",
        zadano: "Prijava je na stranici svake edukacije, uz automatsku ponudu na e-mail.",
      },
      {
        kljuc: "kontakt.sluzbeni.naslov",
        oznaka: "Službeni podaci: naslov",
        vrsta: "redak",
        zadano: "Službeni podaci",
      },
      {
        kljuc: "kontakt.obrazac.naslov",
        oznaka: "Obrazac: naslov",
        vrsta: "redak",
        zadano: "Pošaljite poruku",
      },
      {
        kljuc: "kontakt.obrazac.uvod",
        oznaka: "Obrazac: tekst ispod naslova",
        vrsta: "tekst",
        zadano: "Napišite nam pitanje ili što trebate, javit ćemo vam se.",
      },
      {
        kljuc: "kontakt.poslano.naslov",
        oznaka: "Nakon slanja poruke: naslov",
        vrsta: "redak",
        zadano: "Poruka je poslana",
      },
      {
        kljuc: "kontakt.poslano.tekst",
        oznaka: "Nakon slanja poruke: tekst",
        vrsta: "tekst",
        zadano: "Javit ćemo vam se u roku od 24 sata.",
      },
    ],
  },
  {
    id: "mail-nakon",
    naslov: "Mail nakon edukacije",
    opis: "Mail s materijalima, upitnikom i nadolazećim edukacijama. Automatska polja: {naziv} naziv edukacije, {datum} datum edukacije, {predavaci} imena predavača, {rok} do kada je upitnik otvoren. E-mail i telefon u potpisu dolaze iz grupe Kontakt.",
    polja: [
      {
        kljuc: "mailNakon.naslov",
        oznaka: "Naslov (subject) maila",
        vrsta: "redak",
        zadano: "Hvala što ste bili s nama: {naziv}",
      },
      {
        kljuc: "mailNakon.uvod",
        oznaka: "Uvod (pozdrav i zahvala)",
        vrsta: "odlomci",
        zadano:
          "Poštovani,\n\nhvala Vam što ste {datum} bili s nama na edukaciji „{naziv}”. Vaša pitanja i primjeri iz prakse učinili su je živom i korisnom.",
      },
      {
        kljuc: "mailNakon.materijali",
        oznaka: "Materijali: tekst (prikazuje se samo kad su materijali uploadani)",
        vrsta: "tekst",
        zadano:
          "Kako smo i obećali, pripremili smo materijale s edukacije. Materijali su autorsko djelo predavača ({predavaci}) i namijenjeni su Vašem osobnom radu - molimo da ih ne umnožavate i ne prosljeđujete bez dopuštenja.",
      },
      {
        kljuc: "mailNakon.materijali.gumb",
        oznaka: "Materijali: gumb",
        vrsta: "redak",
        zadano: "Preuzmi materijale",
      },
      {
        kljuc: "mailNakon.upitnik",
        oznaka: "Upitnik: tekst",
        vrsta: "tekst",
        zadano:
          "Vaše mišljenje nam je važno. Zanima nas što Vam je bilo najkorisnije i koje bi Vas teme zanimale ubuduće. Upitnik je anoniman i traje oko dvije minute.",
      },
      {
        kljuc: "mailNakon.upitnik.gumb",
        oznaka: "Upitnik: gumb",
        vrsta: "redak",
        zadano: "Ispunite upitnik",
      },
      {
        kljuc: "mailNakon.upitnik.rok",
        oznaka: "Upitnik: rok i prosljeđivanje kolegama",
        vrsta: "tekst",
        zadano:
          "Upitnik je otvoren do {rok}. Ako je s Vaše ustanove bilo više polaznika, molimo proslijedite im ovaj mail - svaki polaznik može ispuniti svoj upitnik.",
      },
      {
        kljuc: "mailNakon.qr",
        oznaka: "Upitnik: tekst uz QR kod",
        vrsta: "redak",
        zadano: "ili skenirajte QR kod mobitelom",
      },
      {
        kljuc: "mailNakon.nadolazece.naslov",
        oznaka: "Nadolazeće edukacije: naslov",
        vrsta: "redak",
        zadano: "Što slijedi",
      },
      {
        kljuc: "mailNakon.nadolazece.prijave",
        oznaka: "Nadolazeće edukacije: redak s poveznicom na stranicu",
        vrsta: "redak",
        zadano: "Programi i prijave:",
      },
      {
        kljuc: "mailNakon.zakljucak",
        oznaka: "Zaključak",
        vrsta: "tekst",
        zadano: "Veselimo se ponovnom susretu!",
      },
      {
        kljuc: "mailNakon.potpis",
        oznaka: "Potpis (ispod njega ide e-mail, telefon i web iz grupe Kontakt)",
        vrsta: "tekst",
        zadano: "Srdačan pozdrav,\nLOCALIS – edukacija i savjetovanje",
      },
      {
        kljuc: "mailNakon.odjava",
        oznaka: "Sitni tekst na dnu (odjava)",
        vrsta: "tekst",
        zadano: "Ako ne želite primati ovakve poruke, javite nam odgovorom na ovaj e-mail.",
      },
    ],
  },
] as const satisfies readonly Grupa[];

export type KljucTeksta = (typeof GRUPE_TEKSTOVA)[number]["polja"][number]["kljuc"];
export type Tekstovi = Record<KljucTeksta, string>;

export const SVA_POLJA: readonly Polje[] = (GRUPE_TEKSTOVA as readonly Grupa[]).flatMap((g) => g.polja);
const POLJA_PO_KLJUCU = new Map(SVA_POLJA.map((p) => [p.kljuc, p]));

export const MAX_DULJINA_TEKSTA = 5000;

// Klijentske komponente dobivaju samo svoje tekstove, ne cijeli popis.
export const KLJUCEVI_HERO = [
  "pocetna.hero.nadnaslov",
  "pocetna.hero.naslov",
  "pocetna.hero.uvod",
  "pocetna.hero.sljedeca",
  "pocetna.hero.sljedeca.gumb",
] as const satisfies readonly KljucTeksta[];

export const KLJUCEVI_KONTAKT = [
  "kontakt.naslov",
  "kontakt.uvod",
  "kontakt.oznaka.telefon",
  "kontakt.oznaka.email",
  "kontakt.gumb.nazovi",
  "kontakt.gumb.email",
  "kontakt.edukacije.naslov",
  "kontakt.edukacije.tekst",
  "kontakt.sluzbeni.naslov",
  "kontakt.obrazac.naslov",
  "kontakt.obrazac.uvod",
  "kontakt.poslano.naslov",
  "kontakt.poslano.tekst",
  "kontakt.telefon",
  "kontakt.email",
  "firma.naziv",
  "firma.oib",
  "firma.mb",
  "firma.iban",
  "tim.ime",
  "tim.uloga",
] as const satisfies readonly KljucTeksta[];

export function odaberi<K extends KljucTeksta>(t: Tekstovi, kljucevi: readonly K[]): Pick<Tekstovi, K> {
  return Object.fromEntries(kljucevi.map((k) => [k, t[k]])) as Pick<Tekstovi, K>;
}

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

// Za admin: polja koja su u bazi, tj. razlikuju se od izvornog teksta u kodu.
export async function getIzmijenjeniKljucevi(): Promise<Set<string>> {
  const rows = await db.select({ kljuc: tekstovi.kljuc }).from(tekstovi);
  return new Set(rows.map((r) => r.kljuc));
}

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

// null = unos je ispravan. Prazno je uvijek ispravno (vraća izvorni tekst).
export function greskaUnosa(kljuc: string, unos: string): string | null {
  const polje = POLJA_PO_KLJUCU.get(kljuc);
  const vrijednost = normalizirajTekst(unos);
  if (!polje || !vrijednost) return null;
  if (vrijednost.length > MAX_DULJINA_TEKSTA) {
    return `„${polje.oznaka}”: tekst je predug (najviše ${MAX_DULJINA_TEKSTA} znakova).`;
  }
  if (polje.vrsta === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(vrijednost)) {
    return `„${polje.oznaka}”: e-mail adresa nije ispravna.`;
  }
  if (polje.vrsta === "telefon") {
    const znamenke = vrijednost.replace(/\D/g, "").length;
    if (!/^\+?[\d\s/().-]+$/.test(vrijednost) || znamenke < 6 || znamenke > 15) {
      return `„${polje.oznaka}”: broj smije sadržavati samo znamenke, razmake i znakove + / - ( ).`;
    }
  }
  return null;
}

// Prikaz "095/313-5158" -> "+385953135158" za tel: poveznice. Domaći broj (s vodećom nulom)
// dobiva +385; broj s + ili 00 ostaje međunarodni.
export function telefonZaPoziv(prikaz: string): string {
  const znamenke = prikaz.replace(/\D/g, "");
  if (prikaz.trim().startsWith("+")) return `+${znamenke}`;
  if (znamenke.startsWith("00")) return `+${znamenke.slice(2)}`;
  if (znamenke.startsWith("0")) return `+385${znamenke.slice(1)}`;
  return znamenke;
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

// "{naziv}" -> vrijednost iz `polja`; nepoznato polje ostaje kako je napisano.
export function zamijeniPolja(tekst: string, polja: Record<string, string>): string {
  return tekst.replace(/\{(\w+)\}/g, (cijelo, ime: string) => (Object.hasOwn(polja, ime) ? polja[ime] : cijelo));
}
