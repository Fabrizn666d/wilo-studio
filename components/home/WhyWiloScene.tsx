import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Heart, Headphones, Layers3, PenLine, Settings2, ShieldCheck, Target, Users, Zap } from "lucide-react";
import { FullBleedSection, ViewportFrame } from "./HomeLayout";
import styles from "./why-wilo-scene.module.css";

const reasons = [
  {title:"Pensado para tu negocio",text:"No usamos una plantilla cerrada.",icon:Target,tone:"gold"},
  {title:"Acompañamiento real",text:"Seguimos después del lanzamiento.",icon:Users,tone:"cyan"},
  {title:"Operación clara",text:"Dominio, hosting, correos, paneles y soporte en orden.",icon:Settings2,tone:"violet"},
  {title:"Contenido que conecta",text:"Diseño, audiovisual y experiencia con propósito.",icon:Heart,tone:"coral"},
] as const;

export function WhyWiloScene() {
  return (
    <FullBleedSection id="confianza" aria-labelledby="why-wilo-title" className={styles.section}>
      <span className={styles.watermark} aria-hidden="true">W</span>
      <ViewportFrame size="wide" className={styles.frame}>
        <div className={styles.layout}>
          <div className={styles.copy}>
            <span className={styles.eyebrow} data-reveal>POR QUÉ TRABAJAR CON WILO</span>
            <h2 id="why-wilo-title" data-reveal>No vendemos<br />plantillas.<br /><em>Construimos</em><br />soluciones que sí<br />encajan contigo.</h2>
            <p data-reveal>Diseñamos sitios web, sistemas, contenido y herramientas digitales alineadas a tu negocio. Solo trabajo real, estrategia y resultados que puedes ver y usar.</p>
            <div className={styles.actions} data-reveal><Link href="#proceso">Ver cómo trabajamos <ArrowRight aria-hidden="true" /></Link><span><ShieldCheck aria-hidden="true" />Proyectos reales.<br />Soluciones reales.</span></div>
          </div>
          <div className={styles.visual}>
            <div className={styles.previewStage} data-reveal="media">
              <span className={styles.note}>Tu idea.<br />Nuestro método.<br />Resultados reales.</span>
              <div className={styles.browser} data-parallax="8">
                <div className={styles.browserBar}><i /><i /><i /><span>IDEAS QUE TOMAN FORMA</span></div>
                <div className={styles.browserBody}><Image src="/images/wilo/generated/about-arequipa-v2.webp" alt="" fill sizes="(max-width: 900px) 90vw, 40vw" /><Image className={styles.logo} src="/images/wilo/hero/wilo-logo.webp" alt="Wilo Studio" width={105} height={64} /><strong>Ideas digitales<br />para negocios<br /><em>reales.</em></strong></div>
              </div>
              <div className={styles.progressCard}><span>Tu proyecto avanza <Check aria-hidden="true" /></span><div className={styles.progressTrack}><i /></div><ul>{["Estrategia","Diseño","Desarrollo","Lanzamiento"].map(label=><li key={label}><Check aria-hidden="true" />{label}</li>)}</ul></div>
            </div>
            <div className={styles.reasons}>{reasons.map(({title,text,icon:Icon,tone},index)=><article data-tone={tone} data-reveal key={title}><div><Icon aria-hidden="true" /><span>0{index+1}</span></div><h3>{title}</h3><p>{text}</p></article>)}</div>
          </div>
        </div>
        <div className={styles.bottom} data-reveal><ul>{[{label:"Diseño",icon:PenLine},{label:"Sistemas",icon:Layers3},{label:"Automatización",icon:Zap},{label:"Contenido",icon:Heart},{label:"Soporte",icon:Headphones}].map(({label,icon:Icon})=><li key={label}><Icon aria-hidden="true" />{label}</li>)}</ul><span>Negocios reales.<br />Mundos digitales.</span></div>
      </ViewportFrame>
    </FullBleedSection>
  );
}
