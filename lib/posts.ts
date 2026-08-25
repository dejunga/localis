export const CATEGORIES = ["Edukacija", "Savjetovanje", "Računovodstvo"] as const;

export type PostSummary = {
  slug: string;
  title: string;
  excerpt: string;
  category: (typeof CATEGORIES)[number];
  publishedAt: string;
  readTime: number;
  coverImage?: { url: string; alt: string };
};

export type Post = PostSummary & {
  body?: string[];
};

// Ručno dodani članci. Novi post: dodati objekt u niz ispod (najnoviji na vrh nije
// nužan – getPosts sortira po publishedAt).
const posts: Post[] = [
  // {
  //   slug: "primjer-clanka",
  //   title: "Primjer članka",
  //   excerpt: "Kratki uvod koji se prikazuje na popisu vijesti.",
  //   category: "Edukacija",
  //   publishedAt: "2026-01-15",
  //   readTime: 4,
  //   coverImage: { url: "/images/vijesti/primjer.jpg", alt: "Opis slike" },
  //   body: [
  //     "Prvi paragraf teksta.",
  //     "Drugi paragraf teksta.",
  //   ],
  // },
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
