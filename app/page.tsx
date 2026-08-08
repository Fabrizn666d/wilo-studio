"use client";

import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Gauge,
  ImageIcon,
  Instagram,
  LayoutDashboard,
  LayoutTemplate,
  Lightbulb,
  Linkedin,
  Mail,
  MapPin,
  Medal,
  MessageCircle,
  Palette,
  Phone,
  Search,
  Send,
  ShoppingCart,
  Smartphone,
} from "lucide-react";
import Lenis from "lenis";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

const navItems = [
  ["Inicio", "inicio"],
  ["Servicios", "servicios"],
  ["Metodo", "metodo"],
  ["Clientes", "clientes"],
  ["Testimonios", "testimonios"],
];

const services = [
  { title: "Diseno y programacion web UX/UI", text: "Tu web sera la primera cara de tu negocio. La disenamos para verse profesional, cargar rapido y convertir visitas en consultas.", Icon: LayoutTemplate },
  { title: "Tiendas online", text: "Creamos tiendas preparadas para vender, mostrar productos, recibir pedidos y acompanar el crecimiento de tu marca.", Icon: ShoppingCart },
  { title: "Catalogos digitales", text: "Ordenamos productos, repuestos, vehiculos o servicios para que tus clientes encuentren rapido lo que necesitan.", Icon: BookOpen },
  { title: "Branding e identidad", text: "Elevamos la percepcion de tu marca con una base visual clara, coherente y lista para web, redes y ventas.", Icon: Palette },
  { title: "SEO y velocidad", text: "Optimizamos estructura, contenido y rendimiento para que tu sitio sea facil de encontrar y agradable de usar.", Icon: Gauge },
  { title: "Sistemas web a medida", text: "Paneles, cotizadores, inventarios y herramientas internas para simplificar procesos y vender mejor.", Icon: LayoutDashboard },
  { title: "Programacion de apps", text: "Aplicaciones web y moviles para validar ideas, automatizar servicios o abrir nuevos canales comerciales.", Icon: Smartphone },
];

const strategies = [
  ["Mas clientes", "Te ayudamos a conseguir mas consultas y a que tus clientes compren mas veces.", "/images/strategy-clientes.png"],
  ["Mas valor", "Mejoramos la percepcion de tu marca para que puedas verte mas profesional y cobrar mejor.", "/images/strategy-valor.png"],
];

const method = [
  { number: "1", title: "Planifica", text: "Definimos donde estas, hacia donde quieres ir y que necesita tu negocio para avanzar.", Icon: Lightbulb },
  { number: "2", title: "Que te encuentren", text: "Construimos una presencia digital clara para que quienes ya tienen el problema te vean como solucion.", Icon: Search },
  { number: "3", title: "Que te busquen", text: "Lanzamos, conectamos tus canales y optimizamos para que tu marca sea mas facil de elegir.", Icon: Medal },
];

const portfolioImages = [
  { src: "/images/portfolio/proyecto-1.jpg", alt: "Trabajo realizado 1" },
  { src: "/images/portfolio/proyecto-2.png", alt: "Trabajo realizado 2" },
  { src: "/images/portfolio/proyecto-3.jpg", alt: "Trabajo realizado 3" },
  { src: "/images/portfolio/proyecto-4.jpg", alt: "Trabajo realizado 4" },
  { src: "/images/portfolio/proyecto-5.png", alt: "Trabajo realizado 5" },
  { src: "/images/portfolio/proyecto-6.png", alt: "Trabajo realizado 6" },
  { src: "/images/portfolio/proyecto-7.jpg", alt: "Trabajo realizado 7" },
  { src: "/images/portfolio/proyecto-8.jpg", alt: "Trabajo realizado 8" },
  { src: "/images/portfolio/proyecto-9.jpg", alt: "Trabajo realizado 9" },
  { src: "/images/portfolio/proyecto-10.jpg", alt: "Trabajo realizado 10" },
  { src: "/images/portfolio/proyecto-11.jpg", alt: "Trabajo realizado 11" },
];

