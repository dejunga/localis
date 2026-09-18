import type { Metadata } from "next";
import { getSeminars, isSeminarPast } from "@/lib/edukacije";
import EdukacijeHero from "./EdukacijeHero";
import EdukacijeList from "./EdukacijeList";

export const metadata: Metadata = {
  title: "Edukacije - LOCALIS",
  description:
    "Radionice, seminari i predavanja za službenike lokalne samouprave i sve koji se u svom radu susreću s upravnim pravom.",
  alternates: { canonical: "/edukacije" },
};

// Regenerira se svakih sat vremena da prošle edukacije dobiju oznaku „Održano”.
export const revalidate = 3600;

export default async function EdukacijePage() {
  const seminars = await getSeminars();
  const pastSlugs = seminars.filter((seminar) => isSeminarPast(seminar)).map((s) => s.slug);

  return (
    <>
      <EdukacijeHero />

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <EdukacijeList seminars={seminars} pastSlugs={pastSlugs} />
        </div>
      </section>
    </>
  );
}
