export type Lecturer = {
  name: string;
  role: string;
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
  targetAudience: string[];
  goals: string[];
  agenda: AgendaItem[];
  lecturer: Lecturer;
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
    registrationDeadline: "8. rujna 2026.",
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
    lecturer: {
      name: "Prof. dr. sc. Dario Đerđa",
      role: "Predstojnik Katedre za upravno pravo, Pravni fakultet Sveučilišta u Rijeci",
      bio: "Prof. dr. sc. Dario Đerđa redoviti je profesor u trajnom izboru na Pravnom fakultetu u Rijeci i predstojnik je Katedre za upravno pravo. Od 2023. godine obavlja dužnost dekana na Pravnom fakultetu, a od 2023. godine pomoćnik je rektora Sveučilišta u Rijeci za pravna pitanja. Autor je više od sto znanstvenih i stručnih članaka i poglavlja u knjigama te nekoliko znanstvenih monografija i visokoškolskih udžbenika. Koautor je Komentara Zakona o upravnim sporovima, za koji je dobio priznanje Zaklade dr. sc. Jadranko Crnić, kao najviše nagrade u pravnoj struci u Republici Hrvatskoj, za napisanu knjigu koja je posebno doprinijela razvoju pravne struke. Aktivno je sudjelovao na brojnim uglednim međunarodnim i domaćim konferencijama te je član uredništava nekoliko znanstvenih časopisa. Kao član radnih skupina sudjelovao je u izradi više nacrta prijedloga zakona i drugih propisa, među kojima se posebno ističu Zakon o općem upravnom postupku, Zakon o upravnim sporovima te Zakon o visokom obrazovanju i znanstvenoj djelatnosti.",
      photo: { url: "/images/edukacije/derdja.jpg", alt: "Prof. dr. sc. Dario Đerđa" },
    },
    coverImage: { url: "/images/edukacije/derdja.jpg", alt: "Prof. dr. sc. Dario Đerđa" },
  },
];

export async function getSeminars(limit?: number): Promise<Seminar[]> {
  const sorted = [...seminars].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
  return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
}

export async function getSeminar(slug: string): Promise<Seminar | null> {
  return seminars.find((seminar) => seminar.slug === slug) ?? null;
}

export async function getSeminarSlugs(): Promise<string[]> {
  return seminars.map((seminar) => seminar.slug);
}
