export type Lecturer = {
  name: string;
  role?: string;
  bio: string;
  // position = CSS object-position za izrez na kartici liste (npr. "center 35%")
  photo?: { url: string; alt: string; position?: string };
};

export type AgendaPoint = string | { label: string; subPoints: string[] };

export type AgendaTopic = {
  label?: string; // npr. "Modul 1" - prikazuje se kao oznaka uz naslov, u sans fontu
  title: string;
  points?: AgendaPoint[];
};

export type AgendaItem = {
  time: string;
  topics: AgendaTopic[];
};

export type Seminar = {
  slug: string;
  title: string;
  titleLines?: string[]; // ručni prijelom naslova u prikazu (h1 i kartica); title ostaje za metadata
  kicker: string;
  excerpt: string;
  date: string; // ISO, for sorting
  dateLabel: string;
  time: string;
  location: string;
  locationDetail?: string;
  price: string; // redovna cijena
  priceNote?: string;
  // Niža cijena za prijave zaključno s datumom `do` (po zagrebačkom vremenu).
  ranaPrijava?: {
    do: string;
    doLabel: string;
    price: string;
    cijena: number;
  };
  // Podaci za automatsku ponudu. Bez ovog bloka prijava ne izdaje ponudu (samo interni mail).
  ponuda?: {
    cijena: number; // EUR po polazniku, bez PDV-a
    predavac: string; // kako piše na ponudi, npr. "X dipl.iur. i Y, dipl.iur."
    mjesto: string; // puna adresa održavanja
    ukljuceno: string;
    nazivStavke?: string; // default: `${kicker} – ${title}`
  };
  registrationDeadline?: string;
  description: string[];
  descriptionHighlighted?: boolean; // opis u žutom okviru umjesto običnog teksta
  helpText?: string;
  helpTitle?: string;
  targetAudience?: string[];
  questions?: string[]; // "Prijavite se i saznajte" - prikazuje se umjesto ciljne skupine ako ona nije navedena
  goals: string[];
  agenda: AgendaItem[];
  lecturers: Lecturer[];
  lecturersNote?: { title?: string; text: string }; // žuti okvir ispod biografija predavača
  // Slika na kartici liste. Ako nije zadana, kartica slaže fotografije predavača.
  coverImage?: { url: string; alt: string };
};

// Ista radionica u Zagrebu i Splitu - zajednički sadržaj, termini se razlikuju.
const digitalizacijaProcesa: Omit<
  Seminar,
  "slug" | "date" | "dateLabel" | "location" | "locationDetail" | "ranaPrijava" | "ponuda"
