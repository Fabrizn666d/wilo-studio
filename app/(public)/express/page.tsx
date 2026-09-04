import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  Cake,
  Check,
  Globe2,
  LayoutDashboard,
  Link2Off,
  MessageCircle,
  MonitorSmartphone,
  ShieldCheck,
} from "lucide-react";
import { siteConfig } from "@/lib/content";
import styles from "./express.module.css";

const expressUrl = "https://wilo.site";

const included = [
  {
    icon: ShieldCheck,
    title: "VPS + SSL",
    text: "Alojamiento y protección incluidos dentro del servicio administrado.",
  },
  {
    icon: Globe2,
    title: "Dirección .wilo.site",
    text: "Una dirección web incluida para compartir tu página directamente.",
  },
  {
    icon: LayoutDashboard,
    title: "Panel ADMIN",
    text: "Acceso para actualizar los campos habilitados para tu tipo de negocio.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp integrado",
    text: "Un canal directo para que las consultas lleguen a tu negocio.",
  },
  {
    icon: MonitorSmartphone,
    title: "Diseño responsive",
    text: "La página se adapta a celular, tablet y computadora.",
  },
  {
    icon: Link2Off,
    title: "Acceso sin desvíos",
    text: "Sin anuncios de terceros y sin enlaces acortadores.",
  },
] as const;

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: siteConfig.url },
    { "@type": "ListItem", position: 2, name: "Wilo Express", item: `${siteConfig.url}/express` },
  ],
};

export const metadata: Metadata = {
  title: "Wilo Express | Página web administrable por S/30 al mes",
  description:
    "Conoce Wilo Express: página web administrable por S/30 al mes con dirección .wilo.site, VPS, SSL, panel, WhatsApp y diseño responsive.",
  keywords: ["Wilo Express", "página web por S/30 al mes", "página web administrable para negocios"],
  alternates: { canonical: "/express" },
  openGraph: {
    title: "Wilo Express | Tu página web por S/30 al mes",
    description: "Página administrable con dirección web, VPS, SSL, panel y WhatsApp incluidos.",
    url: "/express",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Wilo Express",
    description: "Tu página web administrable por S/30 al mes.",
  },
};

function ExternalCta({ children, inverse = false }: { children: React.ReactNode; inverse?: boolean }) {
  return (
    <a
      className={`${styles.cta} ${inverse ? styles.ctaInverse : ""}`}
      href={expressUrl}
      rel="noreferrer"
      target="_blank"
    >
      {children} <ArrowUpRight aria-hidden="true" />
    </a>
  );
}

