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
  // Skriveno sa stranice (lista, detalj, sitemap, prijava). Admin i ponude i dalje vide edukaciju.
  skriveno?: boolean;
  // Odgođeno: ostaje na stranici s oznakom, ali su prijave zatvorene.
  odgodeno?: boolean;
  // Ručni rok upitnika (ISO s offsetom) umjesto kraj + 96 h, npr. za prvo slanje.
  upitnikRokDo?: string;
};

type Opcije = { skrivene?: boolean };

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
      role: "dugogodišnja savjetnica i zamjenica predstojnika Ureda za zakonodavstvo Vlade RH",
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

// Ista radionica u Zagrebu i Rijeci - zajednički sadržaj, termini se razlikuju.
const sluzbenickiOdnosi: Omit<
  Seminar,
  "slug" | "date" | "dateLabel" | "location" | "locationDetail" | "ranaPrijava" | "ponuda"
> = {
  title: "Službenički odnosi u JLP(R)S: preduvjeti zakonitog zapošljavanja",
  titleLines: ["Službenički odnosi u JLP(R)S:", "preduvjeti zakonitog zapošljavanja"],
  kicker: "Praktična radionica",
  excerpt:
    "Radionica o zakonitom prijmu u službu u JLP(R)S - plan prijma, pravilnik o unutarnjem redu, javni natječaj, oglas i sporazum, zajednički službenik i praksa Visokog upravnog suda.",
  time: "10.00 - 16.00",
  price: "219,00 EUR",
  priceNote: "Pružatelj nije u sustavu PDV-a.",
  descriptionHighlighted: true,
  description: [
    "Zakonit prijam u službu počinje mnogo prije raspisivanja natječaja - u odluci o ustrojstvu, planu prijma i pravilniku o unutarnjem redu. Na praktičnoj radionici obradit će se preduvjeti zakonitog zapošljavanja u JLP(R)S, postupak prijma putem javnog natječaja, oglasa i pisanog sporazuma, pravo prednosti po posebnim propisima te zajednički službenik i zajedničko upravno tijelo kao rješenje u slučaju nedostatka stručnog kadra. Kroz praktične vježbe i odluke Visokog upravnog suda polaznici će naučiti prepoznati pogreške prije nego što ih uoči upravna inspekcija.",
  ],
  targetAudience: [
    "pročelnicima i voditeljima ustrojstvenih jedinica",
    "službenicima koji rade na poslovima ljudskih potencijala i kadrovskim poslovima",
    "članovima povjerenstava za provedbu javnog natječaja",
    "službenicima u jedinicama lokalne i područne (regionalne) samouprave",
  ],
  goals: [
    "uskladiti plan prijma i pravilnik o unutarnjem redu s pozitivnopravnim propisima",
    "pravilno provesti javni natječaj, oglas i prijam na temelju pisanog sporazuma",
    "primijeniti pravo prednosti po posebnim propisima",
    "znati kada i kako organizirati zajedničkog službenika ili zajedničko upravno tijelo",
    "smanjiti rizik od nezakonitog prijma i nalaza upravne inspekcije",
  ],
  agenda: [
    { time: "10.00 - 10.30", topics: [{ title: "Registracija polaznika i uvodna riječ" }] },
    {
      time: "10.30 - 12.00",
      topics: [
        {
          label: "Modul 1",
          title: "Plan prijma i Pravilnik o unutarnjem redu: temelj zakonitog prijma",
        },
        { title: "Načelo zakonitosti", points: ["Pozitivna i negativna vezanost"] },
        { title: "Odluka o ustrojstvu i djelokrugu upravnih tijela" },
        {
          title: "Plan prijma u službu",
          points: [
            "Opće odredbe",
            "Prekršajne odredbe",
            "Ustavni zakon o pravima nacionalnih manjina",
          ],
        },
        {
          title: "Pravilnik o unutarnjem redu i Uredba o klasifikaciji radnih mjesta",
          points: [
            "Naziv i opis radnog mjesta: osnovni podaci, opis poslova, opis razine standardnih mjerila",
            "Standardna mjerila: stručno znanje, složenost poslova, samostalnost u radu, suradnja s drugim tijelima i komunikacija sa strankama, odgovornost i utjecaj na donošenje odluka",
            "Kategorije radnih mjesta (I. - IV.) i klasifikacijski rang",
          ],
        },
        {
          title: "Pravilnik o unutarnjem redu i posebni propisi",
          points: [
            "Zakon o komunalnom gospodarstvu",
            "Zakon o poljoprivrednom zemljištu",
            "Pravilnik o uvjetima za obavljanje poslova upravljanja prometom, nadzora i premještanja nepropisno zaustavljenih i parkiranih vozila kada te poslove obavljaju jedinice lokalne samouprave te programu i načinu osposobljavanja službenika",
          ],
        },
        {
          title: "Praktična vježba",
          points: ["„Utvrdite je li Plan prijma u skladu s pozitivnopravnim propisima”"],
        },
      ],
    },
    { time: "12.00 - 12.30", topics: [{ title: "Pauza za kavu / finger food" }] },
    {
      time: "12.30 - 14.00",
      topics: [
        { label: "Modul 2", title: "Postupak prijma: javni natječaj, oglas i sporazum" },
        {
          title:
            "Zakon o službenicima i namještenicima u lokalnoj i područnoj (regionalnoj) samoupravi",
          points: ["Posebne odredbe o namještenicima"],
        },
        {
          title: "Javni natječaj",
          points: ["Izuzetak od primjene", "Opće odredbe", "Prekršajne odredbe"],
        },
        {
          title: "Pravo prednosti po posebnim propisima",
          points: [
            "Zakon o hrvatskim braniteljima iz Domovinskog rata i članovima njihovih obitelji",
            "Zakon o zaštiti vojnih i civilnih invalida rata",
            "Zakon o civilnim stradalnicima iz Domovinskog rata",
            "Zakon o obrani",
          ],
        },
        {
          title:
            "Povjerenstvo za provedbu javnog natječaja i angažiranje vanjskih stručnjaka",
        },
        { title: "Uvjeti i zapreke za prijam u službu" },
        {
          title: "Provjera znanja i sposobnosti kandidata",
          points: [
            "Specifični uvjeti radnog mjesta",
            "Psihološka procjena",
            "Kompetencije Povjerenstva za provedbu natječaja",
            "Angažiranje vanjskih stručnjaka",
          ],
        },
        { title: "Prijam u službu na određeno vrijeme" },
        { title: "Prijam u službu na temelju pisanog sporazuma" },
        {
          title: "Praktična vježba",
          points: [
            "„Provjerite pravilnost javnog natječaja”",
            "„Provjerite sadržaj pisanog sporazuma”",
          ],
        },
      ],
    },
    { time: "14.00 - 14.30", topics: [{ title: "Pauza za kavu" }] },
    {
      time: "14.30 - 15.30",
      topics: [
        {
          label: "Modul 3",
          title:
            "Zajednički službenik i zajedničko upravno tijelo - zakonito rješenje u slučaju nedostatka stručnog kadra JLP(R)S",
        },
        { title: "Praksa Visokog upravnog suda", points: ["Analiza konkretnih odluka"] },
        {
          title: "Praktična analiza sadržaja pravilnika JLP(R)S",
          points: ["„Pronađite pogreške u izvatku iz Pravilnika o unutarnjem redu”"],
        },
        { title: "Check-lista prije raspisivanja natječaja i donošenja rješenja" },
        { title: "Diskusija i odgovori na pitanja" },
      ],
    },
    {
      time: "15.30 - 16.00",
      topics: [{ title: "Završna riječ i podjela potvrda o sudjelovanju" }],
    },
    { time: "16.00", topics: [{ title: "Završetak radionice" }] },
  ],
  lecturers: [
    {
      name: "Vera Sokolović, mag. iur.",
      role: "viša upravna inspektorica Ministarstva pravosuđa, uprave i digitalne transformacije",
      bio: "Vera Sokolović viša je upravna inspektorica Ministarstva pravosuđa, uprave i digitalne transformacije. Njezina se karijera odlikuje iskustvom iz različitih segmenata pravnog sustava - od privatnog odvjetništva i osjetljivog sustava socijalne skrbi, pa sve do trenutačne pozicije više upravne inspektorice. Višegodišnje radno iskustvo u upravnoj inspekciji daje joj jedinstven uvid u stvarno funkcioniranje jedinica lokalne i područne (regionalne) samouprave iznutra. Specijalizirana je za kontrolu zakonitosti iz područja upravne inspekcije. Usmjerena je na prepoznavanje sustavnih nepravilnosti, zaštitu prava građana i unaprjeđenje učinkovitosti jedinica lokalne i područne (regionalne) samouprave.",
      photo: {
        url: "/images/edukacije/sokolovic.jpg",
        alt: "Vera Sokolović, mag. iur.",
        position: "center 25%",
      },
    },
  ],
};

