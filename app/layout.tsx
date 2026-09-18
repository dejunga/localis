import type { Metadata } from "next";
import { Inter, Playfair_Display, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
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

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "LOCALIS",
  description,
  url: siteUrl,
  email: "info@localis.hr",
  telephone: "+385953135158",
  areaServed: "HR",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="hr"
      className={`${inter.variable} ${playfair.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