> = {
  title:
    "Manje papira, manje gužve: kako pametno redizajnirati i digitalizirati poslovne procese u JLP(R)S i tijelima javne vlasti",
  titleLines: [
    "Manje papira, manje gužve:",
    "kako pametno redizajnirati i digitalizirati poslovne procese u JLP(R)S i tijelima javne vlasti",
  ],
  kicker: "Praktična radionica",
  excerpt:
    "Radionica o redizajnu i digitalizaciji poslovnih procesa iz perspektive građana i poduzetnika - vlasnici procesa, državna informacijska infrastruktura, nabava IKT rješenja i brza poboljšanja.",
  time: "9.00 - 15.00",
  price: "239,00 EUR",
  priceNote: "Pružatelj nije u sustavu PDV-a.",
  descriptionHighlighted: true,
  description: [
    "Svrha radionice je pomoći lokalnoj i regionalnoj samoupravi, institucijama iz njihove nadležnosti, ali i drugim organizacijama javnog sektora, da svoje usluge i poslovne procese promatraju iz perspektive građana i poduzetnika, smanje administrativno opterećenje, bolje iskoriste postojeću državnu informacijsku infrastrukturu te kvalitetnije pripreme digitalizacijske projekte i nabavu IKT rješenja.",
  ],
  targetAudience: [
    "čelnicima i pročelnicima",
    "voditeljima ustrojstvenih jedinica",
    "službenicima i informatičkoj podršci u JLP(R)S",
    "ustanovama, trgovačkim društvima i drugim pravnim osobama koji žele unaprijediti poslovne procese, razvijati digitalne usluge ili planiraju provedbu digitalnih projekata",
  ],
  goals: [
    "promatrati usluge i poslovne procese iz perspektive građana i poduzetnika",
    "smanjiti administrativno opterećenje korisnika i službenika",
    "bolje iskoristiti postojeću državnu informacijsku infrastrukturu",
    "kvalitetnije pripremiti digitalizacijske projekte i nabavu IKT rješenja",
  ],
  agenda: [
    { time: "9.00 - 9.30", topics: [{ title: "Registracija polaznika i uvodna riječ" }] },
    {
      time: "9.30 - 11.00",
      topics: [
        {
          label: "Prvi blok",
          title: "Razmišljanje izvan odjela i uloga vlasnika procesa (2 × 45 min)",
        },
        {
          title: "1. sat: Vlasnici procesa i dizajn „životnih situacija”",
          points: [
            "zašto redizajn rada moraju voditi pročelnici i voditelji odjela kao vlasnici procesa, a ne IT",
            "razlika između puke tehnološke modernizacije (PDF na webu) i prave e-usluge",
            "dizajn usluge prema korisniku (User Journey) i paradigma životnih situacija umjesto granica upravnih odjela",
            "načelo „samo jednom” (Once-Only Principle) – praktična primjena pravila da se od korisnika ne traže podaci kojima javnopravna tijela već raspolažu ili ih mogu pribaviti službenim putem",
            "praktična vježba",
          ],
        },
        {
          title: "2. sat: Kako iskoristiti postojeću državnu informacijsku infrastrukturu",
          points: [
            "što je državna informacijska infrastruktura (DII) i kako je iskoristiti bez nepotrebnih troškova",
            "osnovne komponente i njihova svrha: NIAS i e-Ovlaštenja, e-Pristojbe, Državna sabirnica (GSB), e-Potpis i e-Pečat, Korisnički pretinac i elektronička dostava dokumenata",
            "Centar dijeljenih usluga (CDU) i zajedničke platforme – mogućnosti dijeljenja infrastrukture i smanjenja troškova razvoja i održavanja",
            "interoperabilnost i što lokalna uprava i ostale organizacije trebaju provjeriti prije pokretanja vlastitog razvoja",
            "najčešće pogrešne pretpostavke: „to moramo sami napraviti”",
            "praktična vježba",
          ],
        },
      ],
    },
    { time: "11.00 - 11.30", topics: [{ title: "Pauza za kavu" }] },
    {
      time: "11.30 - 13.00",
      topics: [
        {
          label: "Drugi blok",
          title:
            "Priprema nabave IKT rješenja i prepoznavanje brzih poboljšanja („quick wins”) (2 × 45 min)",
        },
        {
          title: "3. sat: Kako napisati dobar projektni zadatak za nabavu IKT rješenja",
          points: [
            "razlika između nabave softvera i nabave poslovnog rješenja",
            "kako definirati problem, a ne unaprijed propisani proizvod",
            {
              label: "praktična kontrolna lista za izradu projektnog zadatka:",
              subPoints: [
                "funkcionalni i nefunkcionalni zahtjevi, opis procesa i korisničkih scenarija",
                "integracije, otvorena sučelja, migracija, vlasništvo i izvoz podataka",
                "podrška i ugovor o razini usluge (Service Level Agreement – SLA): vrijeme reakcije i vrijeme otklanjanja problema/kvara, podaci, nadogradnje i održavanje",
                "izlazna strategija i zaštita od ovisnosti o jednom dobavljaču (vendor lock-in), testiranje i prihvat rješenja, ugovorne obveze dobavljača, dokumentacija",
              ],
            },
            "praktična vježba",
          ],
        },
        {
          title: "4. sat: Brza poboljšanja („quick wins”) – identifikacija kradljivaca vremena",
          points: [
            "eliminacija rutine: kako identificirati zadatke koji generiraju najviše telefonskih poziva",
            "izrada matrice prioriteta (učinak vs. provedivost) – odabir mikroprojekata s visokim učinkom za građane i službenike, jednostavnih za provedbu",
            "uvođenje elektroničkih obavijesti o statusu predmeta (e-mail, SMS, Korisnički pretinac) i jednostavnih digitalnih obrazaca gdje je to pravno i operativno moguće",
            "optimizacija internih pravila i obrazaca koji stvaraju nepotrebnu administraciju",
            "praktična vježba",
          ],
        },
      ],
    },
    { time: "13.00 - 13.30", topics: [{ title: "Pauza za kavu / finger food" }] },
    {
      time: "13.30 - 14.30",
      topics: [
        {
          label: "Treći blok",
          title: "Praktična primjena – interaktivni redizajn usluge (60 min)",
          points: [
            "praktična primjena obrađenih načela na primjerima lokalnih usluga i procesa JLP(R)S",
          ],
        },
      ],
    },
    { time: "14.30 - 14.45", topics: [{ title: "Diskusija i odgovori na pitanja" }] },
    {
      time: "14.45 - 15.00",
      topics: [{ title: "Završna riječ i podjela potvrda o sudjelovanju" }],
    },
    { time: "15.00", topics: [{ title: "Završetak radionice" }] },
  ],
  lecturers: [
    {
      name: "Zoran Luša, dipl. oec.",
      role: "stručnjak za digitalne javne usluge, e-upravu i upravljanje podacima; bivši načelnik Samostalnog sektora za digitalizaciju pravosuđa i javne uprave, Ministarstvo pravosuđa i uprave RH",
      bio: "Zoran Luša je stručnjak za digitalizaciju javne uprave, digitalne javne usluge, e-upravu, upravljanje podacima i interoperabilnost. Tijekom više od petnaest godina rada u hrvatskoj javnoj upravi sudjelovao je u razvoju i upravljanju nacionalnim digitalnim sustavima i državnom informacijskom infrastrukturom, uključujući e-Građane, NIAS, Korisnički pretinac, Portal otvorenih podataka, e-Pristojbe, e-Poslovanje te ostalih komponenti državne informacijske infrastrukture. Obnašao je rukovodeće funkcije u Ministarstvu uprave te Ministarstvu pravosuđa i uprave, gdje je vodio poslove na području digitalizacije javnih usluga, pravosuđa i javne uprave, razvoja informacijskih sustava, interoperabilnosti, provedbe EU projekata te izrade i provedbe nacionalnih strategija i planova. Posljednjih pet godina djeluje kao neovisni konzultant na području digitalne transformacije javnog sektora, gdje surađuje s javnim institucijama u Hrvatskoj i regiji. U tom je razdoblju radio, među ostalim, na izradi pojedinih nacionalnih IT politika, projektima upravljanja i otvaranja javnih podataka, analizi i redizajnu poslovnih procesa te pripremi funkcionalnih i tehničkih specifikacija za digitalne sustave i usluge. Sudjelovao je i u projektima digitalizacije javne uprave i pravosuđa te projektima za međunarodne organizacije i javne institucije u regiji. Bavi se analizom poslovnih potreba i procesa, dizajnom digitalnih usluga, funkcionalnim i tehničkim specifikacijama, upravljanjem podacima, otvorenim podacima, interoperabilnošću te pripremom i provedbom digitalizacijskih projekata. Poseban naglasak njegova rada je povezivanje poslovnih potreba javne uprave s tehnološkim mogućnostima – od redizajna poslovnih procesa i dizajna korisničkog iskustva do pripreme kvalitetne nabave i provedbe digitalnih rješenja.",
      photo: { url: "/images/edukacije/lusa.jpg", alt: "Zoran Luša, dipl. oec." },
    },
  ],
};

