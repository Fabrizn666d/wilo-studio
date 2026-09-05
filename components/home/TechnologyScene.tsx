import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Atom, BarChart3, Cloud, CodeXml, Database, Github, Headphones, Layers, Network, Server, ShieldCheck, Zap } from "lucide-react";
import { FullBleedSection, ViewportFrame } from "./HomeLayout";
import { EditorialTilt } from "./EditorialTilt";
import styles from "./editorial-scenes.module.css";

const stack = [
  { name: "React", copy: "Interfaces que inspiran", mark: "react", color: "#00b6df", Icon: Atom },
  { name: "Next.js", copy: "Apps sin límites", mark: "next", color: "#0b1525", Icon: CodeXml },
  { name: "TypeScript", copy: "Código sólido", mark: "TS", color: "#256bf0", Icon: CodeXml },
  { name: "Node.js", copy: "Backends escalables", mark: "node", color: "#56a321", Icon: Server },
  { name: "PostgreSQL", copy: "Datos que impulsan", mark: "postgres", color: "#366991", Icon: Database },
  { name: "Prisma", copy: "Datos bien conectados", mark: "prisma", color: "#202f51", Icon: Layers },
  { name: "Nginx", copy: "Infraestructura real", mark: "nginx", color: "#059b5b", Icon: Network },
  { name: "Tailwind CSS", copy: "Diseño sin límites", mark: "tailwind", color: "#08b6d7", Icon: CodeXml },
];
const capabilities = [
  { Icon: CodeXml, title: "Frontend moderno", text: "Interfaces rápidas, accesibles y con gran experiencia de usuario.", color: "#2868ff" },
  { Icon: Server, title: "Backends escalables", text: "Arquitecturas robustas para crecer contigo.", color: "#00a983" },
  { Icon: Cloud, title: "Infraestructura segura", text: "Despliegue, monitoreo y respaldo continuo.", color: "#8d48ff" },
  { Icon: Zap, title: "Automatizaciones", text: "APIs y procesos conectados que ahorran tiempo.", color: "#fb506b" },
  { Icon: BarChart3, title: "Analítica y datos", text: "Medimos, aprendemos y optimizamos.", color: "#00b5da" },
  { Icon: Headphones, title: "Soporte continuo", text: "Acompañamiento real en cada etapa.", color: "#e3a000" },
];

export function TechnologyScene() {
  return <FullBleedSection id="tecnologia" className={`${styles.section} ${styles.technology}`} aria-labelledby="technology-title" data-scene-theme="light" spacing="scene">
    <span className={styles.watermark} aria-hidden="true">W</span>
    <ViewportFrame size="wide" className={styles.sceneFrame}>
      <div className={styles.technologyTop}>
        <div className={styles.techCopy}>
          <span className={styles.eyebrow} data-reveal="detail">08 <i /> TECNOLOGÍA WILO</span>
          <h2 id="technology-title" data-reveal="title">TECNOLOGÍA<br /><em>QUE HACE POSIBLE</em><br />LO IMPOSIBLE.</h2>
          <h3 data-reveal="detail">Soluciones reales. Sin límites de plataforma.</h3>
          <p data-reveal="detail">Diseñamos y desarrollamos soluciones digitales a medida con tecnología moderna, infraestructura real, APIs, datos y motion. Construimos productos que escalan contigo.</p>
          <Link href="/servicios" className={styles.darkButton} data-reveal="detail">Conoce nuestras soluciones <ArrowRight aria-hidden="true" /></Link>
          <span className={`${styles.handwritten} ${styles.techNote}`} data-reveal="detail">Mejores herramientas.<br />Grandes ideas.</span>
        </div>
        <EditorialTilt className={styles.techStage}>
          <div className={styles.techOrbit} aria-hidden="true" />
          <div className={styles.mountainCard} data-reveal="media"><Image src="/images/wilo/generated/about-arequipa-v2.webp" fill alt="" sizes="35vw" /></div>
          <div className={styles.laptop} data-reveal="media">
            <div className={styles.laptopScreen}>
              <div className={styles.editorBar}><strong>wilo</strong><span>ideas.tsx</span><i /><i /><i /></div>
              <div className={styles.editorBody}>
                <aside><span>▣</span><span>src</span><span>app</span><span>api</span><span>lib</span><span>public</span></aside>
                <div className={styles.codePreview}><small>{"// Construimos algo real"}</small><p><b>import</b> &#123; creatividad &#125;<br />&nbsp; <b>from</b> <em>&apos;wilo&apos;</em>;</p><p><b>export default</b><br /><strong>function</strong> TuIdea() &#123;</p><p>&nbsp; <b>return</b> (<br />&nbsp;&nbsp; &lt;<em>Experiencia</em><br />&nbsp;&nbsp;&nbsp; aMedida<br />&nbsp;&nbsp;&nbsp; sinLímites<br />&nbsp;&nbsp; /&gt;<br />&nbsp; );<br />&#125;</p><small>{"// Tecnología con propósito."}</small></div>
                <div className={styles.sitePreview}><Image src="/images/wilo/generated/about-arequipa-v2.webp" fill alt="Vista de Arequipa en una interfaz web" sizes="20vw" /><span>Ideas<br /><em>en movimiento.</em><i><ArrowRight aria-hidden="true" /></i></span></div>
              </div>
            </div>
            <div className={styles.laptopBase}><i /></div>
          </div>
          <div className={styles.techCards}>{stack.map(({ name, copy, mark, color, Icon }, index) => <div className={styles.techCard} data-tech-side={index < 4 ? "left" : "right"} data-reveal="detail" style={{ "--tech-index": index % 4, "--tech-color": color } as React.CSSProperties} key={name} tabIndex={0}><span className={styles.techMark}>{mark === "TS" ? "TS" : <Icon aria-hidden="true" />}</span><span><strong>{name}</strong><small>{copy}</small></span></div>)}</div>
          <div className={styles.cloudCard} data-reveal="detail"><Cloud aria-hidden="true" /><span>Desplegado<br />y preparado para crecer</span><i /></div>
          <div className={styles.miniStack} data-reveal="detail"><span><Zap />GSAP</span><span><Network />APIs</span><span><Github />GitHub</span><span><ShieldCheck />SSL</span></div>
          <span className={`${styles.handwritten} ${styles.stageNote}`} data-reveal="detail">Más que herramientas,<br />posibilidades.</span>
        </EditorialTilt>
      </div>
      <ul className={styles.techCapabilities} data-reveal="detail">{capabilities.map(({ Icon, title, text, color }) => <li key={title} style={{ "--tech-color": color } as React.CSSProperties}><Icon aria-hidden="true" /><h3>{title}</h3><p>{text}</p></li>)}</ul>
      <div className={styles.stackRail} data-reveal="detail"><span>UN ECOSISTEMA DE<br />TECNOLOGÍAS REALES</span>{stack.slice(0, 6).map(({ name, Icon, color }) => <strong key={name}><Icon aria-hidden="true" style={{ color }} />{name}</strong>)}<strong><Github aria-hidden="true" />GitHub</strong></div>
      <div className={styles.sceneFooter} data-reveal="detail"><span>WILO STUDIO</span><span>TECNOLOGÍA · CREATIVIDAD · IMPACTO REAL</span></div>
    </ViewportFrame>
  </FullBleedSection>;
}