export default function ExpressBridgePage() {
  return (
    <main className={`pr-page ${styles.page}`} id="contenido">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }} />

      <header className={styles.hero}>
        <div className={styles.heroGrid} aria-hidden="true" />
        <div className={styles.shell}>
          <nav aria-label="Migas de pan" className={styles.breadcrumbs}>
            <Link href="/">Wilo Studio</Link>
            <span aria-hidden="true">/</span>
            <span>Express</span>
          </nav>

          <div className={styles.heroLayout}>
            <div className={styles.heroCopy}>
              <div className={styles.lineBrand}>
                <strong aria-hidden="true">W</strong>
                <span><b>wilo</b><small>EXPRESS</small></span>
                <i>UNA LÍNEA DE WILO</i>
              </div>
              <p className={styles.kicker}>Rápido · simple · profesional</p>
              <h1>Tu negocio,<br /><em>online.</em></h1>
              <p className={styles.lede}>
                Una página administrable para reunir información, productos o servicios, precios, fotos y WhatsApp en un solo lugar.
              </p>

              <div className={styles.priceRow} aria-label="Precio de Wilo Express">
                <div className={styles.mainPrice}><span>S/</span><strong>30</strong><small>al mes</small></div>
                <div className={styles.birthdayPrice}>
                  <Cake aria-hidden="true" />
                  <span>El mes de tu cumpleaños <strong>S/20</strong></span>
                </div>
              </div>

              <div className={styles.heroActions}>
                <ExternalCta>Ir a Wilo Express</ExternalCta>
                <span>El producto y su solicitud viven en wilo.site.</span>
              </div>
            </div>

            <div className={styles.productVisual} aria-label="Representación de una página Wilo Express en computadora y celular">
              <div className={styles.browser}>
                <div className={styles.browserBar}>
                  <i /><i /><i />
                  <span>tu-negocio.wilo.site</span>
                </div>
                <div className={styles.browserContent}>
                  <div className={styles.mockNav}><b>TU NEGOCIO</b><span>PRODUCTOS</span><span>SERVICIOS</span></div>
                  <div className={styles.mockHero}>
                    <span>Tu información, ordenada.</span>
                    <div><i /><i /><i /></div>
                  </div>
                  <div className={styles.mockCards}><i /><i /><i /></div>
                </div>
              </div>
              <div className={styles.phone}>
                <div className={styles.phoneSpeaker} />
                <span>TU NEGOCIO</span>
                <div className={styles.phoneHero} />
                <i /><i /><i />
                <b>WhatsApp</b>
              </div>
              <span className={styles.visualNote}>Dirección incluida · Panel ADMIN</span>
            </div>
          </div>
        </div>
      </header>

      <section className={styles.includedSection} aria-labelledby="express-incluye">
        <div className={styles.shell}>
          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.kicker}>Todo lo esencial</span>
              <h2 id="express-incluye">Lo importante ya viene <em>incluido.</em></h2>
            </div>
            <p>Wilo administra la infraestructura. Tú mantienes al día el contenido disponible en tu panel.</p>
          </div>
          <div className={styles.includedGrid}>
            {included.map(({ icon: Icon, title, text }, index) => (
              <article key={title}>
                <div><span>{String(index + 1).padStart(2, "0")}</span><Icon aria-hidden="true" /></div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.controlSection} aria-labelledby="express-control">
        <div className={styles.shell}>
          <div className={styles.controlIntro}>
            <span className={styles.kicker}>Cómo se reparte el trabajo</span>
            <h2 id="express-control">Wilo prepara.<br />Tú <em>administras.</em></h2>
          </div>
          <ol className={styles.controlSteps}>
            <li>
              <span>01</span>
              <div><strong>Eliges una base</strong><p>Wilo Express parte de un diseño preparado para el tipo de página que necesita tu negocio.</p></div>
            </li>
            <li>
              <span>02</span>
              <div><strong>Wilo organiza el inicio</strong><p>La información y el material acordados se preparan antes de la revisión y activación.</p></div>
            </li>
            <li>
              <span>03</span>
              <div><strong>Actualizas desde el panel</strong><p>Los campos disponibles cambian según el tipo de negocio, sin necesidad de programar.</p></div>
            </li>
          </ol>
        </div>
      </section>

      <section className={styles.claritySection} aria-labelledby="express-alcance">
        <div className={styles.shell}>
          <div className={styles.clarityCard}>
            <div>
              <span className={styles.kicker}>Alcance claro</span>
              <h2 id="express-alcance">Una base lista para crecer con tu contenido.</h2>
            </div>
            <div>
              <ul>
                <li><Check aria-hidden="true" /> Productos, servicios, menú u otro contenido según el tipo de página.</li>
                <li><Check aria-hidden="true" /> Panel con los módulos habilitados para el negocio.</li>
                <li><Check aria-hidden="true" /> Contacto directo por WhatsApp.</li>
              </ul>
              <p>Un dominio propio, integraciones externas, funciones a medida o cambios estructurales se revisan y cotizan por separado antes de ejecutarse.</p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.finalCta} aria-labelledby="express-siguiente">
        <div className={styles.shell}>
          <span className={styles.kicker}>El siguiente paso está en Wilo Express</span>
          <h2 id="express-siguiente">Mira los diseños y solicita tu página en el sitio oficial del producto.</h2>
          <div>
            <ExternalCta inverse>Abrir wilo.site</ExternalCta>
            <p><strong>S/30 al mes.</strong> Enviar una solicitud no genera un cobro ni activa automáticamente la suscripción.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
