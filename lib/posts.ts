export const CATEGORIES = ["Edukacija", "Savjetovanje", "Računovodstvo"] as const;

export type PostImage = { url: string; alt: string };

export type PostSummary = {
  slug: string;
  title: string;
  excerpt: string;
  category: (typeof CATEGORIES)[number];
  publishedAt: string;
  readTime: number;
  coverImage?: PostImage;
};

export type Post = PostSummary & {
  body?: string[];
  gallery?: PostImage[];
};

// Ručno dodani članci. Novi post: dodati objekt u niz ispod (najnoviji na vrh nije
// nužan – getPosts sortira po publishedAt).
const posts: Post[] = [
  {
    slug: "odrzana-radionica-izvanredni-pravni-lijekovi-u-upravnom-postupku",
    title:
      "Uspješno održana radionica o izvanrednim pravnim lijekovima u upravnom postupku",
    excerpt:
      "U Hotelu Antunović u Zagrebu 14. rujna 2026. održali smo stručnu radionicu prof. dr. sc. Darija Đerđe. Donosimo dojmove i fotografije s edukacije.",
    category: "Edukacija",
    publishedAt: "2026-09-15",
    readTime: 2,
    coverImage: {
      url: "/images/vijesti/edukacija-2026-09-14/01.jpg",
      alt: "Prof. dr. sc. Dario Đerđa otvara radionicu u Kongresnoj dvorani Hotela Antunović",
    },
    body: [
      "U Kongresnoj dvorani Hotela Antunović u Zagrebu 14. rujna 2026. održana je stručna radionica „Primjena izvanrednih pravnih lijekova u upravnom postupku: pogled na pravnu teoriju i sudsku praksu”. Predavač je bio prof. dr. sc. Dario Đerđa, predstojnik Katedre za upravno pravo Pravnog fakulteta Sveučilišta u Rijeci.",
      "Radionica je okupila službenike jedinica lokalne i područne (regionalne) samouprave, državne službenike i pravnike iz prakse. Tijekom dana obrađeni su obnova postupka, poništavanje i ukidanje rješenja te oglašavanje rješenja ništavim, uz brojne primjere iz sudske prakse upravnih sudova.",
      "Posebno nas je razveselila aktivnost sudionika. Pitanja su se nizala tijekom cijelog dana, a ne samo u predviđenom terminu za diskusiju. Bila su to konkretna pitanja iz svakodnevnog rada, na koja je predavač davao jasne i praktično primjenjive odgovore. Upravo takva razmjena iskustava najviše obogaćuje edukaciju.",
      "Pobrinuli smo se i da sudionicima ništa ne nedostaje: uz ugodan ambijent dvorane, u pauzama su ih čekali kava, osvježenje i bogata zakuska.",
      "Prezadovoljni smo prenesenim znanjem, atmosferom i povratnim informacijama koje smo dobili. Zahvaljujemo prof. dr. sc. Đerđi na izvrsnom predavanju, a svim sudionicima na povjerenju i aktivnom sudjelovanju. Vidimo se na sljedećoj edukaciji!",
    ],
    gallery: [
      { url: "/images/vijesti/edukacija-2026-09-14/02.jpg", alt: "Sudionici prate izlaganje u Kongresnoj dvorani" },
      { url: "/images/vijesti/edukacija-2026-09-14/03.jpg", alt: "Pogled na dvoranu tijekom predavanja" },
      { url: "/images/vijesti/edukacija-2026-09-14/04.jpg", alt: "Prof. dr. sc. Dario Đerđa uz prezentaciju o zaštiti prava stranaka" },
      { url: "/images/vijesti/edukacija-2026-09-14/05.jpg", alt: "Sudionici radionice za stolovima" },
      { url: "/images/vijesti/edukacija-2026-09-14/06.jpg", alt: "Predavač odgovara na pitanja sudionika" },
      { url: "/images/vijesti/edukacija-2026-09-14/07.jpg", alt: "Rasprava tijekom radionice" },
      { url: "/images/vijesti/edukacija-2026-09-14/08.jpg", alt: "Sudionici pažljivo prate izlaganje" },
      { url: "/images/vijesti/edukacija-2026-09-14/09.jpg", alt: "Predavač u razgovoru sa sudionicima" },
      { url: "/images/vijesti/edukacija-2026-09-14/10.jpg", alt: "Prof. dr. sc. Dario Đerđa i sudionici radionice" },
      { url: "/images/vijesti/edukacija-2026-09-14/11.jpg", alt: "Zakuska za sudionike u pauzi radionice" },
      { url: "/images/vijesti/edukacija-2026-09-14/12.jpg", alt: "Predavač tijekom izlaganja pred sudionicima" },
    ],
  },
];

export async function getPosts(limit?: number): Promise<PostSummary[]> {
  const sorted = [...posts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
  return typeof limit === "number" ? sorted.slice(0, limit) : sorted;
}

export async function getPost(slug: string): Promise<Post | null> {
  return posts.find((post) => post.slug === slug) ?? null;
}

export async function getPostSlugs(): Promise<string[]> {
  return posts.map((post) => post.slug);
}

const dateFormatter = new Intl.DateTimeFormat("hr-HR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

export type PostCard = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  imageUrl: string | null;
  imageAlt: string;
};

export function toCard(post: PostSummary): PostCard {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    date: formatDate(post.publishedAt),
    readTime: `${post.readTime} min`,
    imageUrl: post.coverImage?.url ?? null,
    imageAlt: post.coverImage?.alt ?? post.title,
  };
}
