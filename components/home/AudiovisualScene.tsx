import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Camera, Clapperboard, Film, Radio, SlidersHorizontal, Video } from "lucide-react";
import { FullBleedSection, ViewportFrame } from "./HomeLayout";
import { EditorialTilt } from "./EditorialTilt";
import styles from "./editorial-scenes.module.css";

const frames = [
  { src: "/images/wilo/generated/about-arequipa-v2.webp", title: "Desde Arequipa", position: "72% center" },
  { src: "/images/wilo/generated/audiovisual-set-v2.webp", title: "Detrás de cada historia", position: "85% center" },
  { src: "/services/branding/visual.webp", title: "Identidad y producto", position: "center" },
  { src: "/ecosystem/events/events-stage.webp", title: "Experiencias en vivo", position: "center" },
  { src: "/services/audiovisual/visual.webp", title: "Producción y contenido", position: "center" },
  { src: "/images/wilo/projects/biciem.webp", title: "Historias en movimiento", position: "center" },
];
const services = [
  { Icon: Video, title: "Video corporativo" },
  { Icon: Camera, title: "Fotografía comercial" },
  { Icon: Clapperboard, title: "Producto y lifestyle" },
  { Icon: Radio, title: "Eventos en vivo" },
  { Icon: Film, title: "Contenido para redes" },
  { Icon: SlidersHorizontal, title: "Edición y postproducción" },
];

export function AudiovisualScene() {
  return (
    <FullBleedSection id="audiovisual" className={`${styles.section} ${styles.audiovisual}`} aria-labelledby="audiovisual-title" data-scene-theme="light" spacing="scene">
      <ViewportFrame size="wide" className={styles.sceneFrame}>
        <div className={styles.audiovisualTop}>
          <div className={styles.avCopy}>
            <span className={styles.eyebrow} data-reveal="detail">06 <i /> PRODUCCIÓN AUDIOVISUAL</span>
            <h2 id="audiovisual-title" data-reveal="title">UNA IDEA<br />NO SOLO SE CUENTA.<br /><em>SE HACE SENTIR.</em></h2>
            <p data-reveal="detail">Creamos contenido que conecta, emociona y genera resultados reales para tu marca.</p>
            <Link className={styles.darkButton} href="/servicios/produccion-audiovisual" data-reveal="detail">Explorar producción <ArrowUpRight aria-hidden="true" /></Link>
            <ul className={styles.avServices} data-reveal="detail">{services.map(({ Icon, title }) => <li key={title}><Icon aria-hidden="true" /><span>{title}</span></li>)}</ul>
          </div>
          <EditorialTilt className={styles.contactSheet}>
            <figure className={`${styles.photo} ${styles.mainPhoto}`} data-reveal="media">
              <div><Image src="/images/wilo/generated/audiovisual-set-v2.webp" alt="Cámara de cine profesional en un set de producción" fill sizes="(max-width: 760px) 90vw, 48vw" style={{ objectPosition: "80% center" }} /></div>
              <figcaption><span className={styles.record}>REC</span><span>FRAME 024 · WILO STUDIO</span></figcaption>
            </figure>
            <figure className={`${styles.photo} ${styles.cameraPhoto}`} data-reveal="media">
              <div><Image src="/services/audiovisual/visual.webp" alt="Cámara y herramientas de producción audiovisual" fill sizes="(max-width: 760px) 40vw, 19vw" /></div><figcaption>CAM A <span>00:13:24</span></figcaption>
            </figure>
            <figure className={`${styles.photo} ${styles.cityPhoto}`} data-reveal="media">
              <div><Image src="/images/wilo/generated/about-arequipa-v2.webp" alt="Arequipa y sus historias, con el Misti al fondo" fill sizes="(max-width: 760px) 40vw, 19vw" style={{ objectPosition: "80% center" }} /></div><figcaption>Arequipa también se cuenta así.</figcaption>
            </figure>
            <figure className={`${styles.photo} ${styles.eventPhoto}`} data-reveal="media">
              <div><Image src="/ecosystem/events/events-stage.webp" alt="Luces, escenario y producción de un evento" fill sizes="(max-width: 760px) 40vw, 18vw" /></div><figcaption>Eventos que dejan huella.</figcaption>
            </figure>
            <span className={`${styles.handwritten} ${styles.avNote}`} data-reveal="detail">Historias<br />que generan<br />movimiento.<i>⤵</i></span>
          </EditorialTilt>
        </div>
        <div className={styles.filmstrip} data-reveal="media" aria-label="Una mirada a nuestra producción">
          <div className={styles.filmTrack}>{[0, 1].map((copy) => <div className={styles.filmGroup} key={copy} aria-hidden={copy === 1 || undefined}>{frames.map((frame, index) => <Link href="/servicios/produccion-audiovisual" className={styles.filmFrame} key={frame.title} tabIndex={copy === 1 ? -1 : undefined} aria-label={frame.title}><Image src={frame.src} alt={copy ? "" : frame.title} fill sizes="220px" style={{ objectPosition: frame.position }} /><span>{String(index + 1).padStart(2, "0")}</span></Link>)}</div>)}</div>
        </div>
        <div className={styles.sceneFooter} data-reveal="detail"><span>WILO STUDIO · PRODUCCIÓN AUDIOVISUAL</span><span>IDEAS · PERSONAS · HISTORIAS REALES</span></div>
      </ViewportFrame>
    </FullBleedSection>
  );
}
