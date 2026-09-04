import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Blocks,
  Building2,
  Check,
  Lightbulb,
  RotateCcw,
  Shapes,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { EducationCatalog } from "@/components/public-routes/education-catalog";
import { EducationLeadForm } from "@/components/public-routes/education-lead-form";
import { RouteCta } from "@/components/public-routes/route-ui";
import styles from "./education.module.css";

export const metadata: Metadata = {
  title: "Wilo Education | Exploración tecnológica y STEM",
  description:
    "Conoce Wilo Education: experiencias de exploración tecnológica, construcción y aprendizaje práctico. Consulta únicamente kits con ficha publicada.",
  keywords: ["Wilo Education", "educación STEM Perú", "robótica educativa Arequipa", "aprendizaje práctico"],
  alternates: { canonical: "/education" },
  openGraph: {
    title: "Wilo Education | Construimos el futuro",
    description: "Exploración, construcción y retos prácticos para despertar curiosidad.",
    url: "/education",
    images: [
      {
        url: "/images/wilo/generated/education-robot-v2.webp",
        width: 1400,
        height: 933,
        alt: "Ilustración conceptual de Wilo Education",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wilo Education",
    description: "Exploración, construcción y retos prácticos para despertar curiosidad.",
    images: ["/images/wilo/generated/education-robot-v2.webp"],
  },
};

const principles = [
  {
    icon: Lightbulb,
    number: "01",
    title: "Imaginar",
    text: "Empezar con una pregunta y convertirla en una idea que se pueda explorar.",
  },
  {
    icon: Blocks,
    number: "02",
    title: "Construir",
    text: "Dar forma a esa idea, observar cómo responde y entender sus partes.",
  },
  {
    icon: RotateCcw,
    number: "03",
    title: "Iterar",
    text: "Probar, detectar oportunidades y volver a intentarlo con una nueva decisión.",
  },
] as const;

const audiences = [
  {
    icon: UsersRound,
    title: "Familias",
    text: "Para quienes buscan experiencias de construcción y exploración tecnológica en casa.",
  },
  {
    icon: Building2,
    title: "Colegios e instituciones",
    text: "Podemos evaluar necesidades por grupo y plantear un alcance antes de confirmar cualquier programa.",
  },
  {
    icon: Shapes,
    title: "Talleres y grupos",
    text: "Consultas para actividades guiadas cuyo formato, materiales y disponibilidad se definen caso por caso.",
  },
] as const;

export default function EducationPage() {
  return (
    <main id="contenido" className={`pr-page ${styles.page}`}>
      <header className={styles.hero}>
        <div className={styles.heroGrid} aria-hidden="true" />
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.shell}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}>
              <span>Wilo</span> Education
            </div>
            <p className={styles.chapter}>01 · Tecnología que se aprende</p>
            <h1>
              Educamos hoy,
              <br />
              construimos el <em>futuro.</em>
            </h1>
            <p className={styles.lead}>
              Una línea de Wilo orientada a la exploración tecnológica, la construcción y el aprendizaje mediante retos prácticos.
            </p>
            <div className={styles.actions}>
              <a className={styles.primaryButton} href="#kits">
                Explorar catálogo <ArrowRight aria-hidden="true" />
              </a>
              <a className={styles.secondaryButton} href="#education-contact">
                Hacer una consulta <ArrowUpRight aria-hidden="true" />
              </a>
            </div>
            <p className={styles.truthNote}>
              El catálogo muestra solo productos con ficha publicada. Edades, componentes, stock y alcance se confirman antes de cada compra o propuesta.
            </p>
          </div>

          <figure className={styles.robotStage}>
            <div className={styles.robotOrbit} aria-hidden="true" />
            <span className={`${styles.floatingToken} ${styles.tokenOne}`} aria-hidden="true">
              STEM
            </span>
            <span className={`${styles.floatingToken} ${styles.tokenTwo}`} aria-hidden="true">
              01
            </span>
            <span className={`${styles.floatingToken} ${styles.tokenThree}`} aria-hidden="true">
              W
            </span>
            <Image
              alt="Ilustración conceptual de un robot educativo modular de Wilo Education"
              className={styles.robotImage}
              fill
              priority
              sizes="(max-width: 820px) 92vw, 52vw"
              src="/images/wilo/generated/education-robot-v2.webp"
            />
            <figcaption>Ilustración conceptual · La configuración final depende de cada ficha.</figcaption>
          </figure>
        </div>
      </header>

      <section className={styles.ideaSection} aria-labelledby="education-idea-title">
        <div className={styles.shell}>
          <div className={styles.sectionIntro}>
            <p className={styles.kicker}>02 · La idea</p>
            <h2 id="education-idea-title">
              Aprender sucede cuando las manos también <em>piensan.</em>
            </h2>
            <p>
              Wilo Education propone acercarse a la tecnología sin empezar por respuestas cerradas: primero se observa, después se construye y finalmente se mejora.
            </p>
          </div>
          <div className={styles.principleGrid}>
            {principles.map(({ icon: Icon, number, title, text }) => (
              <article key={title}>
                <div className={styles.cardTop}>
                  <Icon aria-hidden="true" />
                  <span>{number}</span>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.audienceSection} aria-labelledby="education-audiences-title">
        <div className={styles.shell}>
          <div className={styles.audienceHeading}>
            <div>
              <p className={styles.kicker}>03 · Para quién</p>
              <h2 id="education-audiences-title">Distintos contextos. La misma curiosidad.</h2>
            </div>
            <p>
              Cuéntanos el contexto y el objetivo. Recién con esa información confirmamos qué producto o formato puede corresponder.
            </p>
          </div>
          <div className={styles.audienceGrid}>
            {audiences.map(({ icon: Icon, title, text }) => (
              <article key={title}>
                <Icon aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
                <a href="#education-contact">
                  Consultar <ArrowUpRight aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.catalogSection} id="kits" aria-labelledby="education-catalog-title">
        <div className={styles.shell}>
          <div className={styles.catalogHeading}>
            <div>
              <p className={styles.kicker}>04 · Catálogo conectado</p>
              <h2 id="education-catalog-title">
                Kits con información <em>publicada.</em>
              </h2>
            </div>
            <p>
              Esta sección consulta la categoría Wilo Education de la tienda. Si una ficha aún no tiene datos confirmados, no se presenta como producto disponible.
            </p>
          </div>
          <div className={styles.catalogFrame}>
            <EducationCatalog />
          </div>
        </div>
      </section>

      <section className={styles.criteriaSection} aria-labelledby="education-criteria-title">
        <div className={styles.shell}>
          <div className={styles.criteriaCopy}>
            <p className={styles.kicker}>05 · Criterio Wilo</p>
            <h2 id="education-criteria-title">Primero verificamos. Después recomendamos.</h2>
            <p>
              No publicamos especificaciones por aproximación. Cada ficha debe declarar con claridad lo que incluye y qué está pendiente de confirmar.
            </p>
          </div>
          <ul className={styles.criteriaList}>
            <li>
              <Check aria-hidden="true" /> <span>Componentes e instrucciones según la ficha vigente</span>
            </li>
            <li>
              <Check aria-hidden="true" /> <span>Edad sugerida solo cuando esté validada</span>
            </li>
            <li>
              <Check aria-hidden="true" /> <span>Precio, stock y entrega visibles antes de comprar</span>
            </li>
            <li>
              <Check aria-hidden="true" /> <span>Alcances institucionales confirmados en una propuesta</span>
            </li>
          </ul>
          <Sparkles className={styles.criteriaMark} aria-hidden="true" />
        </div>
      </section>

      <section className={styles.faqSection} aria-labelledby="education-faq-title">
        <div className={styles.shell}>
          <div className={styles.faqHeading}>
            <p className={styles.kicker}>06 · Antes de elegir</p>
            <h2 id="education-faq-title">Preguntas frecuentes.</h2>
          </div>
          <div className={styles.faqList}>
            <details>
              <summary>¿Para qué edades están pensados?</summary>
              <p>Depende de cada producto. La edad sugerida aparecerá únicamente cuando esté validada en su ficha.</p>
            </details>
            <details>
              <summary>¿Qué incluye cada kit?</summary>
              <p>La ficha publicada indicará los componentes confirmados. Si una configuración sigue pendiente, lo diremos de forma explícita.</p>
            </details>
            <details>
              <summary>¿Puedo consultar una propuesta para una institución?</summary>
              <p>Sí. Primero revisamos cantidad de participantes, edades, objetivo, ciudad y fechas; luego confirmamos si existe un alcance viable.</p>
            </details>
            <details>
              <summary>¿Cómo confirmo precio, stock y entrega?</summary>
              <p>Esos datos aparecen en la tienda cuando están publicados. También puedes enviarnos una consulta para verificarlos.</p>
            </details>
          </div>
        </div>
      </section>

      <section className={styles.formSection} id="education-contact" aria-label="Formulario de consulta de Wilo Education">
        <div className={styles.shell}>
          <EducationLeadForm />
        </div>
      </section>

      <RouteCta
        message="Hola Wilo Studio, quiero información sobre Wilo Education."
        text="Cuéntanos el contexto, edades aproximadas y objetivo. Confirmaremos qué información y opciones están realmente disponibles."
        title="Convirtamos la curiosidad en el próximo reto."
      />

      <Link className={styles.backToTop} href="#contenido" aria-label="Volver al inicio de Wilo Education">
        Wilo Education <ArrowUpRight aria-hidden="true" />
      </Link>
    </main>
  );
}
