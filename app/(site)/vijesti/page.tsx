import type { Metadata } from "next";
import { getPosts, toCard } from "@/lib/posts";
import VijestiHero from "./VijestiHero";
import VijestiList from "./VijestiList";

export const metadata: Metadata = {
  title: "Vijesti i članci – LOCALIS",
  description:
    "Stručni članci, savjeti i novosti iz područja edukacije, savjetovanja i poslovanja.",
  alternates: { canonical: "/vijesti" },
};

export default async function VijestiPage() {
  const posts = (await getPosts()).map(toCard);

  return (
    <>
      <VijestiHero />

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <VijestiList posts={posts} />
        </div>
      </section>
    </>
  );
}
