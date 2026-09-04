import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { studioProjects as fallbackProjects } from "@/data/studio";
import { siteConfig } from "@/lib/content";
import { getStudioProjects } from "@/lib/studio-projects";
import styles from "./proyectos.module.css";

const featuredProject = fallbackProjects.find((project) => "featured" in project && project.featured) ?? fallbackProjects[0];

const description =
  "Casos de estudio de Wilo Studio: plataformas, catálogos, sitios corporativos y sistemas visuales construidos para necesidades reales.";

export const metadata: Metadata = {
  title: "Proyectos",
  description,
  alternates: { canonical: "/proyectos" },
  openGraph: {
    title: "Proyectos | Wilo Studio",
    description,
    url: "/proyectos",
    images: [{ url: featuredProject.poster, alt: `Proyecto ${featuredProject.name} de Wilo Studio` }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Proyectos | Wilo Studio",
    description,
    images: [featuredProject.poster],
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Inicio", item: siteConfig.url },
    { "@type": "ListItem", position: 2, name: "Proyectos", item: `${siteConfig.url}/proyectos` },
  ],
};

export default async function ProjectsPage() {
  const projects = await getStudioProjects();
  const currentFeaturedProject = projects.find((project) => project.featured) ?? projects[0];
  return (
    <main id="contenido" className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />

      <section className={styles.hero} aria-labelledby="projects-title">
        <div className={styles.shell}>
          <nav className={styles.breadcrumb} aria-label="Migas de pan">
            <Link href="/">Inicio</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Proyectos</span>
          </nav>

          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <span className={styles.eyebrow}>Casos de estudio</span>
              <h1 id="projects-title">
                Trabajo real, contado con <em>claridad.</em>
              </h1>
              <p>
                Una selección de plataformas, catálogos, sitios corporativos y piezas de identidad desarrolladas a partir de necesidades concretas.
              </p>
              <a className={styles.scrollLink} href="#seleccion">
                Explorar proyectos <ArrowDownRight aria-hidden="true" />
              </a>
            </div>

            <Link
              className={`${styles.heroProject} ${styles[currentFeaturedProject.theme]}`}
              href={`/proyectos/${currentFeaturedProject.slug}`}
              aria-label={`Explorar el proyecto ${currentFeaturedProject.name}`}
            >
              <div className={styles.heroProjectMedia}>
                <Image
                  src={currentFeaturedProject.poster}
                  alt={`Vista del proyecto ${currentFeaturedProject.name}`}
                  fill
                  priority
                  quality={90}
                  sizes="(max-width: 900px) 100vw, 48vw"
                />
              </div>
              <div className={styles.heroProjectCaption}>
                <span>Proyecto destacado</span>
                <strong>{currentFeaturedProject.name}</strong>
                <ArrowUpRight aria-hidden="true" />
              </div>
            </Link>
          </div>

          <div className={styles.heroFooter} aria-label={`${projects.length} proyectos documentados`}>
            <span>{String(projects.length).padStart(2, "0")} proyectos</span>
            <p>Diseño, tecnología y producción conectados a cada contexto.</p>
          </div>
        </div>
      </section>

      <section className={styles.collection} id="seleccion" aria-labelledby="selection-title">
        <div className={styles.shell}>
          <header className={styles.sectionHeading}>
            <div>
              <span className={styles.eyebrow}>Selección Wilo</span>
              <h2 id="selection-title">Cada proyecto parte de un problema distinto.</h2>
            </div>
            <p>
              Recorre el contexto, la respuesta y las entregas disponibles de cada trabajo. Solo publicamos información respaldada por el material del proyecto.
            </p>
          </header>

          <div className={styles.projectGrid}>
            {projects.map((project, index) => (
              <article className={`${styles.projectCard} ${styles[project.theme]}`} key={project.slug}>
                <Link href={`/proyectos/${project.slug}`}>
                  <div className={styles.cardMedia}>
                    <Image
                      src={project.poster}
                      alt={`Vista principal del proyecto ${project.name}`}
                      fill
                      quality={90}
                      sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 44vw"
                    />
                    <span className={styles.cardNumber}>{String(index + 1).padStart(2, "0")}</span>
                    <span className={styles.cardAction} aria-hidden="true"><ArrowUpRight /></span>
                  </div>
                  <div className={styles.cardCopy}>
                    <span>{project.descriptor}</span>
                    <h3>{project.name}</h3>
                    <p>{project.shortDescription}</p>
                    <ul aria-label={`Servicios de ${project.name}`}>
                      {project.services.slice(0, 4).map((service) => <li key={service}>{service}</li>)}
                    </ul>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.cta} aria-labelledby="projects-cta-title">
        <div className={styles.shell}>
          <div>
            <span className={styles.eyebrow}>Tu proyecto</span>
            <h2 id="projects-cta-title">¿Qué necesitas construir?</h2>
          </div>
          <div>
            <p>Cuéntanos el contexto, el objetivo y lo que hoy está frenando la idea.</p>
            <Link className={styles.primaryButton} href="/contacto">
              Iniciar un proyecto <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