const digitalizacijaPonuda = {
  cijena: 239,
  predavac: "Zoran Luša, dipl. oec.",
  ukljuceno: "radni materijali, coffee break, finger food, potvrda o sudjelovanju",
};

// Ista radionica u Zagrebu i Splitu - zajednički sadržaj, termini se razlikuju.
const opciAkt: Omit<
  Seminar,
  "slug" | "date" | "dateLabel" | "location" | "locationDetail" | "price" | "ranaPrijava" | "ponuda"
> = {
  title: "Kako izraditi opći akt u JLP(R)S: od pravnog temelja do sudske prakse",
  titleLines: ["Kako izraditi opći akt u JLP(R)S:", "od pravnog temelja do sudske prakse"],
  kicker: "Praktična radionica",
  excerpt:
    "Radionica o izradi općih akata jedinica lokalne i područne (regionalne) samouprave iz kuta onoga tko provjerava njihovu ustavnost i zakonitost - pravni temelj, nadležnost tijela, prijelazne odredbe i sudska praksa.",
  descriptionHighlighted: true,
  time: "9.00 - 15.00",
  priceNote: "Pružatelj nije u sustavu PDV-a.",
  description: [
    "Opći akti jedinica lokalne samouprave sve se češće poništavaju i ukidaju, a svaka pogreška znači novi postupak, izgubljeno vrijeme i pravnu nesigurnost za građane. Cilj radionice je da polaznici nauče izraditi opći akt koji će izdržati provjeru ustavnosti i zakonitosti, i to od pravnog temelja do prijelaznih odredbi. Predavačice će iz rada u sustavu državne uprave i sudske prakse pokazati gdje nastaju najčešće pogreške i kako ih izbjeći.",
    "Na praktičnoj radionici analizirat će se i raspraviti izrada općih akata jedinica lokalne i područne (regionalne) samouprave, i to iz kuta onoga tko provjerava njihovu ustavnost i zakonitost. Kroz konkretne primjere i odluke Visokog upravnog suda i Ustavnog suda obradit će se pravni temelj za donošenje akta, razgraničenje nadležnosti predstavničkog i izvršnog tijela, propisivanje potpora i subvencija te prekršaja i novčanih kazni, zaštita stečenih prava, prijelazne odredbe i povratno djelovanje. Polaznici će moći postaviti pitanja iz vlastite prakse i dobiti konkretne odgovore.",
  ],
  questions: [
    "Kako napraviti zakonit i pravilan akt iz nadležnosti lokalne samouprave?",
    "Koji su najčešći razlozi poništavanja/ukidanja općih akata?",
    "Kako napraviti akt kojim se propisuje dodjela potpora, subvencija, socijalnih potpora i sl.?",
    "Kako aktom propisati prekršaje i novčane kazne?",
    "Kako spriječiti prelijevanje nadležnosti izvršnog i predstavničkog tijela?",
    "Kako formulirati akt da se istim zaštite stečena prava?",
    "Zašto su prijelazne odredbe najvažniji dio propisa i kako ih pravilno propisati?",
    "Što učiniti ako za donošenje akta nema pravnog temelja u važećem zakonodavstvu niti u provedbenim propisima, statutu ili nekom drugom aktu JLP(R)S?",
    "Koje odredbe propisa mogu imati retroaktivnu primjenu i kako to zakonito provesti?",
    "Kako je sudska praksa ocjenjivala ustavnost i zakonitost lokalnih akata?",
  ],
  goals: [
    "samostalno i sigurno izrađivati opće akte koji će izdržati provjeru ustavnosti i zakonitosti",
    "prepoznati ima li akt valjan pravni temelj",
    "pravilno razgraničiti nadležnosti predstavničkog i izvršnog tijela",
    "zaštititi stečena prava te propisati prijelazne odredbe bez pravnih praznina",
    "smanjiti rizik da akt bude poništen ili ukinut u nadzoru ili pred sudom, kako bi jedinica lokalne samouprave dobila akte na koje se građani i službe mogu osloniti",
  ],
  agenda: [
    { time: "9.00 - 9.30", topics: [{ title: "Registracija polaznika i uvodna riječ" }] },
    {
      time: "9.30 - 11.00",
      topics: [
        { label: "Modul 1", title: "Normativni okvir i granice normiranja" },
        {
          title: "Jedinstvena metodološko-nomotehnička pravila",
          points: [
            "Primjena i pravna narav Pravila",
            "Primjenjuju li se na akte JLP(R)S",
            "Zašto su važna u praksi",
          ],
        },
        {
          title: "Tko smije donositi propise, a tko opće akte?",
          points: [
            "Predstavničko i izvršno tijelo",
            "Statut kao temeljni opći akt",
            "Hijerarhija propisa i općih akata",
          ],
        },
        {
          title: "Nadzor ustavnosti i zakonitosti",
          points: [
            "Nadležnost Ustavnog suda Republike Hrvatske",
            "Nadležnost Visokog upravnog suda Republike Hrvatske",
            "Kada i kako akt „pada”",
          ],
        },
        { title: "Praktična vježba", points: ["Koje tijelo donosi ovaj akt?"] },
      ],
    },
    { time: "11.00 - 11.30", topics: [{ title: "Pauza za kavu" }] },
    {
      time: "11.30 - 13.00",
      topics: [
        { label: "Modul 2", title: "Kako napisati zakonit i nomotehnički ispravan akt" },
        {
          title: "Struktura propisa",
          points: ["Uvodni dio", "Glavni dio", "Završne odredbe", "Prilozi i dodaci"],
        },
        { title: "Pravni temelj", points: ["Kako ga pronaći", "Najčešće pogreške"] },
        {
          title: "Stupanje na snagu i početak primjene",
          points: [
            "Razlika između stupanja na snagu i početka primjene",
            "Najčešće pogreške",
          ],
        },
        { title: "Zaštita stečenih prava", points: ["Prijelazne odredbe", "Retroaktivnost"] },
        { title: "Praktična vježba", points: ["Pronađite 10 grešaka u nacrtu akta"] },
      ],
    },
    { time: "13.00 - 13.30", topics: [{ title: "Pauza za kavu" }] },
    {
      time: "13.30 - 14.15",
      topics: [
        { label: "Modul 3", title: "Sudska praksa i najčešće pogreške" },
        { title: "Test ustavnosti i zakonitosti akta" },
        {
          title: "Najčešći razlozi ukidanja općih akata",
          points: [
            "Nedostatak pravnog temelja",
            "Prekoračenje ovlasti",
            "Nenadležni donositelj",
            "Povreda postupka",
            "Nezakonite prijelazne odredbe",
          ],
        },
        {
          title: "Što nas uči praksa Ustavnog suda i Visokog upravnog suda",
          points: ["Analiza konkretnih odluka"],
        },
        {
          title: "Check-lista prije upućivanja akta u proceduru",
          points: ["10 pitanja koja trebamo postaviti prije donošenja akta"],
        },
      ],
    },
    { time: "14.15 - 14.45", topics: [{ title: "Diskusija i odgovori na pitanja" }] },
    {
      time: "14.45 - 15.00",
      topics: [{ title: "Završna riječ i podjela potvrda o sudjelovanju" }],
    },
    { time: "15.00", topics: [{ title: "Završetak radionice" }] },
  ],
  lecturers: [
    {
      name: "Vinkica Duvnjak, dipl.iur",
      role: "zamjenica ravnateljice Ureda za zakonodavstvo Vlade RH",
      bio: "Vinkica Duvnjak zamjenica je ravnateljice Ureda za zakonodavstvo Vlade Republike Hrvatske. Više od dva desetljeća svakodnevno ocjenjuje jesu li propisi usklađeni s Ustavom i pravnim poretkom. Izrađuje mišljenja o usklađenosti prijedloga zakona i drugih propisa, nacrte propisa po nalogu Vlade te očitovanja Vlade u postupcima pred sudovima i Ustavnim sudom. Sudjelovala je u radnim skupinama za izradu brojnih zakona, među kojima su Zakon o lokalnim izborima i Zakon o državnim službenicima. Nomotehnika je njezino uže stručno područje. Ima nastavno naslovno zvanje predavačice za taj predmet i vodi vježbe iz nomotehnike na studiju javne uprave Pravnog fakulteta u Zagrebu. U Državnoj školi za javnu upravu predaje na programima izrade propisa, a nomotehničke smjernice prenosi i službenicima jedinica lokalne i područne (regionalne) samouprave. Sustav lokalne samouprave dobro poznaje i iz rada u Državnoj ispitnoj komisiji.",
      photo: {
        url: "/images/edukacije/duvnjak.jpg",
        alt: "Vinkica Duvnjak, dipl.iur",
        position: "center 32%",
      },
    },
    {
      name: "Aleksandra Jozić-Ileković, dipl.iur.",
      bio: "Aleksandra Jozić-Ileković diplomirana je pravnica s položenim pravosudnim ispitom i 38 godina radnog iskustva, većinom u državnoj upravi. Deset godina radila je u Uredu za zakonodavstvo Vlade Republike Hrvatske kao savjetnica, a zatim kao zamjenica predstojnika. U tom je razdoblju ocjenjivala usklađenost propisa s Ustavom i pravnim poretkom. U Ministarstvu uprave bila je savjetnica ministra, savjetnica specijalistica i viša upravna inspektorica, pa zakonitost akata poznaje i iz kuta onoga tko provodi nadzor. Dvadeset godina ispitivala je i predavala Ustavno pravo i Sustav državne uprave na državnom stručnom ispitu. Objavila je niz stručnih članaka iz ustavnog prava, nomotehnike i normative te je sudjelovala u brojnim radnim skupinama za izradu zakona. Bila je potpredsjednica Državnog izbornog povjerenstva te članica i predsjednica Povjerenstva za sprječavanje sukoba interesa. Rad lokalne samouprave poznaje iznutra, jer je karijeru započela u gradskoj upravi Grada Zagreba.",
      photo: {
        url: "/images/edukacije/jozic-ilekovic.jpg",
        alt: "Aleksandra Jozić-Ileković, dipl.iur.",
        position: "center 45%",
      },
    },
  ],
  lecturersNote: {
    title: "Što radionica donosi",
    text: "Obje predavačice prošle su Ured za zakonodavstvo Vlade, gdje se svakodnevno ocjenjuje ustavnost i zakonitost propisa. Uz to, svaka donosi i vlastito iskustvo: jedna iz izrade propisa i nomotehnike, druga iz upravnog nadzora i ustavnog prava. Polaznici će zato opći akt vidjeti očima onoga tko ga provjerava. Saznat će gdje nastaju najčešće pogreške i kako akt napisati tako da prođe test ustavnosti i zakonitosti.",
  },
};

