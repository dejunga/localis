import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// Studio (/studio) namjerno je izvan ove grupe pa nema navbar ni footer.
export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
