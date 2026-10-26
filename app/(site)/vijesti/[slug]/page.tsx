import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getPost, getPosts, getPostSlugs, formatDate } from "@/lib/posts";
import { getSeminars, isSeminarPast } from "@/lib/edukacije";
import PostGallery from "./PostGallery";

// Kao stranice edukacija: "sljedeća edukacija" na kraju članka prelazi na iduću bez novog builda.
export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) return { title: "Članak nije pronađen - LOCALIS" };

  return {
    title: `${post.title} - LOCALIS`,
    description: post.excerpt,
    alternates: { canonical: `/vijesti/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt,
      images: post.coverImage ? [post.coverImage.url] : undefined,
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  const [uvod, ...odlomci] = post.body?.length ? post.body : [post.excerpt];
  // getSeminars vraća najnovije prvo, pa je zadnja nadolazeća ujedno i najbliža.
  const sljedeca = (await getSeminars()).filter((s) => !s.odgodeno && !isSeminarPast(s)).at(-1);
  const ostale = (await getPosts()).filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <article className="pt-32 pb-20 bg-white">
      <header className="max-w-3xl mx-auto px-6">
        <Link
          href="/vijesti"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--navy)] transition-colors mb-10"
        >
          <ArrowLeft size={15} />
          Nazad na vijesti
        </Link>

        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="font-semibold text-[var(--gold)]">{post.category}</span>
          <time dateTime={post.publishedAt} className="text-gray-500">
            {formatDate(post.publishedAt)}
          </time>
          <span className="text-gray-500">{post.readTime} min čitanja</span>
        </p>

        <h1 className="mt-4 text-4xl md:text-5xl font-bold text-[var(--navy)] leading-[1.12] text-balance font-[family-name:var(--font-playfair)]">
          {post.title}
        </h1>
      </header>

      {/* Naslovna fotografija šira od stupca teksta */}
      <div className="max-w-5xl mx-auto px-6 mt-10">
        <div className="relative aspect-[16/9] overflow-hidden rounded-xl bg-[var(--navy)]/8">
          {post.coverImage ? (
            <Image
              src={post.coverImage.url}
              alt={post.coverImage.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 976px"
              className="object-cover"
              priority
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-[var(--navy)]/15 text-8xl font-bold font-[family-name:var(--font-playfair)]">
              {post.title[0]}
            </span>
          )}
        </div>
        {post.coverImage && (
          <p className="mt-3 text-sm text-gray-500 text-pretty">{post.coverImage.alt}</p>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-6 mt-12">
        <p className="text-xl md:text-[1.375rem] leading-relaxed text-gray-800 text-pretty">{uvod}</p>
        <div className="mt-6 space-y-5 text-[1.0625rem] leading-[1.8] text-gray-700">
          {odlomci.map((odlomak, i) => (
            <p key={i} className="text-pretty">
              {odlomak}
            </p>
          ))}
        </div>
      </div>

      {post.gallery?.length ? (
        <section className="max-w-5xl mx-auto px-6 mt-16">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--navy)] font-[family-name:var(--font-playfair)]">
              Fotografije s edukacije
            </h2>
            <p className="text-sm text-gray-500">{post.gallery.length} fotografija, kliknite za uvećanje</p>
          </div>
          <PostGallery images={post.gallery} />
        </section>
      ) : null}

      {sljedeca && (
        <aside className="max-w-3xl mx-auto px-6 mt-20">
          <div className="rounded-2xl bg-[var(--navy)] px-6 py-8 sm:px-10 sm:py-10 text-white">
            <p className="text-[var(--gold)] font-medium">Sljedeća edukacija</p>
            <p className="mt-2 text-2xl md:text-3xl font-bold leading-tight text-balance font-[family-name:var(--font-playfair)]">
              {sljedeca.title}
            </p>
            <p className="mt-3 text-gray-300">
              {sljedeca.dateLabel}, {sljedeca.location}
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link
                href={`/edukacije/${sljedeca.slug}`}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--gold)] px-6 py-3 font-semibold text-[var(--navy)] transition-colors hover:bg-[var(--gold-light)]"
              >
                Program i prijava
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/edukacije"
                className="inline-flex items-center justify-center rounded-lg border border-white/30 px-6 py-3 font-medium text-white transition-colors hover:bg-white/10"
              >
                Sve edukacije
              </Link>
            </div>
          </div>
        </aside>
      )}

      {ostale.length > 0 && (
        <nav aria-label="Ostale vijesti" className="max-w-3xl mx-auto px-6 mt-16">
          <h2 className="text-xl font-bold text-[var(--navy)] mb-4 font-[family-name:var(--font-playfair)]">
            Ostale vijesti
          </h2>
          <ul className="divide-y divide-gray-200 border-y border-gray-200">
            {ostale.map((p) => (
              <li key={p.slug}>
                <Link href={`/vijesti/${p.slug}`} className="group flex items-center gap-5 py-5">
                  {p.coverImage && (
                    <span className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-[var(--navy)]/8">
                      <Image src={p.coverImage.url} alt="" fill sizes="80px" className="object-cover" />
                    </span>
                  )}
                  <span className="min-w-0">
                    <span className="block text-sm text-gray-500">{formatDate(p.publishedAt)}</span>
                    <span className="mt-1 block font-semibold text-[var(--navy)] leading-snug text-pretty group-hover:underline decoration-[var(--gold)] decoration-2 underline-offset-4">
                      {p.title}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </article>
  );
}