const opciAktPonuda = {
  predavac: "Vinkica Duvnjak dipl.iur. i Aleksandra Jozić-Ileković, dipl.iur.",
  ukljuceno: "radni materijali, coffee break, potvrda o sudjelovanju",
};

// Ručno dodane edukacije. Nova edukacija: dodati objekt u niz ispod.
// Blok `ponuda` je obavezan za plaćene edukacije - bez njega prijava ne šalje ponudu.
const seminars: Seminar[] = [
  {
    slug: "izvanredni-pravni-lijekovi-u-upravnom-postupku",
    title:
      "Primjena izvanrednih pravnih lijekova u upravnom postupku - pogled na pravnu teoriju i sudsku praksu",
    kicker: "Praktična radionica",
    excerpt:
      "Radionica o dopuštenosti, razlozima i postupku primjene obnove postupka, poništavanja, ukidanja i oglašavanja rješenja ništavim, s naglaskom na sudsku praksu upravnih sudova.",
    date: "2026-09-14",
    dateLabel: "14. rujna 2026.",
    time: "9.30 - 15.00",
    location: "Hotel Antunović, Zagreb",
    locationDetail: "Zagrebačka avenija 100A, Kongresna dvorana Bethoveen B",
    price: "199,00 EUR",
    priceNote: "Pružatelj nije u sustavu PDV-a.",
    ponuda: {
      cijena: 199,
      predavac: "Prof. dr. sc. Dario Đerđa",
      mjesto: "Hotel Antunović, Zagrebačka avenija 100a",
      ukljuceno: "radni materijali, coffee break, potvrda o sudjelovanju",
    },
    description: [
      "Na stručnoj radionici analizirati će se i diskutirati sustav izvanrednih pravnih lijekova u Republici Hrvatskoj. Razmatrat će se učinak primjene izvanrednih pravnih lijekova na pravomoćna rješenja, stečena prava i legitimna očekivanja adresata upravnih akata.",
      "Posebna pozornost posvetiti će se dopuštenosti primjene obnove postupka, poništavanja i ukidanja rješenja te oglašavanja rješenja ništavim. Uz pravno teorijsku analizu pozitivnih propisa poseban naglasak staviti će se na odluke upravnih sudova o dopuštenosti primjene izvanrednih pravnih lijekova, postupku njihove provedbe i pravnoj zaštiti. Stručna radionica uključiti će raspravu i odgovore na pitanja.",
    ],
    helpText:
      "Primjena izvanrednih pravnih lijekova u praksi lokalne samouprave otvara niz složenih pitanja i pravnih dilema. Ova radionica osmišljena je s izrazitim naglaskom na rješavanje konkretnih situacija iz svakodnevnog rada, s kojima se službenici susreću u područjima komunalnog gospodarstva, prostornog uređenja, imovinsko-pravnih odnosa, društvenih djelatnosti, lokalnih poreza, ali i radnih odnosa i svih drugih upravnih postupaka za koje su nadležne jedinice lokalne samouprave.",
    targetAudience: [
      "državnim službenicima",
      "službenicima u jedinicama lokalne i područne samouprave",
      "korporativnim pravnicima",
      "odvjetnicima",
    ],
    goals: [
      "razumjeti razliku između redovitih i izvanrednih pravnih lijekova te kada se koji od njih može primijeniti",
      "prepoznati najčešće pogreške u prvostupanjskim upravnim postupcima JLS-a i znati ih ispraviti prije donošenja rješenja",
      "naučiti kako smanjiti broj uspješnih žalbi kroz kvalitetnije vođenje postupka i obrazlaganje rješenja",
      "upoznati pretpostavke, rokove i tijela nadležna za pojedine izvanredne pravne lijekove (obnova postupka, oglašavanje ništavim, ukidanje i poništavanje po nadzornom pravu, izvanredno ukidanje)",
      "dobiti praktične, primjenjive smjernice za svakodnevni rad, svojevrsan „interni sustav ranog upozorenja” za rizične predmete",
      "dobiti realističan odgovor na pitanje koliko se rizika uopće može ukloniti, a koliko se njime može samo upravljati",
    ],
    agenda: [
      {
        time: "9.30 - 11.00",
        topics: [
          {
            title: "Zaštita prava stranaka u postupcima upravnog odlučivanja",
            points: [
              "Pravomoćnost i pravna sigurnost",
              "Stečena prava i legitimna očekivanja utemeljena na pravomoćnim upravnim aktima",
            ],
          },
          { title: "Izvanredni pravni lijekovi u upravnom postupku" },
          {
            title: "Obnova postupka",
            points: ["Dopuštenost primjene", "Razlozi", "Pokretanje", "Postupak", "Zaštita"],
          },
        ],
      },
      { time: "11.00 - 11.30", topics: [{ title: "Pauza za kavu" }] },
      {
        time: "11.30 - 13.00",
        topics: [
          {
            title: "Poništavanje i ukidanje rješenja",
            points: ["Dopuštenost primjene", "Razlozi", "Pokretanje", "Postupak", "Zaštita"],
          },
          {
            title: "Oglašavanje rješenja ništavim",
            points: ["Dopuštenost primjene", "Razlozi", "Pokretanje", "Postupak", "Zaštita"],
          },
        ],
      },
      { time: "13.00 - 13.30", topics: [{ title: "Pauza za kavu" }] },
      { time: "13.30 - 14.15", topics: [{ title: "Diskusija i odgovori na pitanja" }] },
      {
        time: "14.15 - 14.45",
        topics: [{ title: "Završna riječ i podjela potvrda o sudjelovanju" }],
      },
      { time: "15.00", topics: [{ title: "Kraj radionice" }] },
    ],
    lecturers: [
      {
        name: "Prof. dr. sc. Dario Đerđa",
        role: "Predstojnik Katedre za upravno pravo, Pravni fakultet Sveučilišta u Rijeci",
        bio: "Prof. dr. sc. Dario Đerđa redoviti je profesor u trajnom izboru na Pravnom fakultetu u Rijeci i predstojnik je Katedre za upravno pravo. Od 2023. godine obavlja dužnost dekana na Pravnom fakultetu, a od 2023. godine pomoćnik je rektora Sveučilišta u Rijeci za pravna pitanja. Autor je više od sto znanstvenih i stručnih članaka i poglavlja u knjigama te nekoliko znanstvenih monografija i visokoškolskih udžbenika. Koautor je Komentara Zakona o upravnim sporovima, za koji je dobio priznanje Zaklade dr. sc. Jadranko Crnić, kao najviše nagrade u pravnoj struci u Republici Hrvatskoj, za napisanu knjigu koja je posebno doprinijela razvoju pravne struke. Aktivno je sudjelovao na brojnim uglednim međunarodnim i domaćim konferencijama te je član uredništava nekoliko znanstvenih časopisa. Kao član radnih skupina sudjelovao je u izradi više nacrta prijedloga zakona i drugih propisa, među kojima se posebno ističu Zakon o općem upravnom postupku, Zakon o upravnim sporovima te Zakon o visokom obrazovanju i znanstvenoj djelatnosti.",
        photo: { url: "/images/edukacije/derdja.jpg", alt: "Prof. dr. sc. Dario Đerđa" },
      },
    ],
    coverImage: { url: "/images/edukacije/derdja.jpg", alt: "Prof. dr. sc. Dario Đerđa" },
  },
  {
    ...opciAkt,
    slug: "kako-izraditi-opci-akt-u-jlprs",
    date: "2026-09-28",
    dateLabel: "28. rujna 2026.",
    location: "Hotel Antunović, Zagreb",
    locationDetail: "Kongresni centar, Zagrebačka avenija 100A, dvorana Beethoven",
    price: "199,00 EUR",
    ponuda: { ...opciAktPonuda, cijena: 199, mjesto: "Hotel Antunović, Zagrebačka avenija 100a" },
  },
  {
    ...opciAkt,
    slug: "kako-izraditi-opci-akt-u-jlprs-split",
    date: "2026-10-21",
    dateLabel: "21. listopada 2026.",
    time: "10.00 - 16.00",
    // Split počinje sat kasnije nego Zagreb.
    agenda: opciAkt.agenda.map((item, i) => ({
      ...item,
      time: [
        "10.00 - 10.30",
        "10.30 - 12.00",
        "12.00 - 12.30",
        "12.30 - 14.00",
        "14.00 - 14.30",
        "14.30 - 15.15",
        "15.15 - 15.45",
        "15.45 - 16.00",
        "16.00",
      ][i],
    })),
    location: "Hotel Park, Split",
    locationDetail: "Hatzeov perivoj 3, dvorane Aquarel & Floramy",
    price: "239,00 EUR",
    ranaPrijava: {
      do: "2026-10-13",
      doLabel: "13. listopada 2026.",
      price: "199,00 EUR",
      cijena: 199,
    },
    ponuda: { ...opciAktPonuda, cijena: 239, mjesto: "Hotel Park, Hatzeov perivoj 3, Split" },
  },
  {
    ...digitalizacijaProcesa,
    slug: "digitalizacija-poslovnih-procesa-zagreb",
    date: "2026-10-14",
    dateLabel: "14. listopada 2026.",
    location: "Hotel Antunović, Zagreb",
    locationDetail: "Zagrebačka avenija 100A, dvorana Tomislav",
    price: "199,00 EUR",
    ponuda: { ...digitalizacijaPonuda, cijena: 199, mjesto: "Hotel Antunović, Zagrebačka avenija 100a" },
  },
  {
    ...digitalizacijaProcesa,
    slug: "digitalizacija-poslovnih-procesa-split",
    date: "2026-10-22",
    dateLabel: "22. listopada 2026.",
    time: "10.00 - 16.00",
    // Split počinje sat kasnije nego Zagreb.
    agenda: digitalizacijaProcesa.agenda.map((item, i) => ({
      ...item,
      time: [
        "10.00 - 10.30",
        "10.30 - 12.00",
        "12.00 - 12.30",
        "12.30 - 14.00",
        "14.00 - 14.30",
        "14.30 - 15.30",
        "15.30 - 15.45",
        "15.45 - 16.00",
        "16.00",
      ][i],
    })),
    location: "Hotel Park, Split",
    locationDetail: "Hatzeov perivoj 3, dvorane Aquarel & Floramy",
    ranaPrijava: {
      do: "2026-10-13",
      doLabel: "13. listopada 2026.",
      price: "199,00 EUR",
      cijena: 199,
    },
    ponuda: { ...digitalizacijaPonuda, mjesto: "Hotel Park, Hatzeov perivoj 3, Split" },
  },
];

