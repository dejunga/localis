import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import About from "@/components/sections/About";
import Newsletter from "@/components/sections/Newsletter";
import CTA from "@/components/sections/CTA";

// Vijesti privremeno skrivene s naslovnice. Za povratak: odkomentiraj
// import i <NewsPreview />, te link u Navbar.tsx i Footer.tsx.
// import NewsPreview from "@/components/sections/NewsPreview";
// import { getPosts, toCard } from "@/lib/posts";

export default function Home() {
  // const posts = (await getPosts(3)).map(toCard);

  return (
    <>
      <Hero />
      <Services />
      <About />
      {/* <NewsPreview posts={posts} /> */}
      <Newsletter />
      <CTA />
    </>
  );
}