const sluzbenickiOdnosiPonuda = {
  cijena: 219,
  predavac: "Vera Sokolović, mag. iur.",
  ukljuceno: "radni materijali, coffee break, finger food, potvrda o sudjelovanju",
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
    odgodeno: true,
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
    skriveno: true,
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
    odgodeno: true,
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
  {
    slug: "izvlastenje-prakticna-primjena-u-jls",
    // Prva edukacija s upitnikom: mail odlazi s prvim cronom nakon deploya (30.10. u 18 h),
    // pa rok vrijedi 96 h od slanja umjesto od kraja edukacije.
    upitnikRokDo: "2026-11-03T18:00:00+01:00",
    title:
      "Izvlaštenje: praktična primjena u JLS-ovima u svrhu realizacije infrastrukturnih projekata",
    titleLines: [
      "Izvlaštenje:",
      "praktična primjena u JLS-ovima u svrhu realizacije infrastrukturnih projekata",
    ],
    kicker: "Praktična radionica",
    excerpt:
      "Radionica o izvlaštenju korak po korak - pretpostavke i priprema projekta, upravni postupak, određivanje naknade, pravna zaštita i sudska praksa.",
    date: "2026-10-28",
    dateLabel: "28. listopada 2026.",
    time: "9.30 - 15.30",
    location: "Hotel Antunović, Zagreb",
    locationDetail: "Zagrebačka avenija 100A, dvorana Tomislav",
    price: "219,00 EUR",
    priceNote: "Pružatelj nije u sustavu PDV-a.",
    ranaPrijava: {
      do: "2026-10-20",
      doLabel: "20. listopada 2026.",
      price: "199,00 EUR",
      cijena: 199,
    },
    ponuda: {
      cijena: 219,
      predavac: "Tihomir Kvakarić, dipl. iur.",
      mjesto: "Hotel Antunović, Zagrebačka avenija 100a",
      ukljuceno: "radni materijali, coffee break, snack, potvrda o sudjelovanju",
    },
    descriptionHighlighted: true,
    description: [
      "Infrastrukturni projekti jedinica lokalne samouprave često zapnu na neriješenim imovinsko-pravnim odnosima. Na praktičnoj radionici obradit će se izvlaštenje od pravnog okvira i pripreme projekta, preko upravnog postupka i određivanja naknade, do pravne zaštite i sudske prakse. Polaznici će kroz praktične vježbe provjeriti je li projekt spreman za izvlaštenje i sastaviti prijedlog za izvlaštenje.",
    ],
    targetAudience: [
      "službenicima u jedinicama lokalne i područne (regionalne) samouprave",
      "službenicima koji rješavaju imovinsko-pravne odnose",
      "korisnicima izvlaštenja i investitorima infrastrukturnih projekata",
      "pravnicima i odvjetnicima",
    ],
    goals: [
      "prepoznati pretpostavke za izvlaštenje i provjeriti je li projekt spreman za pokretanje postupka",
      "pravilno pripremiti i podnijeti prijedlog za izvlaštenje",
      "voditi pokušaj sporazumnog rješavanja i sklapati nagodbe s vlasnicima nekretnina",
      "razumjeti određivanje naknade i provedbu rješenja o izvlaštenju",
      "izbjeći najčešće pogreške koje usporavaju infrastrukturne projekte",
    ],
    agenda: [
      { time: "9.30 - 10.00", topics: [{ title: "Registracija polaznika i uvodna riječ" }] },
      {
        time: "10.00 - 11.30",
        topics: [
          { label: "Modul 1", title: "Pravni okvir izvlaštenja i priprema postupka" },
          {
            title: "Izvlaštenje kao iznimka od jamstva vlasništva",
            points: [
              "Ustavna i konvencijska zaštita prava vlasništva",
              "Povijesni prikaz instituta izvlaštenja",
              "Zakon o izvlaštenju i određivanju naknade i posebni zakoni",
              "Zašto i kada upravni postupak izvlaštenja",
            ],
          },
          {
            title: "Osnovne odredbe o izvlaštenju",
            points: ["Predmet i korisnik izvlaštenja", "Vrste i svrha izvlaštenja"],
          },
          {
            title: "Pretpostavke za izvlaštenje",
            points: [
              {
                label: "Utvrđen interes Republike Hrvatske",
                subPoints: [
                  "kada je propisan posebnim zakonom",
                  "kada je potrebno zasebno utvrđivanje i kako ga pokrenuti",
                ],
              },
              "Pravomoćna lokacijska dozvola",
            ],
          },
          {
            title: "Posebni oblici izvlaštenja",
            points: [
              "Privremeno uzimanje u posjed susjednog zemljišta",
              "Izvlaštenje preostalog dijela nekretnine",
            ],
          },
          {
            title: "Priprema projekta prije pokretanja postupka",
            points: [
              "Prostorni plan, akt za građenje i parcelacijski elaborat",
              "Usklađenost zemljišne knjige i katastra",
              "Osiguranje sredstava za naknadu",
            ],
          },
          {
            title: "Pripremne radnje u svrhu izvlaštenja",
            points: ["Svrha obavljanja pripremnih radnji", "Nadležnost rješavanja i naknada"],
          },
          { title: "Praktična vježba", points: ["„Je li naš projekt spreman za izvlaštenje?”"] },
        ],
      },
      { time: "11.30 - 12.00", topics: [{ title: "Pauza za kavu" }] },
      {
        time: "12.00 - 13.30",
        topics: [
          { label: "Modul 2", title: "Upravni postupak izvlaštenja korak po korak" },
          {
            title: "Osiguranje dokaza o stanju i vrijednosti nekretnine",
            points: ["Nadležno tijelo za rješavanje i postupak", "Procjembeni elaborat"],
          },
          {
            title: "Pokušaj sporazumnog rješavanja",
            points: [
              "Ponuda vlasniku - sadržaj, rokovi i dostava",
              "Sporazum o naknadi i njegovi pravni učinci",
            ],
          },
          {
            title: "Prijedlog za izvlaštenje",
            points: [
              "Obvezni sadržaj i prilozi prijedloga",
              "Najčešći razlozi vraćanja i odbacivanja prijedloga",
            ],
          },
          {
            title: "Postupak izvlaštenja",
            points: [
              "Odlučivanje o prijedlogu",
              "Nagodba i njezini pravni učinci",
              "Privremeno rješenje o izvlaštenju i njegovi pravni učinci",
            ],
          },
          {
            title: "Posebne situacije u praksi",
            points: [
              "Nepoznati i nedostupni vlasnici, ostavinski postupci, suvlasništvo",
              "Zahtjev za izvlaštenjem preostalog dijela nekretnine",
            ],
          },
          {
            title: "Rješenje o izvlaštenju i provedba",
            points: [
              "Stupanje u posjed izvlaštene nekretnine",
              "Isplata ili polog naknade",
              "Upis u zemljišnu knjigu",
              "Poništenje pravomoćnog rješenja",
            ],
          },
          {
            title: "Određivanje naknade",
            points: [
              "Procjembeni elaborat i tržišna vrijednost nekretnine",
              "Naknada u novcu ili zamjenskoj nekretnini",
            ],
          },
          {
            title: "Praktična vježba",
            points: ["„Sastavimo prijedlog za izvlaštenje” - rad na obrascima"],
          },
        ],
      },
      { time: "13.30 - 14.00", topics: [{ title: "Pauza za kavu i snack" }] },
      {
        time: "14.00 - 14.50",
        topics: [
          { label: "Modul 3", title: "Pravna zaštita i sudska praksa" },
          {
            title: "Žalba i upravni spor",
            points: [
              "Žalba i ovlasti drugostupanjskog tijela",
              "Upravni spor i ovlasti upravnih sudova",
            ],
          },
          {
            title: "Sudska praksa",
            points: [
              "Praksa upravnih sudova Republike Hrvatske",
              "Praksa Visokog upravnog suda Republike Hrvatske",
              "Stajališta Ustavnog suda Republike Hrvatske",
              "Praksa Europskog suda za ljudska prava - pravična ravnoteža i primjerena naknada",
              "Najčešće pogreške JLS-ova koje usporavaju infrastrukturne projekte",
            ],
          },
        ],
      },
      { time: "14.50 - 15.20", topics: [{ title: "Diskusija i odgovori na pitanja" }] },
      {
        time: "15.20 - 15.30",
        topics: [{ title: "Završna riječ i podjela potvrda o sudjelovanju" }],
      },
      { time: "15.30", topics: [{ title: "Završetak radionice" }] },
    ],
    lecturers: [
      {
        name: "Tihomir Kvakarić, dipl. iur.",
        role: "stručnjak za rješavanje imovinsko-pravnih odnosa, bivši predstojnik Ureda državne uprave i bivši pročelnik za opću upravu i imovinska prava Koprivničko-križevačke županije",
        bio: "Tihomir Kvakarić je stručnjak za rješavanje imovinsko-pravnih odnosa. Tijekom svog radnog vijeka preko 25 godina rada proveo je na rješavanju imovinsko-pravnih odnosa, prvenstveno upravnih postupaka izvlaštenja. Nakon što je položio državni stručni ispit za imovinsko-pravnog referenta odnosno ispit za rješavanje postupaka izvlaštenja i denacionalizacije, radeći najprije kao službenik, a zatim i kao dugogodišnji voditelj Odjela za imovinsko-pravne poslove, predstojnik Ureda državne uprave i pročelnik za opću upravu i imovinska prava, rješavao je najsloženije prvostupanjske upravne postupke izvlaštenja. Kao najvažnije projekte koje je proveo u postupku izvlaštenja ističe izgradnju magistralnog plinovoda za potrebe investitora INA d.d., izgradnju brze ceste Križevci - Kloštar Vojakovački investitora Hrvatske ceste d.o.o., rekonstrukciju postojećeg i izgradnju drugog kolosijeka željezničke pruge Križevci - Koprivnica - mađarska granica za investitora HŽ Infrastruktura d.o.o., te niz drugih manjih projekata za potrebe raznih korisnika izvlaštenja. Tijekom svog rada na postupcima izvlaštenja isticao se pregovaračkim sposobnostima te je sklopio nekoliko stotina nagodbi između korisnika izvlaštenja i vlasnika nekretnina.",
        photo: {
          url: "/images/edukacije/kvakaric.jpg",
          alt: "Tihomir Kvakarić, dipl. iur.",
          position: "center 30%",
        },
      },
    ],
  },
  {
    ...sluzbenickiOdnosi,
    slug: "sluzbenicki-odnosi-preduvjeti-zakonitog-zaposljavanja",
    date: "2026-11-09",
    dateLabel: "9. studenoga 2026.",
    location: "Hotel Antunović, Zagreb",
    locationDetail: "Zagrebačka avenija 100A, dvorana Tomislav",
    ranaPrijava: {
      do: "2026-11-02",
      doLabel: "2. studenoga 2026.",
      price: "199,00 EUR",
      cijena: 199,
    },
    ponuda: { ...sluzbenickiOdnosiPonuda, mjesto: "Hotel Antunović, Zagrebačka avenija 100a" },
  },
  {
    ...sluzbenickiOdnosi,
    slug: "sluzbenicki-odnosi-preduvjeti-zakonitog-zaposljavanja-rijeka",
    date: "2026-11-30",
    dateLabel: "30. studenoga 2026.",
    time: "11.00 - 17.00",
    // Rijeka počinje sat kasnije nego Zagreb.
    agenda: sluzbenickiOdnosi.agenda.map((item, i) => ({
      ...item,
      time: [
        "11.00 - 11.30",
        "11.30 - 13.00",
        "13.00 - 13.30",
        "13.30 - 15.00",
        "15.00 - 15.30",
        "15.30 - 16.30",
        "16.30 - 17.00",
        "17.00",
      ][i],
    })),
    location: "Hotel Bonavia, Rijeka",
    locationDetail: "Dolac 4, dvorana Karolina",
    ranaPrijava: {
      do: "2026-11-23",
      doLabel: "23. studenoga 2026.",
      price: "199,00 EUR",
      cijena: 199,
    },
    ponuda: { ...sluzbenickiOdnosiPonuda, mjesto: "Hotel Bonavia, Dolac 4, Rijeka" },
  },
  {
    slug: "stegovna-odgovornost-u-jlprs-i-drzavnoj-sluzbi",
    title:
      "Stegovna odgovornost u JLP(R)S i državnoj službi: od povrede službene dužnosti do izvršenja odluke",
    titleLines: [
      "Stegovna odgovornost u JLP(R)S i državnoj službi:",
      "od povrede službene dužnosti do izvršenja odluke",
    ],
    kicker: "Praktična radionica",
    excerpt:
      "Praktična radionica o stegovnoj odgovornosti službenika u JLP(R)S i državnoj službi - od povrede službene dužnosti do izvršenja odluke. Predavač: Ivan Poljak, sudac Službeničkog suda. Zagreb, 19. 11. 2026.",
    date: "2026-11-19",
    dateLabel: "19. studenoga 2026.",
    time: "9.30 - 15.00",
    location: "Hotel Antunović, Zagreb",
    locationDetail: "Zagrebačka avenija 100A, dvorana Tomislav",
    price: "219,00 EUR",
    priceNote: "Pružatelj nije u sustavu PDV-a.",
    ranaPrijava: {
      do: "2026-11-11",
      doLabel: "11. studenoga 2026.",
      price: "199,00 EUR",
      cijena: 199,
    },
    ponuda: {
      cijena: 219,
      predavac: "Ivan Poljak, dipl. iur.",
      mjesto: "Hotel Antunović, Zagrebačka avenija 100a",
      ukljuceno: "radni materijali, coffee break, finger food, potvrda o sudjelovanju",
    },
    descriptionHighlighted: true,
    description: [
      "Prava i dužnosti službenika te stegovne povrede otvaraju u praksi državnih tijela i JLP(R)S niz složenih pravnih dilema - od pravilne kvalifikacije povrede do izvršenja odluke. Na radionici prolazimo cijeli stegovni postupak, uspoređujući uređenje za državne i lokalne službenike, uz odluke službeničkih i upravnih sudova te Ustavnog suda RH. Naglasak je na konkretnim situacijama iz svakodnevnog rada osoba koje pokreću, vode i odlučuju u stegovnim postupcima, uz raspravu i odgovore na vaša pitanja.",
    ],
    targetAudience: [
      "izvršnim čelnicima JLP(R)S, pročelnicima te osobama ovlaštenima u njihovo ime pokretati i/ili voditi stegovne postupke",
      "čelnicima državnih tijela i osobama koje su odlukom čelnika ovlaštene pokretati i/ili voditi stegovne postupke",
      "službenicima u JLP(R)S i državnoj upravi",
      "sucima, članovima vijeća i tajnicima službeničkih sudova ustanovljenih u JLP(R)S",
      "odvjetnicima",
    ],
    goals: [
      "naučiti prepoznati postupanja (činjenja i propuste) koja u sebi sadrže bit službeničke stegovne povrede",
      "razumjeti razliku između lakih i teških povreda službene dužnosti te između pojedinih povreda",
      "prepoznati dobre prakse i najčešće pogreške u pokretanju, zastupanju, vođenju i odlučivanju u stegovnim postupcima",
      "dobiti stručne i praktično primjenjive smjernice za buduće postupanje",
    ],
    agenda: [
      {
        time: "9.00 - 9.30",
        topics: [{ title: "Registracija sudionika, kava i snack" }],
      },
      {
        time: "9.30 - 11.00",
        topics: [
          { label: "Modul 1", title: "Uvod i stegovne povrede" },
          {
            title: "Normativnopravni okvir",
            points: [
              "Zakon o državnim službenicima, Zakon o službenicima i namještenicima u lokalnoj i područnoj (regionalnoj) samoupravi, Zakon o općem upravnom postupku (načela i konkretne odredbe) i drugi relevantni propisi",
              "vremensko i stvarno važenje zakona (završne i prijelazne odredbe)",
              "pravna znanost te upravna, sudska i ustavnosudska praksa u stegovnim postupcima",
            ],
          },
          {
            title: "Lake i teške povrede službene dužnosti državnih i lokalnih službenika",
            points: [
              "normativni opis - sadržaj i eventualni nedostaci",
              "usporedba uređenja stegovnih povreda za državne i lokalne službenike",
              "prepoznavanje konkretnih postupanja kao stegovnih povreda",
              "od činjeničnog opisa do pravne kvalifikacije: kako postupanje opisati i podvesti pod propisanu stegovnu povredu",
              "analiza pozitivnih propisa i važeće sudske prakse",
              "simulacija slučaja kroz uloge svih sudionika postupka",
            ],
          },
        ],
      },
      { time: "11.00 - 11.30", topics: [{ title: "Pauza za kavu" }] },
      {
        time: "11.30 - 13.00",
        topics: [
          {
            label: "Modul 2",
            title: "Stegovni postupak",
            points: [
              "sudionici i tijela postupka",
              "pokretanje postupka: sadržaj zaključka (lake povrede) i zahtjeva (teške povrede)",
              "zastupanje podnositelja zahtjeva i službenika",
              "odgovor na zahtjev / zaključak",
              "dostava",
              "usmena rasprava i zapisnik",
              "dokazni postupak",
              "odluka: izreka o odgovornosti, sankcija i troškovi te obrazloženje",
              "pravni lijekovi i odluke po pravnim lijekovima",
              "postupak nakon izvršnosti odluke, po odlukama donesenim po pravnim lijekovima ili u upravnom sporu",
              "izvršenje odluke (objava javne opomene, naplata novčane kazne, rješenje o prestanku službe, upis i brisanje iz stegovne evidencije)",
              "prikaz upravne i sudske prakse",
            ],
          },
        ],
      },
      { time: "13.00 - 13.30", topics: [{ title: "Pauza za kavu i finger food" }] },
      {
        time: "13.30 - 14.15",
        topics: [
          {
            label: "Modul 3",
            title: "Instituti koji u praksi otvaraju najviše dilema",
            points: [
              "prethodno pitanje i prekid postupka",
              "nagodba i sporazum o sankciji",
              "zastara (pokretanja i vođenja postupka te izvršenja sankcije)",
              "troškovi postupka",
              "udaljenje od obavljanja dužnosti (suspenzija)",
              "sankcije: vrsta i visina, otegotne i olakotne okolnosti, s posebnim osvrtom na prestanak službe, uvjetni prestanak službe i premještaj na drugo radno mjesto",
              "prikaz upravne i sudske prakse",
              "kontrolna lista potrebnih radnji u postupku",
            ],
          },
        ],
      },
      {
        time: "14.15 - 14.45",
        topics: [{ title: "Rasprava, završna riječ i podjela potvrda o sudjelovanju" }],
      },
      { time: "15.00", topics: [{ title: "Završetak radionice" }] },
    ],
    lecturers: [
      {
        name: "Ivan Poljak, dipl. iur.",
        role: "sudac Općinskog suda i predsjednik Službeničkog suda u Bjelovaru, sudac Službeničkog suda u Ministarstvu pravosuđa, uprave i digitalne transformacije",
        bio: "Ivan Poljak diplomirani je pravnik i sudac Općinskog suda u Bjelovaru s tridesetogodišnjim iskustvom u pravosuđu. Dvadeset godina sudac je i deset godina predsjednik Službeničkog suda u Bjelovaru, a osam godina i sudac Službeničkog suda u Ministarstvu pravosuđa, uprave i digitalne transformacije. Kao načelnik Odjela za nadzor sudske i državnoodvjetničke uprave u pravosudnoj inspekciji sudjelovao je u izradi zakona i drugih propisa, a kao član ekspertnog tima i u pregovorima o pristupanju Republike Hrvatske Europskoj uniji (poglavlja 3, 8 i 23). Kao predavač i autor obrazovnih materijala surađuje s Pravosudnom akademijom RH, Europskom pravosudnom akademijom u Trieru i Hrvatskom javnobilježničkom akademijom. Više je godina bio tajnik Komisije za provedbu pravosudnih ispita i vodio niz EU projekata.",
        photo: {
          url: "/images/edukacije/poljak.jpg",
          alt: "Ivan Poljak, dipl. iur.",
          position: "center 25%",
        },
      },
    ],
  },
];

