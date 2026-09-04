import Image from "next/image";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { PublicHero, RouteCta, SectionHeading } from "./route-ui";

export type ServiceProject = {
  title: string;
  label: string;
  image: string;
};

export type ServiceDetailData = {
  eyebrow: string;
  title: React.ReactNode;
  description: string;
  tone: "yellow" | "cream" | "dark";
  image: string;
  imageAlt: string;
  badge: string;
  statement: string;
  intro: string;
  capabilities: readonly { title: string; text: string; items: readonly string[] }[];
  process: readonly { number: string; title: string; text: string }[];
  projects?: readonly ServiceProject[];
  showcase?: { image: string; alt: string; caption: string };
  ctaTitle: string;
  ctaMessage: string;
};

export function ServiceDetailPage({ data }: { data: ServiceDetailData }) {
  return (
    <main id="contenido" className="pr-page">
      <PublicHero
        badge={data.badge}
        description={data.description}
        eyebrow={data.eyebrow}
        image={data.image}
        imageAlt={data.imageAlt}
        tone={data.tone}
        title={data.title}
      >
        <a className={data.tone === "dark" ? "pr-button pr-button--yellow" : "pr-button pr-button--dark"} href="#capacidades">
          Explorar capacidades <ArrowUpRight aria-hidden="true" size={18} />
        </a>
        <a className={data.tone === "dark" ? "pr-button pr-button--line-light" : "pr-button pr-button--line"} href="#proceso">
          Cómo trabajamos
        </a>
      </PublicHero>

      <section className="pr-section pr-intro-band">
        <div className="pr-shell pr-intro-band__grid">
          <p className="pr-display-quote">{data.statement}</p>
          <p>{data.intro}</p>
        </div>
      </section>

      <section className="pr-section pr-section--paper" id="capacidades">
        <div className="pr-shell">
          <SectionHeading
            description="Definimos cada alcance alrededor del objetivo real del negocio y dejamos los entregables por escrito antes de empezar."
            eyebrow="Capacidades"
            title={<>Una solución completa, <em>sin piezas sueltas.</em></>}
          />
          <div className="pr-capability-grid">
            {data.capabilities.map((capability, index) => (
              <article className="pr-capability-card" key={capability.title}>
                <span>0{index + 1}</span>
                <h3>{capability.title}</h3>
                <p>{capability.text}</p>
                <ul>
                  {capability.items.map((item) => (
                    <li key={item}><CheckCircle2 aria-hidden="true" size={16} /> {item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pr-section pr-section--dark" id="proceso">
        <div className="pr-shell">
          <SectionHeading
            description="Un recorrido ordenado mantiene alineados a tu equipo y al nuestro, desde el diagnóstico hasta la entrega."
            eyebrow="Método"
            inverse
            title={<>Claridad en cada <em>momento clave.</em></>}
          />
          <div className="pr-process-grid">
            {data.process.map((step) => (
              <article key={step.number}>
                <span>{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {data.projects?.length ? (
        <section className="pr-section pr-section--cream">
          <div className="pr-shell">
            <SectionHeading eyebrow="Trabajo real" title={<>Proyectos que ya están <em>en movimiento.</em></>} />
            <div className="pr-project-strip">
              {data.projects.map((project) => (
                <figure key={project.title}>
                  <div><Image alt={`Proyecto ${project.title}`} fill sizes="(max-width: 760px) 100vw, 33vw" src={project.image} /></div>
                  <figcaption><span>{project.label}</span><strong>{project.title}</strong></figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {data.showcase ? (
        <section className="pr-section pr-section--cream">
          <div className="pr-shell pr-showcase">
            <div>
              <span className="pr-kicker">Presentación comercial</span>
              <h2>Producción integrada, <em>una sola coordinación.</em></h2>
              <p>{data.showcase.caption}</p>
            </div>
            <figure>
              <Image alt={data.showcase.alt} fill sizes="(max-width: 760px) 100vw, 55vw" src={data.showcase.image} />
            </figure>
          </div>
        </section>
      ) : null}

      <RouteCta message={data.ctaMessage} title={data.ctaTitle} />
    </main>
  );
}
