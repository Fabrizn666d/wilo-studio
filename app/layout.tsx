import type { Metadata, Viewport } from "next";
import { Anton, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Wilo Studio | Páginas web, tiendas online y sistemas",
  description:
    "Wilo Studio diseña páginas web, tiendas online, catálogos digitales y sistemas para negocios de Perú y LATAM.",
  keywords: [
    "Wilo Studio",
    "páginas web Perú",
    "tiendas online",
    "catálogos digitales",
    "sistemas web",
    "diseño web",
  ],
  authors: [{ name: "Wilo Studio" }],
  creator: "Wilo Studio",
  openGraph: {
    title: "Wilo Studio",
    description: "Páginas web, tiendas online y sistemas que hacen crecer tu negocio.",
    type: "website",
    locale: "es_PE",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFDC2F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${manrope.variable} ${anton.variable}`}>
      <body>{children}</body>
    </html>
  );
}