const brandLogos = [
  { src: "/images/logos/logo-1.png", alt: "Tecnova Peru" },
  { src: "/images/logos/logo-2.png", alt: "Dayun Peru" },
  { src: "/images/logos/logo-3.png", alt: "Global Norte" },
  { src: "/images/logos/logo-4.png", alt: "Mundo Cars" },
  { src: "/images/logos/logo-5.png", alt: "AutoSell" },
  { src: "/images/logos/logo-6.png", alt: "Centrum Motors" },
  { src: "/images/logos/logo-7.png", alt: "Proyecto Web" },
  { src: "/images/logos/logo-8.png", alt: "Wilo Studio" },
];

const testimonials = [
  ["Wilo entendio rapido lo que necesitabamos: una web clara, ordenada y pensada para recibir consultas reales.", "Equipo comercial", "Tecnova Peru", "/images/testimonio-tecnova.jpg"],
  ["La propuesta visual se sintio profesional desde el inicio. Ahora podemos mostrar mejor nuestros productos.", "Administracion", "Global Norte", "/images/testimonio-globalnorte.jpg"],
  ["Nos ayudaron a pasar de una idea suelta a una pagina lista para cotizar por WhatsApp.", "Ventas", "Dayun Peru", "/images/testimonio-dayun.jpg"],
  ["El catalogo quedo mucho mas facil de explicar a clientes nuevos.", "Area comercial", "Mundo Cars", "/images/testimonio-mundocars.jpg"],
];

const counters = [
  ["18", "empresas", "que confian en nosotros.", "/images/counter-empresas.png"],
  ["4", "anos", "potenciando negocios.", "/images/counter-anos.png"],
  ["35", "proyectos", "entregados.", "/images/counter-proyectos.png"],
  ["12", "clientes", "recurrentes.", "/images/counter-recurrentes.png"],
];

type LeadType = "consultoria" | "cotizacion";

type LeadForm = {
  name: string;
  email: string;
  service: string;
  accepted: boolean;
};

const emptyLeadForm: LeadForm = {
  name: "",
  email: "",
  service: "",
  accepted: false,
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const node = ref.current;
    if (!node) return;

    const revealIfVisible = () => {
      const rect = node.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
        setVisible(true);
      }
    };

    revealIfVisible();
    const frames = [120, 420, 900].map((time) => window.setTimeout(revealIfVisible, time));
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
    );
    observer.observe(node);

    return () => {
      frames.forEach(window.clearTimeout);
      observer.disconnect();
    };
  }, []);

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={fadeUp}
      initial={mounted ? "hidden" : false}
      animate={mounted ? (visible ? "show" : "hidden") : undefined}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

function Logo({ className = "" }: { className?: string }) {
  return (
    <RefreshableImage className={className} src="/images/logo-wilo-new.png" alt="Wilo Studio" />
  );
}

function useAssetVersion() {
  const [version, setVersion] = useState("");

  useEffect(() => {
    setVersion(String(Date.now()));
  }, []);

  return version;
}

function withAssetVersion(src: string, version: string) {
  if (!version || src.startsWith("data:") || src.startsWith("http")) return src;
  return `${src}${src.includes("?") ? "&" : "?"}v=${version}`;
}

const whatsappUrl = "https://wa.me/51936617557?text=Hola%20Wilo%20Studio,%20quiero%20cotizar%20un%20proyecto";

function RefreshableImage({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const version = useAssetVersion();
  return <img className={className} src={withAssetVersion(src, version)} alt={alt} />;
}

function useCountUp(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const run = () => {
      if (hasRun.current) return;
      hasRun.current = true;
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const runIfVisible = () => {
      const rect = node.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
        run();
      }
    };

    runIfVisible();
    const fallbacks = [250, 900, 1500].map((time) => window.setTimeout(runIfVisible, time));
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        run();
        observer.disconnect();
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => {
      fallbacks.forEach(window.clearTimeout);
      observer.disconnect();
    };
  }, [duration, target]);

  return { count, ref };
}

