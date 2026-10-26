import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import About from "@/components/sections/About";
import CTA from "@/components/sections/CTA";
import { getSeminars, isSeminarPast } from "@/lib/edukacije";
import { JLS } from "@/lib/karta-jls";

// Vijesti privremeno skrivene s naslovnice. Za povratak: odkomentiraj
// import i <NewsPreview />, te link u Navbar.tsx i Footer.tsx.
// import NewsPreview from "@/components/sections/NewsPreview";
// import { getPosts, toCard } from "@/lib/posts";

// Kao stranica edukacije: svakih 5 minuta da "sljedeća edukacija" prijeđe na iduću bez novog builda.
export const revalidate = 300;

export default async function Home() {
  // const posts = (await getPosts(3)).map(toCard);
  const seminari = await getSeminars();

  // getSeminars vraća najnovije prvo, pa je zadnja nadolazeća ujedno i najbliža.
  const sljedeca = seminari.filter((s) => !isSeminarPast(s)).at(-1);

  // Lokacija je "Hotel Antunović, Zagreb" - grad je zadnji dio, a na karti piše "Grad Zagreb".
  const istaknuti = [
    ...new Set(seminari.map((s) => `Grad ${s.location.split(",").at(-1)!.trim()}`)),
  ].filter((naziv) => JLS.some(([n]) => n === naziv));

  return (
    <>
      <Hero
        istaknuti={istaknuti}
        sljedeca={
          sljedeca && {
            naslov: sljedeca.title,
            datum: sljedeca.dateLabel,
            mjesto: sljedeca.location,
            slug: sljedeca.slug,
          }
        }
      />
      <Services />
      <About />
      {/* <NewsPreview posts={posts} /> */}
      <CTA />
    </>
  );
}
