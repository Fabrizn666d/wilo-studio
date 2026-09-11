import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CodeXml, Database, Network } from "lucide-react";
import { FullBleedSection, ViewportFrame } from "./HomeLayout";
import styles from "./editorial-scenes.module.css";

const capabilities = [
  {
    Icon: CodeXml,
    title: "Producto a medida",
    text: "Frontend, backend y motion creados alrededor de cada idea.",
    color: "#3678ff",
  },
  {
    Icon: Database,
    title: "Datos e integraciones",
    text: "APIs y datos conectados para una operación realmente útil.",
    color: "#7654f5",
  },
  {
    Icon: Network,
    title: "Infraestructura preparada",
    text: "Bases sólidas para lanzar, medir y crecer con confianza.",
    color: "#00a68f",
  },
];

const techLogos = [
  ["React", "/tech/react.svg"],
  ["Next.js", "/tech/next.svg"],
  ["TypeScript", "/tech/typescript.svg"],
  ["Node.js", "/tech/node.svg"],
  ["PostgreSQL", "/tech/postgresql.svg"],
  ["Prisma", "/tech/prisma.svg"],
  ["GitHub", "/tech/github.svg"],
  ["Tailwind CSS", "/tech/tailwind.svg"],
] as const;

export function TechnologyScene() {
  return (
    <FullBleedSection
      id="tecnologia"
      className={`${styles.section} ${styles.technology}`}
      aria-labelledby="technology-title"
      data-scene-theme="light"
      spacing="scene"
    >
      <span className={styles.watermark} aria-hidden="true">W</span>
      <ViewportFrame size="wide" className={styles.sceneFrame}>
        <div className={styles.technologyTop}>
          <div className={styles.techCopy}>
            <span className={styles.eyebrow} data-reveal="detail">08 <i /> TECNOLOGÍA WILO</span>
            <h2 id="technology-title" data-reveal="title">
              TECNOLOGÍA<br />
              <em>QUE HACE POSIBLE</em><br />
              LO IMPOSIBLE.
            </h2>
            <p data-reveal="detail">
              Diseñamos soluciones digitales a medida con frontend, backend, infraestructura,
              APIs, datos y motion. Tecnología moderna para productos reales que crecen contigo.
            </p>
            <Link href="/#servicios" className={styles.darkButton} data-reveal="detail">
              Conoce nuestras soluciones <ArrowRight aria-hidden="true" />
            </Link>
          </div>

          <div className={styles.techVisual} data-reveal="media">
            <span className={styles.techGlow} aria-hidden="true" />
            <Image
              className={styles.techHeroImage}
              src="/images/wilo/technology/technology-laptop.png"
              alt="Laptop de Wilo Studio rodeada por tecnologías de frontend, backend, datos e infraestructura"
              fill
              priority
              sizes="(max-width: 900px) 96vw, 66vw"
            />
            <span className={`${styles.handwritten} ${styles.stageNote}`} aria-hidden="true">
              Más que herramientas,<br />posibilidades.
            </span>
          </div>
        </div>

        <ul className={styles.techCapabilities} data-reveal="detail">
          {capabilities.map(({ Icon, title, text, color }) => (
            <li key={title} style={{ "--tech-color": color } as React.CSSProperties}>
              <Icon aria-hidden="true" />
              <span>
                <h3>{title}</h3>
                <p>{text}</p>
              </span>
            </li>
          ))}
        </ul>

        <div className={styles.stackMarquee} data-reveal="detail" aria-label="Tecnologías utilizadas por Wilo Studio">
          <span className={styles.stackLabel}>TECNOLOGÍAS<br />QUE NOS IMPULSAN</span>
          <div className={styles.stackMarqueeViewport}>
            <div className={styles.stackMarqueeTrack}>
              {[0, 1].map((copy) => (
                <div className={styles.stackMarqueeGroup} aria-hidden={copy === 1 || undefined} key={copy}>
                  {techLogos.map(([name, source]) => (
                    <span className={styles.stackLogoCard} key={`${copy}-${name}`}>
                      <Image
                        className={styles.stackLogo}
                        src={source}
                        alt={copy === 0 ? name : ""}
                        width={132}
                        height={36}
                        loading="eager"
                        sizes="132px"
                      />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

      </ViewportFrame>
    </FullBleedSection>
  );
}