function Counter({ value }: { value: number }) {
  const [mounted, setMounted] = useState(false);
  const { count, ref } = useCountUp(value);

  useEffect(() => {
    setMounted(true);
  }, []);

  return <div ref={ref}>{mounted ? count : value}</div>;
}

function PortfolioImage({ src, alt }: { src: string; alt: string }) {
  const [exists, setExists] = useState(false);
  const version = useAssetVersion();

  useEffect(() => {
    let alive = true;
    fetch(withAssetVersion(src, version), { method: "HEAD" })
      .then((response) => {
        if (alive) setExists(response.ok);
      })
      .catch(() => {
        if (alive) setExists(false);
      });
    return () => {
      alive = false;
    };
  }, [src, version]);

  if (!exists) {
    return (
      <div className="portfolio-placeholder">
        <ImageIcon size={42} strokeWidth={1.8} />
        <span>{alt}</span>
        <small>{src}</small>
      </div>
    );
  }

  return <img src={withAssetVersion(src, version)} alt={alt} />;
}

function BrandLogo({ src, alt }: { src: string; alt: string }) {
  const [exists, setExists] = useState(false);
  const version = useAssetVersion();

  useEffect(() => {
    let alive = true;
    fetch(withAssetVersion(src, version), { method: "HEAD" })
      .then((response) => {
        if (alive) setExists(response.ok);
      })
      .catch(() => {
        if (alive) setExists(false);
      });
    return () => {
      alive = false;
    };
  }, [src, version]);

  if (!exists) {
    return <span>{alt}</span>;
  }

  return <img src={withAssetVersion(src, version)} alt={alt} />;
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [consultForm, setConsultForm] = useState<LeadForm>(emptyLeadForm);
  const [quoteForm, setQuoteForm] = useState<LeadForm>(emptyLeadForm);
  const [formStatus, setFormStatus] = useState<Record<LeadType, string>>({
    consultoria: "",
    cotizacion: "",
  });
  const logos = useMemo(() => [...brandLogos, ...brandLogos], []);
  const heroRef = useRef<HTMLElement>(null);
  const portfolioRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 });
    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 42);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const moveHero = (event: React.MouseEvent<HTMLElement>) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    heroRef.current?.style.setProperty("--mx", `${x * 22}px`);
    heroRef.current?.style.setProperty("--my", `${y * 16}px`);
    heroRef.current?.style.setProperty("--rmx", `${x * 8}px`);
    heroRef.current?.style.setProperty("--rmy", `${y * 6}px`);
  };

  const scrollPortfolio = (direction: "prev" | "next") => {
    const node = portfolioRef.current;
    if (!node) return;
    node.scrollBy({
      left: direction === "next" ? 360 : -360,
      behavior: "smooth",
    });
  };

  const updateLeadForm = (type: LeadType, patch: Partial<LeadForm>) => {
    if (type === "consultoria") {
      setConsultForm((current) => ({ ...current, ...patch }));
      return;
    }
    setQuoteForm((current) => ({ ...current, ...patch }));
  };

  const submitLead = async (type: LeadType, event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = type === "consultoria" ? consultForm : quoteForm;
    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

    if (!form.name.trim() || !emailIsValid || !form.accepted || (type === "cotizacion" && !form.service)) {
      setFormStatus((current) => ({
        ...current,
        [type]: "Completa nombre, correo valido y acepta la politica.",
      }));
      return;
    }

    const message =
      type === "consultoria"
        ? `Hola, soy ${form.name} (${form.email}). Quiero agendar una consultoria.`
        : `Hola, soy ${form.name} (${form.email}). Me interesa el servicio de ${form.service} y quiero una cotizacion.`;

    setFormStatus((current) => ({
      ...current,
      [type]: "Listo. Guardamos tu solicitud y te estamos llevando a WhatsApp.",
    }));

    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.name,
          correo: form.email,
          tipo_solicitud: type,
          servicio_interes: type === "cotizacion" ? form.service : null,
        }),
      });
    } catch (error) {
      console.error("No se pudo guardar el lead, continuando a WhatsApp:", error);
    }

    window.setTimeout(() => {
      window.open(`https://wa.me/51936617557?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    }, 450);
  };

  return (
    <main className="site-shell">
      <header className={`header ${scrolled ? "is-scrolled" : ""}`}>
        <a className="logo-link" href="#inicio" aria-label="Wilo Studio">
          <Logo className="brand-logo" />
          <span>Agencia de Marketing Digital</span>
        </a>
        <nav aria-label="Navegacion principal">
          {navItems.map(([label, href]) => (
            <a key={href} href={`#${href}`}>
              {label}
            </a>
          ))}
        </nav>
        <div className="partner-badge">
          <span>Google Partner</span>
        </div>
      </header>

      <section id="inicio" className="hero" ref={heroRef} onMouseMove={moveHero}>
        <RefreshableImage src="/images/hero-bg-new.jpg" alt="" className="hero-bg" />
        <div className="hero-watermark" aria-hidden="true">W</div>
        <div className="hero-stage">
          <div className="hero-copy-monkey">
            <span>BUSCAS</span>
            <strong>CLIENTES</strong>
            <em>PARA TU EMPRESA?</em>
          </div>
          <div className="hero-art">
            <img
              src="/images/hero-character-cutout.png"
              alt="Camaleon de Wilo Studio"
              className="hero-character"
            />
          </div>
        </div>
      </section>

      <div className="cookie-bar">
        <p>
          Usamos cookies en nuestro sitio web para brindarte la experiencia mas relevante recordando tus preferencias y visitas repetidas.
          Al hacer clic en "Aceptar", aceptas el uso de TODAS las cookies.
        </p>
        <div>
          <button>Leer mas</button>
          <button>Gestionar cookies</button>
          <button>Aceptar</button>
        </div>
      </div>

      <section id="servicios" className="section services-section">
        <Reveal className="section-head center">
          <span className="section-tag">Servicios</span>
          <h2>Sabes por donde empezar?</h2>
          <p>Te asesoramos en lo que necesites.</p>
        </Reveal>
        <div className="services-grid">
          {services.map(({ title, text, Icon }, index) => (
            <Reveal key={title} delay={index * 0.035}>
              <article className="service-card">
                <div className="service-icon" aria-hidden="true">
                  <Icon size={56} strokeWidth={2.2} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="estrategia" className="section strategy-section">
        <Reveal className="section-head center">
          <span className="section-tag">Estrategia</span>
          <h2>Prefieres que te guiemos?</h2>
          <p>Dos tipos de estrategias para aumentar tus ventas.</p>
        </Reveal>
        <div className="strategy-grid">
          {strategies.map(([title, text, image], index) => (
            <Reveal key={title} delay={index * 0.06}>
              <article className="strategy-card">
                <RefreshableImage src={image} alt={title} className="strategy-img" />
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="metodo" className="section method-section">
        <Reveal className="section-head center">
          <span className="section-tag dark">Metodo</span>
          <h2>Nuestra metodologia en 3 pasos</h2>
          <p>Te mostramos nuestra formula para tener mas clientes.</p>
        </Reveal>
        <div className="method-grid">
          {method.map(({ number, title, text, Icon }, index) => (
            <Reveal key={number} delay={index * 0.06}>
              <article className="method-card">
                <span>{number}</span>
                <div className="method-icon" aria-hidden="true">
                  <Icon size={72} strokeWidth={2.1} />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="clientes" className="section projects-section">
        <Reveal className="section-head center">
          <span className="section-tag">Clientes</span>
          <h2>Portafolio visual</h2>
          <p>Espacios reservados para tus mockups, screenshots y piezas reales de proyectos.</p>
        </Reveal>
        <div className="portfolio-shell">
          <button className="carousel-arrow prev" type="button" aria-label="Proyecto anterior" onClick={() => scrollPortfolio("prev")}>
            <ChevronLeft size={22} />
          </button>
          <div className="portfolio-carousel" ref={portfolioRef}>
            {portfolioImages.map(({ src, alt }, index) => (
              <Reveal key={src} delay={index * 0.08} className="portfolio-reveal">
                <div className="portfolio-card">
                  <PortfolioImage src={src} alt={alt} />
                </div>
              </Reveal>
            ))}
          </div>
          <button className="carousel-arrow next" type="button" aria-label="Proyecto siguiente" onClick={() => scrollPortfolio("next")}>
            <ChevronRight size={22} />
          </button>
        </div>
        <Reveal className="section-head center logo-head" delay={0.12}>
          <span className="section-tag">Marcas</span>
          <h2>Clientes y marcas</h2>
          <p>Logos en carrusel infinito. Reemplaza estos slots por tus marcas reales.</p>
        </Reveal>
        <div className="logo-marquee" aria-label="Carrusel de marcas">
          <div className="logo-track">
            {logos.map(({ src, alt }, index) => (
              <div className="brand-pill" key={`${alt}-${index}`}>
                <BrandLogo src={src} alt={alt} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonios" className="section testimonials-section">
        <Reveal className="section-head center">
          <span className="section-tag">Testimonios</span>
          <h2>Sus historias</h2>
          <p>Algunas historias de crecimiento junto a nosotros.</p>
        </Reveal>
        <div className="testimonial-grid">
          {testimonials.map(([quote, role, company, image], index) => (
            <Reveal key={`${company}-${role}`} delay={index * 0.04}>
              <figure className="testimonial-card">
                <blockquote>"{quote}"</blockquote>
                <figcaption>
                  <RefreshableImage src={image} alt={company} />
                  <span>{company}</span>
                  <strong>{role}</strong>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="contadores" className="section counters-section">
        <div className="counters-grid">
          {counters.map(([value, label, text, image], index) => (
            <Reveal key={label} delay={index * 0.04}>
              <article className="counter-card">
                <RefreshableImage src={image} alt="" />
                <strong>
                  Mas de <Counter value={Number(value)} />
                </strong>
                <span>{label}</span>
                <p>{text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="citas" className="section quote-section">
        <Reveal className="section-head center">
          <span className="section-tag">Agendar cita</span>
          <h2>Elige un tipo de cita</h2>
        </Reveal>
        <div className="quote-grid">
          <Reveal>
            <article className="quote-card">
              <RefreshableImage src="/images/cita-guia.png" alt="Consultoria" />
              <h3>Necesitas que te guiemos?</h3>
              <p>Te obsequiamos 20 min. de consultoria.</p>
              <a className="btn black" href="#consultoria">Agendar consultoria</a>
            </article>
          </Reveal>
          <Reveal delay={0.1}>
            <article className="quote-card">
              <RefreshableImage src="/images/cita-cotizar.png" alt="Cotizar" />
              <h3>Ya tienes claro lo que necesitas?</h3>
              <p>Reunamonos para revisar tu requerimiento.</p>
              <a className="btn gold" href="#cotizar">Agendar para cotizar</a>
            </article>
          </Reveal>
        </div>
      </section>

      <section id="contacto" className="section forms-section">
        <Reveal className="section-head center">
          <span className="section-tag">Contacto</span>
          <h2>Agenda o cotiza en minutos</h2>
          <p>Elige el camino que necesitas. Guardamos tu solicitud y te llevamos directo a WhatsApp.</p>
        </Reveal>
        <div className="forms-grid">
          <Reveal>
            <form id="consultoria" className="form-card contact-card consult-card" onSubmit={(event) => submitLead("consultoria", event)}>
              <div className="form-card-head">
                <span className="form-icon"><MessageCircle size={26} /></span>
                <div>
                  <span className="section-tag">Consultoria</span>
                  <h2>Agendar consultoria</h2>
                  <p>Ideal si quieres que revisemos tu negocio y te digamos por donde empezar.</p>
                </div>
              </div>
              <label>Tu nombre
                <input
                  type="text"
                  name="name"
                  value={consultForm.name}
                  onChange={(event) => updateLeadForm("consultoria", { name: event.target.value })}
                  placeholder="Ej. Fabrizio"
                />
              </label>
              <label>Tu correo electronico
                <input
                  type="email"
                  name="email"
                  value={consultForm.email}
                  onChange={(event) => updateLeadForm("consultoria", { email: event.target.value })}
                  placeholder="correo@empresa.com"
                />
              </label>
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={consultForm.accepted}
                  onChange={(event) => updateLeadForm("consultoria", { accepted: event.target.checked })}
                />
                Acepto la politica de privacidad.
              </label>
              {formStatus.consultoria && <p className="form-status"><CheckCircle2 size={17} /> {formStatus.consultoria}</p>}
              <button type="submit" className="btn black">Agendar por WhatsApp <Send size={17} /></button>
            </form>
          </Reveal>
          <Reveal delay={0.06}>
            <form id="cotizar" className="form-card contact-card quote-card-form" onSubmit={(event) => submitLead("cotizacion", event)}>
              <div className="form-card-head">
                <span className="form-icon"><Send size={26} /></span>
                <div>
                  <span className="section-tag">Cotizar</span>
                  <h2>Agendar para cotizar</h2>
                  <p>Perfecto si ya tienes claro que necesitas y quieres precio o alcance.</p>
                </div>
              </div>
              <label>Tu nombre
                <input
                  type="text"
                  name="name"
                  value={quoteForm.name}
                  onChange={(event) => updateLeadForm("cotizacion", { name: event.target.value })}
                  placeholder="Ej. Fabrizio"
                />
              </label>
              <label>Tu correo electronico
                <input
                  type="email"
                  name="email"
                  value={quoteForm.email}
                  onChange={(event) => updateLeadForm("cotizacion", { email: event.target.value })}
                  placeholder="correo@empresa.com"
                />
              </label>
              <label>Servicio de interes
                <select
                  name="service"
                  value={quoteForm.service}
                  onChange={(event) => updateLeadForm("cotizacion", { service: event.target.value })}
                >
                  <option value="" disabled>Seleccionar servicio</option>
                  <option>Diseno y programacion web UX/UI</option>
                  <option>Tiendas online</option>
                  <option>Catalogos digitales</option>
                  <option>Sistemas web a medida</option>
                  <option>Branding e identidad</option>
                  <option>SEO y velocidad</option>
                </select>
              </label>
              <label className="check-label">
                <input
                  type="checkbox"
                  checked={quoteForm.accepted}
                  onChange={(event) => updateLeadForm("cotizacion", { accepted: event.target.checked })}
                />
                Acepto la politica de privacidad.
              </label>
              {formStatus.cotizacion && <p className="form-status"><CheckCircle2 size={17} /> {formStatus.cotizacion}</p>}
              <button type="submit" className="btn gold">Cotizar por WhatsApp <Send size={17} /></button>
            </form>
          </Reveal>
        </div>
      </section>

      <section className="section final-cta">
        <Reveal>
          <div className="cta-card">
            <span className="section-tag dark">Contacto</span>
            <h2>Listo para que tu negocio se vea mas profesional?</h2>
            <p>Agenda una conversacion rapida y cuentanos que necesitas construir.</p>
            <a className="btn gold pulse-cta" href={whatsappUrl} target="_blank" rel="noreferrer">
              Agendar por WhatsApp <MessageCircle size={18} />
            </a>
          </div>
        </Reveal>
      </section>

      <footer className="footer">
        <div className="footer-brand">
          <Logo className="footer-logo" />
          <p>Agencia de Marketing Digital</p>
        </div>
        <div className="footer-col">
          <h3>Links</h3>
          <a href="#servicios">Servicios</a>
          <a href="#metodo">Metodo</a>
          <a href="#clientes">Clientes</a>
          <a href="#contacto">Contacto</a>
        </div>
        <div className="footer-col">
          <h3>Contacto</h3>
          <span><Phone size={16} /> +51 999 999 999</span>
          <span><Mail size={16} /> hola@wilostudio.com</span>
          <span><MapPin size={16} /> Lima, Peru</span>
        </div>
        <div className="footer-social">
          <h3>Redes Sociales</h3>
          <div>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={18} /></a>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={18} /></a>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="Facebook"><Facebook size={18} /></a>
            <a href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={18} /></a>
          </div>
        </div>
      </footer>
    </main>
  );
}
