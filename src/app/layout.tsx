import type { Metadata } from "next";
import { Josefin_Sans, Poppins } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Suhani Boutique — Premium Tailoring in Raipur",
  description:
    "Custom stitching, alterations, bridal wear, and more. 20+ years of tailoring expertise in Raipur, Chhattisgarh.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${josefinSans.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body text-brown bg-cream">
        {children}
      </body>
    </html>
  );
}
