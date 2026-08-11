export const apiVersion = "2026-05-19";

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "";

// Bez projectId Sanity se ne kontaktira – stranice tada prikazuju prazno stanje
// umjesto da build padne.
export const isSanityConfigured = projectId.length > 0;
