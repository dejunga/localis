export type Lecturer = {
  name: string;
  role?: string;
  bio: string;
  photo?: { url: string; alt: string };
};

export type AgendaPoint = string | { label: string; subPoints: string[] };

export type AgendaTopic = {
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
  price: string;
  priceNote?: string;
  registrationDeadline?: string;
  description: string[];
  helpText?: string;
  helpTitle?: string;
  targetAudience?: string[];
  questions?: string[]; // "Prijavite se i saznajte" – prikazuje se umjesto ciljne skupine ako ona nije navedena
  goals: string[];
  agenda: AgendaItem[];
  lecturers: Lecturer[];
  coverImage?: { url: string; alt: string };
};

// Ručno dodane edukacije. Nova edukacija: dodati objekt u niz ispod.
const seminars: Seminar[] = [
  {
    slug: "izvanredni-pravni-lijekovi-u-upravnom-postupku",
    title:
      "Primjena izvanrednih pravnih lijekova u upravnom postupku – pogled na pravnu teoriju i sudsku praksu",
    kicker: "Praktična radionica",
    excerpt:
      "Radionica o dopuštenosti, razlozima i postupku primjene obnove postupka, poništavanja, ukidanja i oglašavanja rješenja ništavim, s naglaskom na sudsku praksu upravnih sudova.",
    date: "2026-09-14",
    dateLabel: "14. rujna 2026.",
    time: "9.30 – 15.00",
    location: "Hotel Antunović, Zagreb",
    locationDetail: "Zagrebačka avenija 100A, Kongresna dvorana Bethoveen B",
    price: "199,00 EUR",
    priceNote: "Pružatelj nije u sustavu PDV-a.",
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
        time: "9.30 – 11.00",
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
      { time: "11.00 – 11.30", topics: [{ title: "Pauza za kavu" }] },
      {
        time: "11.30 – 13.00",
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
      { time: "13.00 – 13.30", topics: [{ title: "Pauza za kavu" }] },
      { time: "13.30 – 14.15", topics: [{ title: "Diskusija i odgovori na pitanja" }] },
      {
        time: "14.15 – 14.45",
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
    slug: "kako-izraditi-opci-akt-u-jlprs",
    title: "Kako izraditi opći akt u JLP(R)S: od pravnog temelja do sudske prakse",
    titleLines: ["Kako izraditi opći akt u JLP(R)S:", "od pravnog temelja do sudske prakse"],
    kicker: "Praktična radionica",
    excerpt:
      "Radionica o izradi općih akata jedinica lokalne i područne (regionalne) samouprave iz kuta onoga tko provjerava njihovu ustavnost i zakonitost – pravni temelj, nadležnost tijela, prijelazne odredbe i sudska praksa.",
    date: "2026-09-28",
    dateLabel: "28. rujna 2026.",
    time: "9.00 – 15.00",
    location: "Hotel Antunović, Zagreb",
    locationDetail: "Kongresni centar, Zagrebačka avenija 100A, dvorana Beethoven",
    price: "199,00 EUR",
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
      { time: "9.00 – 9.30", topics: [{ title: "Registracija polaznika i uvodna riječ" }] },
      {
        time: "9.30 – 11.00",
        topics: [
          { title: "Modul 1: Normativni okvir i granice normiranja" },
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
          { title: "Praktična vježba", points: ["„Koje tijelo donosi ovaj akt?”"] },
        ],
      },
      { time: "11.00 – 11.30", topics: [{ title: "Pauza za kavu" }] },
      {
        time: "11.30 – 13.00",
        topics: [
          { title: "Modul 2: Kako napisati zakonit i nomotehnički ispravan akt" },
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
          { title: "Praktična vježba", points: ["„Pronađite 10 grešaka u nacrtu akta”"] },
        ],
      },
      { time: "13.00 – 13.30", topics: [{ title: "Pauza za kavu" }] },
      {
        time: "13.30 – 14.15",
        topics: [
          { title: "Modul 3: Sudska praksa i najčešće pogreške" },
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
      { time: "14.15 – 14.45", topics: [{ title: "Diskusija i odgovori na pitanja" }] },
      {
        time: "14.45 – 15.00",
        topics: [{ title: "Završna riječ i podjela potvrda o sudjelovanju" }],
      },
      { time: "15.00", topics: [{ title: "Završetak radionice" }] },
    ],
    lecturers: [
      {
        name: "Vinkica Duvnjak, dipl.iur",
        role: "zamjenica ravnateljice Ureda za zakonodavstvo Vlade RH",
        bio: "Vinkica Duvnjak zamjenica je ravnateljice Ureda za zakonodavstvo Vlade Republike Hrvatske. Više od dva desetljeća svakodnevno ocjenjuje jesu li propisi usklađeni s Ustavom i pravnim poretkom. Izrađuje mišljenja o usklađenosti prijedloga zakona i drugih propisa, nacrte propisa po nalogu Vlade te očitovanja Vlade u postupcima pred sudovima i Ustavnim sudom. Sudjelovala je u radnim skupinama za izradu brojnih zakona, među kojima su Zakon o lokalnim izborima i Zakon o državnim službenicima. Nomotehnika je njezino uže stručno područje. Ima nastavno naslovno zvanje predavačice za taj predmet i vodi vježbe iz nomotehnike na studiju javne uprave Pravnog fakulteta u Zagrebu. U Državnoj školi za javnu upravu predaje na programima izrade propisa, a nomotehničke smjernice prenosi i službenicima jedinica lokalne i područne (regionalne) samouprave. Sustav lokalne samouprave dobro poznaje i iz rada u Državnoj ispitnoj komisiji.",
        photo: { url: "/images/edukacije/duvnjak.jpg", alt: "Vinkica Duvnjak, dipl.iur" },
      },
      {
        name: "Aleksandra Jozić-Ileković, dipl.iur.",
        bio: "Aleksandra Jozić-Ileković diplomirana je pravnica s položenim pravosudnim ispitom i 38 godina radnog iskustva, većinom u državnoj upravi. Deset godina radila je u Uredu za zakonodavstvo Vlade Republike Hrvatske kao savjetnica, a zatim kao zamjenica predstojnika. U tom je razdoblju ocjenjivala usklađenost propisa s Ustavom i pravnim poretkom. U Ministarstvu uprave bila je savjetnica ministra, savjetnica specijalistica i viša upravna inspektorica, pa zakonitost akata poznaje i iz kuta onoga tko provodi nadzor. Dvadeset godina ispitivala je i predavala Ustavno pravo i Sustav državne uprave na državnom stručnom ispitu. Objavila je niz stručnih članaka iz ustavnog prava, nomotehnike i normative te je sudjelovala u brojnim radnim skupinama za izradu zakona. Bila je potpredsjednica Državnog izbornog povjerenstva te članica i predsjednica Povjerenstva za sprječavanje sukoba interesa. Rad lokalne samouprave poznaje iznutra, jer je karijeru započela u gradskoj upravi Grada Zagreba.",
        photo: {
          url: "/images/edukacije/jozic-ilekovic.jpg",
          alt: "Aleksandra Jozić-Ileković, dipl.iur.",
        },
      },
    ],
    coverImage: { url: "/images/edukacije/duvnjak.jpg", alt: "Vinkica Duvnjak, dipl.iur" },
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
