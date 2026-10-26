import Hero from "@/components/sections/Hero";
import NadolazeceEdukacije from "@/components/sections/NadolazeceEdukacije";
import Services from "@/components/sections/Services";
import About from "@/components/sections/About";
import CTA from "@/components/sections/CTA";
import { aktualnaCijena, getPredavaci, getSeminars, isSeminarPast } from "@/lib/edukacije";
import { JLS } from "@/lib/karta-jls";

// Vijesti privremeno skrivene s naslovnice. Za povratak: odkomentiraj
// import i <NewsPreview />, te link u Navbar.tsx i Footer.tsx.
// import NewsPreview from "@/components/sections/NewsPreview";
// import { getPosts, toCard } from "@/lib/posts";

// Kao stranica edukacije: svakih 5 minuta da "sljedeća edukacija" prijeđe na iduću bez novog builda.
export const revalidate = 300;

// Gradovi istaknuti na karti i bez edukacije u njima.
const UVIJEK_ISTAKNUTI = ["Grad Rijeka"];

export default async function Home() {
  // const posts = (await getPosts(3)).map(toCard);
  const seminari = await getSeminars();

  // getSeminars vraća najnovije prvo; okrenuto je najbliža nadolazeća prva.
  const nadolazece = seminari.filter((s) => !s.odgodeno && !isSeminarPast(s)).reverse();
  const sljedeca = nadolazece[0];

  // Lokacija je "Hotel Antunović, Zagreb" - grad je zadnji dio, a na karti piše "Grad Zagreb".
  const istaknuti = [
    ...new Set([
      ...seminari.map((s) => `Grad ${s.location.split(",").at(-1)!.trim()}`),
      ...UVIJEK_ISTAKNUTI,
    ]),
  ].filter((naziv) => JLS.some(([n]) => n === naziv));

  const predavaci = await getPredavaci();

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
      <NadolazeceEdukacije
        edukacije={nadolazece.map((s) => ({
          slug: s.slug,
          naslov: s.title,
          datum: s.date,
          mjesto: s.location,
          cijena: aktualnaCijena(s).price,
        }))}
      />
      <Services />
      <About predavaci={predavaci} />
      {/* <NewsPreview posts={posts} /> */}
      <CTA />
    </>
  );
}
