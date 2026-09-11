import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BriefcaseBusiness, Cpu, Headphones, Laptop, Monitor, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { FullBleedSection, ViewportFrame } from "./HomeLayout";
import { EditorialTilt } from "./EditorialTilt";
import styles from "./editorial-scenes.module.css";

const categories = [
  { title: "Laptops", text: "Rendimiento para tus ideas.", Icon: Laptop, position: "19% 41%", type: "laptop" },
  { title: "PC y Workstations", text: "Potencia para crear.", Icon: Monitor, position: "60% 26%", type: "desktop" },
  { title: "Componentes", text: "RAM, SSD, GPU y más.", Icon: Cpu, position: "88% 78%", type: "components" },
  { title: "Periféricos", text: "Complementa tu equipo.", Icon: Headphones, position: "14% 88%", type: "peripheral" },
  { title: "Software y licencias", text: "Productividad y seguridad.", Icon: ShieldCheck, position: "", type: "software" },
  { title: "Accesorios", text: "Todo para tu setup.", Icon: BriefcaseBusiness, position: "", type: "accessories" },
];

export function StoreScene() {
  return <FullBleedSection id="store" className={`${styles.section} ${styles.store}`} aria-labelledby="store-title" data-scene-theme="light" spacing="scene">
    <span className={styles.watermark} aria-hidden="true">W</span>
    <ViewportFrame size="wide" className={styles.sceneFrame}>
      <div className={styles.storeTop}>
        <div className={styles.storeCopy}>
          <span className={styles.eyebrow} data-reveal="detail">09 <i /> WILO STORE</span>
          <h1 className={styles.storeTitle} id="store-title" data-reveal="title">TECNOLOGÍA<br />PARA TRABAJAR,<br /><em>CREAR Y CRECER.</em></h1>
          <p data-reveal="detail">Equipos, accesorios y software para personas, empresas y proyectos que no se detienen.</p>
          <div className={styles.storeActions} data-reveal="detail"><Link href="#catalogo" className={styles.darkButton}>Explorar catálogo <ArrowUpRight aria-hidden="true" /></Link><Link href="/contacto?asunto=Equipamiento" className={styles.textButton}>Recibir asesoría <ArrowRight aria-hidden="true" /></Link></div>
          <ul className={styles.storeBenefits} data-reveal="detail"><li><Truck aria-hidden="true" /><span>Entrega<br />coordinada</span></li><li><ShieldCheck aria-hidden="true" /><span>Compra<br />acompañada</span></li><li><Headphones aria-hidden="true" /><span>Soporte<br />especializado</span></li></ul>
        </div>
        <EditorialTilt className={styles.storeStage}>
          <div className={styles.storeProducts} data-reveal="media"><Image src="/images/wilo/generated/store-products-v1.webp" alt="Composición de laptop, workstation, auriculares, teclado y componentes de tecnología" fill priority sizes="(max-width: 760px) 100vw, 65vw" /></div>
          <span className={`${styles.handwritten} ${styles.storeNote}`} data-reveal="detail">El equipo<br />también hace<br />la diferencia.</span>
        </EditorialTilt>
      </div>
      <div className={styles.categoryGrid} data-reveal="detail">{categories.map(({ title, text, Icon, position, type }) => <Link href={position ? `/contacto?asunto=${encodeURIComponent(title)}` : "/tienda"} key={title} className={styles.category} data-category={type}><div><h3>{title}</h3><p>{text}</p><span className={styles.categoryArrow}><ArrowRight aria-hidden="true" /></span></div>{position ? <span className={styles.categoryPhoto} style={{ "--object-position": position } as React.CSSProperties}><Image src="/images/wilo/generated/store-products-v1.webp" alt="" fill sizes="220px" /></span> : <Icon className={styles.categoryIcon} aria-hidden="true" />}</Link>)}</div>
      <div className={styles.storeBanner} data-reveal="media"><div><span>WILO STORE</span><h3>Equipamos hoy<br />los proyectos del mañana.</h3></div><p><Sparkles aria-hidden="true" />Tecnología que impulsa tus ideas.</p><Link href="#catalogo">Visitar la tienda <ArrowUpRight aria-hidden="true" /></Link></div>
    </ViewportFrame>
  </FullBleedSection>;
}
