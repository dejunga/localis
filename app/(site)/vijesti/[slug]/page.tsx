import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PortableText } from "@portabletext/react";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { getPost, getPostSlugs, formatDate } from "@/sanity/lib/posts";
import { urlFor } from "@/sanity/lib/image";

const categoryColors: Record<string, string> = {
  Edukacija: "bg-blue-50 text-blue-700",
  Savjetovanje: "bg-amber-50 text-amber-700",
  Računovodstvo: "bg-green-50 text-green-700",
};

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

  if (!post) return { title: "Članak nije pronađen – LOCALIS" };

  return {
    title: `${post.title} – LOCALIS`,
    description: post.excerpt,
    alternates: { canonical: `/vijesti/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt,
      images: post.coverImage
        ? [urlFor(post.coverImage).width(1200).height(630).fit("crop").url()]
        : undefined,
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  const coverUrl = post.coverImage
    ? urlFor(post.coverImage).width(1400).height(613).fit("crop").url()
    : null;

  return (
    <div className="pt-32 pb-20 min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <Link
          href="/vijesti"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[var(--navy)] transition-colors mb-10"
        >
          <ArrowLeft size={15} />
          Nazad na vijesti
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              categoryColors[post.category] ?? "bg-gray-100 text-gray-600"
            }`}
          >
            {post.category}
          </span>
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <Calendar size={11} />
            {formatDate(post.publishedAt)}
          </div>
          <div className="flex items-center gap-1 text-gray-400 text-xs">
            <Clock size={11} />
            {post.readTime} min
          </div>
        </div>

        <h1 className="text-4xl font-bold text-[var(--navy)] mb-6 font-[family-name:var(--font-playfair)] leading-tight">
          {post.title}
        </h1>

        <div className="relative aspect-[16/7] rounded-xl bg-gradient-to-br from-[var(--navy)]/10 to-[var(--navy)]/3 mb-10 overflow-hidden flex items-center justify-center">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={post.coverImage?.alt ?? post.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
              priority
            />
          ) : (
            <span className="text-[var(--navy)]/15 text-8xl font-bold font-[family-name:var(--font-playfair)]">
              {post.title[0]}
            </span>
          )}
        </div>

        <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed space-y-4">
          {post.body ? <PortableText value={post.body} /> : <p>{post.excerpt}</p>}
        </div>

        <div className="mt-16 pt-8 border-t border-gray-100">
          <p className="text-gray-400 text-sm mb-4">Autor</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--navy)] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm font-[family-name:var(--font-playfair)]">
                M
              </span>
            </div>
            <div>
              <div className="font-semibold text-[var(--navy)] text-sm">Marija Jungić</div>
              <div className="text-gray-400 text-xs">LOCALIS – Edukacija i savjetovanje</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
