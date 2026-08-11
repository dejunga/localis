import { defineField, defineType } from "sanity";

export const KATEGORIJE = ["Edukacija", "Savjetovanje", "Računovodstvo"] as const;

export const post = defineType({
  name: "post",
  title: "Vijest",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Naslov",
      type: "string",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "slug",
      title: "URL (slug)",
      type: "slug",
      description: "Klikni „Generate” da se ispuni iz naslova.",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Kategorija",
      type: "string",
      options: { list: [...KATEGORIJE] },
      initialValue: "Edukacija",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Datum objave",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "readTime",
      title: "Vrijeme čitanja (min)",
      type: "number",
      initialValue: 3,
      validation: (rule) => rule.required().min(1).max(60),
    }),
    defineField({
      name: "excerpt",
      title: "Sažetak",
      type: "text",
      rows: 3,
      description: "Kratki uvod koji se prikazuje na popisu vijesti.",
      validation: (rule) => rule.required().max(300),
    }),
    defineField({
      name: "coverImage",
      title: "Naslovna slika",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Opis slike",
          type: "string",
          description: "Za čitače ekrana i SEO.",
        }),
      ],
    }),
    defineField({
      name: "body",
      title: "Tekst",
      type: "array",
      of: [
        { type: "block" },
        {
          type: "image",
          options: { hotspot: true },
          fields: [defineField({ name: "alt", title: "Opis slike", type: "string" })],
        },
      ],
    }),
  ],
  orderings: [
    {
      title: "Najnovije prvo",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "coverImage" },
  },
});
