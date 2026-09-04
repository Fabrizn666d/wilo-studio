import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { studioProjects } from "@/data/studio";
import { siteConfig } from "@/lib/content";
import { getStudioProject, getStudioProjects } from "@/lib/studio-projects";
import styles from "../proyectos.module.css";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = true;

export function generateStaticParams() {
  return studioProjects.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getStudioProject(slug);

  if (!project) {
    return {
      title: "Proyecto no encontrado",
      robots: { index: false, follow: false },
    };
  }

  const canonical = `/proyectos/${project.slug}`;
  const title = project.seoTitle || `${project.name} — Caso de estudio`;
  const projectDescription = project.seoDescription || project.shortDescription;

  return {
    title,
    description: projectDescription,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: `${title} | Wilo Studio`,
      description: projectDescription,
      url: canonical,
      images: [{ url: project.poster, alt: `Proyecto ${project.name} de Wilo Studio` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Wilo Studio`,
      description: projectDescription,
      images: [project.poster],
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const projects = await getStudioProjects();
  const project = projects.find((item) => item.slug === slug);

  if (!project) notFound();

  const currentIndex = projects.findIndex((item) => item.slug === project.slug);
  const nextProject = projects[(currentIndex + 1) % projects.length];
  const projectNumber = String(currentIndex + 1).padStart(2, "0");
  const projectTotal = String(projects.length).padStart(2, "0");

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Proyectos", item: `${siteConfig.url}/proyectos` },
      { "@type": "ListItem", position: 3, name: project.name, item: `${siteConfig.url}/proyectos/${project.slug}` },
    ],
  };

  return (
    <main id="contenido" className={`${styles.page} ${styles.casePage} ${styles[project.theme]}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c") }}
      />

      <section className={styles.caseHero} aria-labelledby="case-title">
        <div className={styles.shell}>
          <nav className={styles.breadcrumb} aria-label="Migas de pan">
            <Link href="/">Inicio</Link>
            <span aria-hidden="true">/</span>
            <Link href="/proyectos">Proyectos</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{project.name}</span>
          </nav>

          <Link className={styles.backLink} href="/proyectos">
            <ArrowLeft aria-hidden="true" /> Todos los proyectos
          </Link>

          <div className={styles.caseHeading}>
            <div>
              <span className={styles.caseCounter}>{projectNumber} / {projectTotal}</span>
              <span className={styles.caseDescriptor}>{project.descriptor}</span>
              <h1 id="case-title">{project.name}</h1>
            </div>
            <div className={styles.caseIntro}>
              <p>{project.shortDescription}</p>
              <div className={styles.heroTags} aria-label="Servicios del proyecto">
                {project.services.map((service) => <span key={service}>{service}</span>)}
              </div>
            </div>
          </div>

          <figure className={styles.caseMedia}>
            <div className={styles.browserBar} aria-hidden="true">
              <span><i /><i /><i /></span>
              <small>Vista del proyecto</small>
            </div>
            <div className={styles.caseMediaViewport}>
              {project.video ? (
                <video
                  controls
                  loop
                  muted
                  playsInline
                  poster={project.poster}
                  preload="metadata"
                  aria-label={`Video de presentación del proyecto ${project.name}`}
                >
                  <source src={project.video} type={project.video.toLowerCase().endsWith(".mp4") ? "video/mp4" : "video/webm"} />
                  Tu navegador no puede reproducir este video.
                </video>
              ) : (
                <Image
                  src={project.poster}
                  alt={`Vista principal del proyecto ${project.name}`}
                  fill
                  priority
                  quality={90}
                  sizes="100vw"
                />
              )}
            </div>
          </figure>
        </div>
      </section>

      <section className={styles.summarySection} aria-labelledby="summary-title">
        <div className={styles.shell}>
          <div className={styles.summaryGrid}>
            <header>
              <span className={styles.eyebrow}>Resumen</span>
              <p>{project.descriptor}</p>
            </header>
            <h2 id="summary-title">{project.summary}</h2>
          </div>
        </div>
      </section>

      <section className={styles.approachSection} aria-labelledby="approach-title">
        <div className={styles.shell}>
          <header className={styles.approachHeading}>
            <span className={styles.eyebrow}>Del contexto a la respuesta</span>
            <h2 id="approach-title">Decisiones construidas alrededor del proyecto.</h2>
          </header>
          <div className={styles.approachGrid}>
            <article>
              <span>01</span>
              <h3>El desafío</h3>
              <p>{project.challenge}</p>
            </article>
            <article>
              <span>02</span>
              <h3>La solución</h3>
              <p>{project.solution}</p>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.deliverySection} aria-labelledby="delivery-title">
        <div className={styles.shell}>
          <header className={styles.deliveryHeading}>
            <span className={styles.eyebrow}>Alcance documentado</span>
            <h2 id="delivery-title">Qué construimos y qué entregamos.</h2>
          </header>
          <div className={styles.deliveryGrid}>
            <div>
              <span className={styles.listLabel}>Servicios</span>
              <ul>
                {project.services.map((service) => (
                  <li key={service}><Check aria-hidden="true" /> {service}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className={styles.listLabel}>Entregables</span>
              <ul>
                {project.deliverables.map((deliverable) => (
                  <li key={deliverable}><Check aria-hidden="true" /> {deliverable}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {project.gallery && project.gallery.length > 0 ? (
        <section className={styles.gallerySection} aria-labelledby="gallery-title">
          <div className={styles.shell}>
            <header className={styles.galleryHeading}>
              <div>
                <span className={styles.eyebrow}>Recorrido visual</span>
                <h2 id="gallery-title">Detalles del proyecto.</h2>
              </div>
              <p>Material disponible de la experiencia y sus aplicaciones.</p>
            </header>
            <div className={styles.galleryGrid}>
              {project.gallery.map((image, index) => (
                <figure className={styles.galleryItem} key={image}>
                  <Image
                    src={image}
                    alt={`${project.name}: vista ${index + 1} del proyecto`}
                    fill
                    quality={90}
                    sizes="(max-width: 720px) 100vw, 86vw"
                  />
                  <figcaption>Vista {String(index + 1).padStart(2, "0")}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className={styles.nextSection} aria-labelledby="next-project-title">
        <div className={styles.shell}>
          <Link className={`${styles.nextProject} ${styles[nextProject.theme]}`} href={`/proyectos/${nextProject.slug}`}>
            <div className={styles.nextCopy}>
              <span>Siguiente proyecto <ArrowRight aria-hidden="true" /></span>
              <h2 id="next-project-title">{nextProject.name}</h2>
              <p>{nextProject.shortDescription}</p>
            </div>
            <div className={styles.nextMedia}>
              <Image
                src={nextProject.poster}
                alt={`Vista del siguiente proyecto, ${nextProject.name}`}
                fill
                quality={90}
                sizes="(max-width: 780px) 100vw, 42vw"
              />
              <span aria-hidden="true"><ArrowUpRight /></span>
            </div>
          </Link>
        </div>
      </section>

      <section className={styles.cta} aria-labelledby="case-cta-title">
        <div className={styles.shell}>
          <div>
            <span className={styles.eyebrow}>Construyamos</span>
            <h2 id="case-cta-title">Tu proyecto necesita su propia respuesta.</h2>
          </div>
          <div>
            <p>Conversemos sobre el contexto, el alcance y la solución que necesitas poner en marcha.</p>
            <Link className={styles.primaryButton} href="/contacto">
              Iniciar un proyecto <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
