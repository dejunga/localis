import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/posts";
import { getSeminars } from "@/lib/edukacije";

const siteUrl = "https://www.localis.hr";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const posts = await getPosts();
  const seminars = await getSeminars();

  return [
    { url: siteUrl, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/o-nama`, lastModified, changeFrequency: "yearly", priority: 0.8 },
    { url: `${siteUrl}/usluge`, lastModified, changeFrequency: "yearly", priority: 0.8 },
    { url: `${siteUrl}/edukacije`, lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/vijesti`, lastModified, changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteUrl}/kontakt`, lastModified, changeFrequency: "yearly", priority: 0.5 },
    ...posts.map((post) => ({
      url: `${siteUrl}/vijesti/${post.slug}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
    ...seminars.map((seminar) => ({
      url: `${siteUrl}/edukacije/${seminar.slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
