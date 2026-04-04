import type { Metadata } from "next";
import { Josefin_Sans, Poppins, Tiro_Devanagari_Hindi } from "next/font/google";
import { LanguageProvider } from "@/lib/i18n";
import "./globals.css";

const josefinSans = Josefin_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

const poppins = Poppins({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const tiroDevanagari = Tiro_Devanagari_Hindi({
  variable: "--font-hindi",
  subsets: ["devanagari"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Suhani Boutique — Premium Tailoring in Raipur",
  description:
    "Custom stitching, alterations, bridal wear, and more. 20+ years of tailoring expertise in Raipur, Chhattisgarh.",
  openGraph: {
    title: "Suhani Boutique — Premium Tailoring in Raipur",
    description:
      "Custom stitching, alterations, bridal wear, and more. 20+ years of tailoring expertise.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${josefinSans.variable} ${poppins.variable} ${tiroDevanagari.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body text-brown bg-cream">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
