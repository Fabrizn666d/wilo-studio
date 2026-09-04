import Image from "next/image";
import Link from "next/link";
import { HeroNavigation } from "./HeroNavigation";
import { HeroPointerGrid } from "./HeroPointerGrid";
import styles from "./hero-wilo.module.css";

export function HeroWilo() {
  return (
    <>
      <HeroNavigation />
      <section
        id="inicio"
        className={styles.hero}
        aria-labelledby="wilo-hero-title"
        data-fullpage-section="hero"
        data-hero-pointer-root
      >
      <div className={styles.background} aria-hidden="true" data-loader-hero-media>
        <Image
          className={styles.backgroundImage}
          src="/images/wilo/hero/misti.webp"
          alt=""
          data-loader-asset
          fill
          priority
          quality={90}
          sizes="100vw"
        />
      </div>
      <div className={styles.cinematicOverlays} aria-hidden="true" />
      <HeroPointerGrid className={styles.pointerGrid} />
      <div className={styles.lightStreaks} aria-hidden="true">
        <i /><i /><i /><i /><i /><i />
      </div>
      <div className={styles.content}>
        <div className={`${styles.availability} ${styles.revealBadge}`}>
          <i aria-hidden="true" />
          <span>Diseño · tecnología · producción</span>
        </div>
        <h1 id="wilo-hero-title" className={`${styles.title} ${styles.revealTitle}`}>
          <span>WILO</span>{" "}<span>STUDIO</span>
        </h1>
        <p className={`${styles.subtitle} ${styles.revealSubtitle}`}>
          Diseñamos <strong>experiencias digitales</strong>, plataformas y <strong>producción visual</strong> para
          convertir tu negocio en una <strong>autoridad</strong> moderna, profesional y lista para crecer.
        </p>
        <div className={`${styles.actions} ${styles.revealActions}`}>
          <Link className={styles.primaryAction} href="/#trabajos">
            Ver proyectos <span aria-hidden="true">↗</span>
          </Link>
          <Link className={styles.secondaryAction} href="/contacto#cotizador">
            Iniciar un proyecto <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className={styles.mascotStage} data-loader-mascot>
          <div className={styles.mascotFloat}>
            <Image
              className={styles.mascotImage}
              src="/images/wilo/hero/chameleon-pc.webp"
              alt="Mascota camaleón de Wilo Studio sobre una computadora"
              data-loader-asset
              width={1000}
              height={1250}
              priority
              quality={95}
              sizes="(max-width: 767px) 78vw, (max-width: 1023px) 54vw, 29vw"
            />
          </div>
        </div>
      </div>

      <div className={styles.bottomRule} aria-hidden="true" />
      <div className={styles.metadata} aria-label="Ubicación del paisaje del hero">
        <span><i aria-hidden="true">[</i> AREQUIPA, PERÚ <i aria-hidden="true">]</i></span>
        <span><i aria-hidden="true">[</i> MISTI · AREQUIPA <i aria-hidden="true">]</i></span>
      </div>
      </section>
    </>
  );
}
