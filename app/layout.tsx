import type { Metadata } from "next";
import { Inter, Playfair_Display, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getTekstovi, telefonZaPoziv } from "@/lib/tekstovi";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://www.localis.hr";
const title = "LOCALIS - Edukacija i savjetovanje";
const description =
  "LOCALIS pruža usluge edukacije, organizacije seminara i poslovnog savjetovanja za jedinice lokalne samouprave i sve koji se u radu susreću s propisima lokalne samouprave.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  keywords: ["edukacija", "savjetovanje", "seminari", "lokalna samouprava", "LOCALIS"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "hr_HR",
    url: "/",
    siteName: "LOCALIS",
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

// E-mail i telefon dolaze iz admina (lib/tekstovi.ts), kao i na samoj stranici.
function organizationJsonLd(email: string, telefon: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "LOCALIS",
    description,
    url: siteUrl,
    email,
    telephone: telefonZaPoziv(telefon),
    areaServed: "HR",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const t = await getTekstovi();
  // "<" escapiran: e-mail dolazi iz admina, a JSON ide unutar <script>.
  const jsonLd = JSON.stringify(organizationJsonLd(t["kontakt.email"], t["kontakt.telefon"])).replace(/</g, "\\u003c");
  return (
    <html
      lang="hr"
      className={`${inter.variable} ${playfair.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd }}
        />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
