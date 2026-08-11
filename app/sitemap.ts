import type { MetadataRoute } from "next";

const siteUrl = "https://www.localis.hr";

// Vijesti detalji dodaju se ovdje kad stignu Sanity podaci
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: siteUrl, lastModified, changeFrequency: "monthly", priority: 1 },
    { url: `${siteUrl}/o-nama`, lastModified, changeFrequency: "yearly", priority: 0.8 },
    { url: `${siteUrl}/usluge`, lastModified, changeFrequency: "yearly", priority: 0.8 },
    { url: `${siteUrl}/vijesti`, lastModified, changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteUrl}/kontakt`, lastModified, changeFrequency: "yearly", priority: 0.5 },
  ];
}
