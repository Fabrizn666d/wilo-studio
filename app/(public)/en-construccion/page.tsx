import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MessageCircle, Sparkles, Wrench } from "lucide-react";
import { getPublicSiteSettings } from "@/lib/site-settings";
import styles from "./under-construction.module.css";

export const metadata: Metadata = {
  title: "Estamos construyendo algo increíble",
  description: "Los camaleones de Wilo Studio están preparando esta experiencia.",
  robots: { index: false, follow: false },
};

export default async function UnderConstructionPage() {
  const settings = await getPublicSiteSettings();
  return (
    <main id="contenido" className={styles.page}>
      <span className={styles.grid} aria-hidden="true" />
      <section className={styles.hero}>
        <div className={styles.copy}>
          <span className={styles.eyebrow}><Wrench /> Experiencia en construcción</span>
          <p className={styles.kicker}>Wilo Studio presenta</p>
          <h1>UPS...<br /><span>CAMALEONES</span><br />TRABAJANDO.</h1>
          <p className={styles.lead}>Estamos afinando cada detalle para que esta experiencia esté a la altura de tus ideas. Muy pronto estará lista.</p>
          <div className={styles.actions}>
            <Link href="/"><ArrowLeft /> Volver al inicio</Link>
            <a href={settings.whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle /> Hablar por WhatsApp</a>
          </div>
          <div className={styles.status}><i /><span><b>Construcción en progreso</b><small>Diseñando · desarrollando · probando</small></span></div>
        </div>
        <div className={styles.visual} aria-label="Camaleón de Wilo Studio trabajando">
          <div className={styles.halo} aria-hidden="true" />
          <div className={styles.codeCard} aria-hidden="true"><span /><span /><span /><b>ideas.tsx</b><code>creatividad + tecnología</code></div>
          <Image className={styles.mascot} src="/brand/wilo-mascot-cutout.webp" alt="Camaleón de Wilo Studio observando el próximo lanzamiento" width={1024} height={1024} priority />
          <Image className={styles.peek} src="/wilo-lab/chameleon-peek.webp" alt="" width={760} height={760} />
          <div className={styles.sparkOne} aria-hidden="true"><Sparkles /></div>
          <div className={styles.sparkTwo} aria-hidden="true"><Sparkles /></div>
          <p className={styles.note}>Grandes ideas<br />en proceso.</p>
        </div>
      </section>
    </main>
  );
}
