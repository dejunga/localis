import type { PortableTextBlock } from "@portabletext/types";
import type { SanityImageSource } from "@sanity/image-url";
import { getClient } from "./client";
import { urlFor } from "./image";
import { isSanityConfigured } from "../env";

export type PostSummary = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  readTime: number;
  coverImage?: SanityImageSource & { alt?: string };
};

export type Post = PostSummary & {
  body?: PortableTextBlock[];
};

const SUMMARY_FIELDS = `
  "slug": slug.current,
  title,
  excerpt,
  category,
  publishedAt,
  readTime,
  coverImage
`;

// Sanity ispadi ne smiju srušiti stranicu – vijesti su dodatak, ne jezgra sadržaja.
async function safeFetch<T>(query: string, params: Record<string, unknown>, fallback: T): Promise<T> {
  if (!isSanityConfigured) return fallback;

  try {
    return await getClient().fetch<T>(query, params, {
      next: { revalidate: 60, tags: ["post"] },
    });
  } catch (error) {
    console.error("Sanity fetch nije uspio:", error);
    return fallback;
  }
}

export function getPosts(limit?: number): Promise<PostSummary[]> {
  const slice = typeof limit === "number" ? `[0...${limit}]` : "";
  return safeFetch<PostSummary[]>(
    `*[_type == "post" && defined(slug.current)] | order(publishedAt desc)${slice}{${SUMMARY_FIELDS}}`,
    {},
    [],
  );
}

export function getPost(slug: string): Promise<Post | null> {
  return safeFetch<Post | null>(
    `*[_type == "post" && slug.current == $slug][0]{${SUMMARY_FIELDS}, body}`,
    { slug },
    null,
  );
}

export function getPostSlugs(): Promise<string[]> {
  return safeFetch<string[]>(
    `*[_type == "post" && defined(slug.current)].slug.current`,
    {},
    [],
  );
}

const dateFormatter = new Intl.DateTimeFormat("hr-HR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

// Prikazni oblik – slike i datumi se razriješe na serveru pa klijent dobiva gotove stringove.
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
    imageUrl: post.coverImage
      ? urlFor(post.coverImage).width(800).height(450).fit("crop").url()
      : null,
    imageAlt: post.coverImage?.alt ?? post.title,
  };
}
