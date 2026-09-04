import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "@fontsource-variable/inter";
import { ClientShell } from "@/components/client-shell";
import { siteConfig } from "@/lib/content";
import { getPublicSiteSettings } from "@/lib/site-settings";
import "./globals.css";

const flexo = localFont({
  src: [
    { path: "./fonts/flexo-regular.ttf", style: "normal", weight: "400" },
    { path: "./fonts/flexo-bold.ttf", style: "normal", weight: "700" },
  ],
  display: "swap",
  variable: "--font-flexo",
  fallback: ["Arial", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: "Wilo Studio | Diseño, tecnología y producción", template: "%s | Wilo Studio" },
  description: "Estudio creativo de Arequipa que diseña productos digitales, contenido audiovisual, experiencias y soluciones tecnológicas para todo el Perú.",
  applicationName: "Wilo Studio",
  authors: [{ name: siteConfig.legalName }],
  creator: "Wilo Studio",
  publisher: "Wilo Studio",
  keywords: ["diseño web Arequipa", "páginas web Perú", "productos digitales", "producción audiovisual", "experiencias para eventos", "Wilo Studio"],
  alternates: { canonical: "/" },
  icons: { icon: "/brand/wilo-mark.png", apple: "/brand/wilo-mark.png" },
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: siteConfig.url,
    siteName: "Wilo Studio",
    title: "Wilo Studio — Soluciones que hacen crecer tu negocio",
    description: "Diseño, tecnología, producción audiovisual y experiencias desde Arequipa para todo el Perú.",
    images: [{ url: "/brand/portfolio-showcase.webp", width: 1600, height: 1999, alt: "Proyectos digitales de Wilo Studio" }],
  },
  twitter: { card: "summary_large_image", title: "Wilo Studio", description: "Soluciones que hacen ver, vender y crecer tu negocio.", images: ["/brand/portfolio-showcase.webp"] },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#F1B824", colorScheme: "light" };

const localBusiness = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: siteConfig.name,
  url: siteConfig.url,
  telephone: siteConfig.phoneDisplay,
  taxID: siteConfig.ruc,
  address: { "@type": "PostalAddress", addressLocality: "Arequipa", addressCountry: "PE" },
  areaServed: { "@type": "Country", name: "Perú" },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getPublicSiteSettings();
  const structuredBusiness = {
    ...localBusiness,
    name: settings.name,
    url: settings.url,
    telephone: settings.phoneDisplay,
    taxID: settings.ruc,
    address: { "@type": "PostalAddress", addressLocality: settings.location, addressCountry: "PE" },
    ...(settings.emailVerified ? { email: settings.email } : {}),
  };
  return (
    <html lang="es" className={flexo.variable}>
      <body>
        <a className="skip-link" href="#contenido">Saltar al contenido</a>
        <ClientShell settings={settings}>
          {children}
        </ClientShell>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredBusiness).replace(/</g, "\\u003c") }} />
      </body>
    </html>
  );
}
