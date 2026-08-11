import Hero from "@/components/sections/Hero";
import Services from "@/components/sections/Services";
import About from "@/components/sections/About";
import NewsPreview from "@/components/sections/NewsPreview";
import CTA from "@/components/sections/CTA";
import { getPosts, toCard } from "@/sanity/lib/posts";

export default async function Home() {
  const posts = (await getPosts(3)).map(toCard);

  return (
    <>
      <Hero />
      <Services />
      <About />
      <NewsPreview posts={posts} />
      <CTA />
    </>
  );
}
