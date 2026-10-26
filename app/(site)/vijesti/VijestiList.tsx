import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { PostCard } from "@/lib/posts";

function Meta({ post }: { post: PostCard }) {
  return (
    <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
      <span className="font-semibold text-[var(--gold)]">{post.category}</span>
      <span className="text-gray-500">{post.date}</span>
      <span className="text-gray-500">{post.readTime} čitanja</span>
    </p>
  );
}

function Naslovna({ post, sizes, priority }: { post: PostCard; sizes: string; priority?: boolean }) {
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-[var(--navy)]/8">
      {post.imageUrl ? (
        <Image
          src={post.imageUrl}
          alt={post.imageAlt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
        />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center text-[var(--navy)]/15 text-7xl font-bold font-[family-name:var(--font-playfair)]">
          {post.title[0]}
        </span>
      )}
    </div>
  );
}

// Najnovija vijest je istaknuta (slika lijevo, tekst desno); ostale idu ispod u dva stupca.
export default function VijestiList({ posts }: { posts: PostCard[] }) {
  if (posts.length === 0) {
    return (
      <p className="text-gray-500 text-center py-10">
        Trenutno nema objavljenih vijesti. Vratite se uskoro.
      </p>
    );
  }

  const [prva, ...ostale] = posts;

  return (
    <div className="space-y-16">
      <article>
        <Link
          href={`/vijesti/${prva.slug}`}
          className="group grid grid-cols-1 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] gap-8 lg:gap-12 items-center"
        >
          <Naslovna post={prva} sizes="(max-width: 1024px) 100vw, 640px" priority />
          <div>
            <Meta post={prva} />
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-[var(--navy)] leading-tight text-balance font-[family-name:var(--font-playfair)] group-hover:underline decoration-[var(--gold)] decoration-2 underline-offset-[6px]">
              {prva.title}
            </h2>
            <p className="mt-4 text-gray-600 text-lg leading-relaxed text-pretty">{prva.excerpt}</p>
            <span className="mt-6 inline-flex items-center gap-1.5 font-semibold text-[var(--navy)]">
              Pročitajte članak
              <ArrowRight
                size={16}
                className="text-[var(--gold)] transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </span>
          </div>
        </Link>
      </article>

      {ostale.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-14 border-t border-gray-200 pt-14">
          {ostale.map((post) => (
            <article key={post.slug}>
              <Link href={`/vijesti/${post.slug}`} className="group block">
                <Naslovna post={post} sizes="(max-width: 768px) 100vw, 540px" />
                <div className="mt-5">
                  <Meta post={post} />
                  <h2 className="mt-2 text-xl md:text-2xl font-bold text-[var(--navy)] leading-snug text-balance font-[family-name:var(--font-playfair)] group-hover:underline decoration-[var(--gold)] decoration-2 underline-offset-4">
                    {post.title}
                  </h2>
                  <p className="mt-3 text-gray-600 leading-relaxed text-pretty">{post.excerpt}</p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