// Bez `skrivene: true` vraćaju se samo edukacije vidljive na stranici.
function vidljive({ skrivene }: Opcije = {}): Seminar[] {
  return skrivene ? seminars : seminars.filter((seminar) => !seminar.skriveno);
}

export async function getSeminars(limit?: number, opcije?: Opcije): Promise<Seminar[]> {
  // Najnovija edukacija prva (datum silazno).
  const sorted = [...vidljive(opcije)].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
}

export async function getSeminar(slug: string, opcije?: Opcije): Promise<Seminar | null> {
  return vidljive(opcije).find((seminar) => seminar.slug === slug) ?? null;
}

export async function getSeminarSlugs(): Promise<string[]> {
  return vidljive().map((seminar) => seminar.slug);
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

export type Predavac = {
  ime: string;
  uloga?: string;
  foto: { url: string; alt: string; position?: string };
};

// Svaki predavač jednom, redom od najnovije edukacije; bez fotografije se ne prikazuje.
export async function getPredavaci(): Promise<Predavac[]> {
  const predavaci = new Map<string, Predavac>();
  for (const s of await getSeminars()) {
    for (const l of s.lecturers) {
      if (l.photo && !predavaci.has(l.name)) {
        predavaci.set(l.name, { ime: l.name, uloga: l.role, foto: l.photo });
      }
    }
  }
  return [...predavaci.values()];
}