export async function getSeminars(limit?: number): Promise<Seminar[]> {
  // Najnovija edukacija prva (datum silazno).
  const sorted = [...seminars].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
}

export async function getSeminar(slug: string): Promise<Seminar | null> {
  return seminars.find((seminar) => seminar.slug === slug) ?? null;
}

export async function getSeminarSlugs(): Promise<string[]> {
  return seminars.map((seminar) => seminar.slug);
}

// Prijave se zatvaraju kad edukacija počne (početak iz `time`, npr. "9.00 - 15.00"),
// po zagrebačkom vremenu. Ako se početak ne da pročitati, zatvara se u ponoć na dan održavanja.
export function isSeminarPast(
  seminar: Pick<Seminar, "date" | "time">,
  now = new Date(),
): boolean {
  const match = seminar.time.trim().match(/^(\d{1,2})(?:[.:](\d{2}))?/);
  const startsAt = `${seminar.date} ${(match?.[1] ?? "0").padStart(2, "0")}:${match?.[2] ?? "00"}`;
  return zagrebNow(now) >= startsAt;
}

// Cijena koja vrijedi na zadani trenutak: rana prijava do kraja dana `ranaPrijava.do`, zatim redovna.
export function aktualnaCijena(
  seminar: Pick<Seminar, "price" | "ranaPrijava" | "ponuda">,
  now = new Date(),
): { price: string; cijena?: number; rana: boolean } {
  const rana = seminar.ranaPrijava;
  if (rana && zagrebNow(now).slice(0, 10) <= rana.do) {
    return { price: rana.price, cijena: rana.cijena, rana: true };
  }
  return { price: seminar.price, cijena: seminar.ponuda?.cijena, rana: false };
}

// sv-SE daje "YYYY-MM-DD HH:MM", pa se stringovi mogu uspoređivati izravno.
function zagrebNow(now: Date): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Zagreb",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(now);
}
