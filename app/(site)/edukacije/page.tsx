import type { Metadata } from "next";
import { getSeminars } from "@/lib/edukacije";
import EdukacijeHero from "./EdukacijeHero";
import EdukacijeList from "./EdukacijeList";

export const metadata: Metadata = {
  title: "Edukacije – LOCALIS",
  description:
    "Radionice, seminari i predavanja za službenike lokalne samouprave i sve koji se u svom radu susreću s upravnim pravom.",
  alternates: { canonical: "/edukacije" },
};

export default async function EdukacijePage() {
  const seminars = await getSeminars();

  return (
    <>
      <EdukacijeHero />

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <EdukacijeList seminars={seminars} />
        </div>
      </section>
    </>
  );
}
