export const motionTokens = {
  easeOut: [0.22, 1, 0.36, 1] as const,
  easeInOut: [0.45, 0, 0.55, 1] as const,
  fast: 0.22,
  medium: 0.55,
  slow: 0.9,
} as const;

export type StudioProject = {
  slug: string;
  name: string;
  descriptor: string;
  shortDescription: string;
  summary: string;
  challenge: string;
  solution: string;
  services: readonly string[];
  deliverables: readonly string[];
  poster: string;
  video?: string;
  gallery?: readonly string[];
  liveUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  theme: "amber" | "blue" | "green" | "red" | "lime" | "ivory";
  featured?: boolean;
};

/**
 * Portfolio editorial construido únicamente con proyectos que tienen material
 * local identificable. No incluye métricas de negocio ni resultados inventados.
 */
export const studioProjects = [
  {
    slug: "tecnova-peru",
    name: "Tecnova Perú",
    descriptor: "Plataforma corporativa · catálogo industrial",
    shortDescription: "Productos, repuestos, servicios y solicitudes comerciales dentro de una experiencia administrable.",
    summary: "Una plataforma corporativa preparada para presentar maquinaria, ordenar un catálogo técnico y recibir consultas desde una misma interfaz.",
    challenge: "Reunir información comercial y técnica sin convertir la navegación en una lista difícil de recorrer.",
    solution: "Diseñamos una arquitectura por familias de producto, páginas de servicio y puntos de contacto visibles, con una base administrable para mantener el contenido al día.",
    services: ["Estrategia web", "UI/UX", "Catálogo", "Cotización", "Desarrollo"],
    deliverables: ["Sitio responsive", "Catálogo organizado", "Flujo de contacto", "Panel de gestión"],
    poster: "/WEBS/Captura.JPG",
    video: "/videos/tecnova-showcase-clean.webm",
    gallery: ["/images/portfolio/proyecto-4.jpg"],
    liveUrl: "https://tecnovaperu.com.pe/",
    theme: "red",
    featured: true,
  },
  {
    slug: "geoingenieros",
    name: "Geoingenieros",
    descriptor: "Web corporativa · catálogo técnico",
    shortDescription: "Una vitrina digital para servicios de ingeniería, instrumentación y soluciones especializadas.",
    summary: "Una web corporativa que hace legible una oferta técnica amplia y permite explorar productos, marcas y servicios desde cualquier dispositivo.",
    challenge: "Presentar una oferta especializada con suficiente detalle sin perder una ruta clara hacia la consulta.",
    solution: "Organizamos la información por intención, construimos jerarquías visuales directas y reservamos llamadas a la acción para los momentos de decisión.",
    services: ["Arquitectura de información", "Diseño web", "Catálogo", "Desarrollo"],
    deliverables: ["Sitio corporativo", "Navegación por categorías", "Vista responsive", "Canales de consulta"],
    poster: "/images/portfolio/proyecto-1.jpg",
    gallery: ["/WEBS/433343443.JPG"],
    liveUrl: "https://geoingenieros.com.pe/",
    theme: "blue",
    featured: true,
  },
  {
    slug: "global-norte",
    name: "Global Norte",
    descriptor: "E-commerce B2B · catálogo mayorista",
    shortDescription: "Catálogo comercial organizado para recorrer líneas de producto y coordinar pedidos.",
    summary: "Una experiencia de comercio digital orientada a compradores que necesitan encontrar categorías, revisar la oferta y contactar al negocio con rapidez.",
    challenge: "Convertir un inventario diverso en una experiencia clara tanto para clientes recurrentes como para nuevos compradores.",
    solution: "Diseñamos un catálogo visual con jerarquía de categorías, bloques comerciales y rutas de contacto adaptadas al uso móvil.",
    services: ["E-commerce", "Diseño responsive", "Catálogo", "Integración de contacto"],
    deliverables: ["Catálogo digital", "Experiencia móvil", "Fichas comerciales", "Flujo de pedidos"],
    poster: "/WEBS/asassa.JPG",
    gallery: ["/images/portfolio/proyecto-3.jpg"],
    liveUrl: "https://globalnorte.pe/",
    theme: "red",
    featured: true,
  },
  {
    slug: "reuse-tecnologia",
    name: "Reuse Tecnología",
    descriptor: "Catálogo de tecnología · venta asistida",
    shortDescription: "Equipos reacondicionados presentados con especificaciones, beneficios y consulta directa.",
    summary: "Un catálogo pensado para explicar con transparencia la propuesta de equipos reacondicionados y acompañar la decisión de compra.",
    challenge: "Dar confianza a una categoría donde el estado, la garantía y las especificaciones determinan la compra.",
    solution: "Priorizamos fichas legibles, comparaciones simples, señales de confianza y acceso inmediato a asesoría comercial.",
    services: ["Estrategia digital", "Catálogo", "UI/UX", "Desarrollo web"],
    deliverables: ["Catálogo responsive", "Fichas de producto", "Filtros", "Contacto comercial"],
    poster: "/WEBS/dsfsdfds.JPG",
    gallery: ["/images/portfolio/proyecto-8.jpg"],
    liveUrl: "https://www.reuse.pe/",
    theme: "blue",
    featured: true,
  },
  {
    slug: "ibex-constructora",
    name: "IBEX Constructora",
    descriptor: "Presencia corporativa · arquitectura",
    shortDescription: "Una dirección visual sobria para presentar arquitectura, ingeniería y proyectos.",
    summary: "Una presencia corporativa que combina una imagen arquitectónica protagonista con información directa sobre el trabajo de la constructora.",
    challenge: "Transmitir criterio visual y solidez técnica sin recargar la comunicación.",
    solution: "Construimos una composición contenida, con fotografía de proyecto, mensajes breves y una navegación orientada a servicios y portafolio.",
    services: ["Dirección visual", "Diseño web", "Desarrollo responsive"],
    deliverables: ["Sitio corporativo", "Presentación de proyectos", "Adaptación móvil"],
    poster: "/images/wilo/projects/ibex.webp",
    theme: "ivory",
    featured: true,
  },
  {
    slug: "biciem-ultra-trail",
    name: "Biciem Ultra Trail",
    descriptor: "Landing de evento · experiencia deportiva",
    shortDescription: "Información del evento e inscripción reunidas en una experiencia de consulta rápida.",
    summary: "Una landing para comunicar una experiencia de trail, ordenar la información esencial y llevar al participante hacia la inscripción.",
    challenge: "Hacer visibles fechas, recorrido e inscripción sin perder la energía visual propia del evento.",
    solution: "Trabajamos una narrativa de alto contraste, bloques de lectura rápida y una estructura adaptada a consultas desde el teléfono.",
    services: ["Landing page", "Dirección visual", "Contenido", "Desarrollo"],
    deliverables: ["Landing responsive", "Información de evento", "Llamadas de inscripción"],
    poster: "/images/wilo/projects/biciem.webp",
    liveUrl: "https://biciem.com/",
    theme: "lime",
    featured: true,
  },
  {
    slug: "grupo-caldexa",
    name: "Grupo Caldexa",
    descriptor: "Landing comercial · financiamiento",
    shortDescription: "Una ruta directa para explicar alternativas de financiamiento y facilitar la consulta.",
    summary: "Una landing comercial enfocada en presentar la propuesta de financiamiento con mensajes breves y acceso visible al contacto.",
    challenge: "Explicar un servicio financiero de forma cercana, ordenada y fácil de consultar desde el teléfono.",
    solution: "Priorizamos una narrativa corta, bloques de información accionables y llamadas a la acción presentes en los momentos de decisión.",
    services: ["Landing page", "Dirección visual", "Diseño responsive", "Desarrollo"],
    deliverables: ["Landing comercial", "Contenido estructurado", "Contacto directo"],
    poster: "/WEBS/ddssd.JPG",
    gallery: ["/images/portfolio/proyecto-7.jpg"],
    liveUrl: "https://grupocaldexa.com/",
    theme: "blue",
  },
] as const satisfies readonly StudioProject[];

export type Capability = {
  slug: string;
  number: string;
  name: string;
  description: string;
  items: readonly string[];
  visual: "browser" | "commerce" | "dashboard" | "quote" | "mobile" | "flow" | "identity" | "media" | "server" | "support";
};

export const capabilities = [
  { slug: "webs-corporativas", number: "01", name: "Webs corporativas", description: "Sitios que explican una empresa, ordenan su oferta y abren una ruta clara hacia el contacto.", items: ["Institucionales", "Landings", "Sitios administrables"], visual: "browser" },
  { slug: "tiendas-catalogos", number: "02", name: "Tiendas y catálogos", description: "Productos, variantes, pedidos y consulta comercial dentro de una experiencia preparada para crecer.", items: ["E-commerce", "Catálogos", "Pedidos"], visual: "commerce" },
  { slug: "plataformas-sistemas", number: "03", name: "Plataformas y sistemas", description: "Herramientas internas y portales que convierten procesos dispersos en operaciones visibles.", items: ["Dashboards", "CRM", "Portales"], visual: "dashboard" },
  { slug: "cotizadores-configuradores", number: "04", name: "Cotizadores y configuradores", description: "Flujos guiados para convertir requisitos en configuraciones, proformas o solicitudes accionables.", items: ["Cotización", "Configuración", "Leads"], visual: "quote" },
  { slug: "aplicaciones", number: "05", name: "Aplicaciones", description: "Productos móviles y web adaptados al contexto real de usuarios, equipos y negocio.", items: ["Android", "iOS", "Web apps"], visual: "mobile" },
  { slug: "automatizacion-apis", number: "06", name: "Automatización & APIs", description: "Integraciones y flujos que reducen tareas repetitivas y mantienen datos sincronizados.", items: ["APIs", "Notificaciones", "Sincronización"], visual: "flow" },
  { slug: "identidad-diseno", number: "07", name: "Identidad & diseño", description: "Sistemas visuales e interfaces consistentes, pensados para funcionar en todos los puntos de contacto.", items: ["UI systems", "Identidad digital", "Aplicaciones"], visual: "identity" },
  { slug: "produccion-audiovisual", number: "08", name: "Producción audiovisual", description: "Fotografía, video y postproducción para presentar productos, equipos, espacios y experiencias.", items: ["Foto", "Video", "Postproducción"], visual: "media" },
  { slug: "infraestructura-digital", number: "09", name: "Infraestructura digital", description: "La capa técnica que mantiene cada solución disponible, protegida y preparada para operar.", items: ["VPS", "SSL", "Despliegues"], visual: "server" },
  { slug: "soporte-evolucion", number: "10", name: "Soporte & evolución", description: "Mantenimiento, mejoras y acompañamiento para que el producto no se detenga después del lanzamiento.", items: ["Monitoreo", "Actualizaciones", "Mejoras"], visual: "support" },
] as const satisfies readonly Capability[];

export const labModules = [
  { key: "dashboard", label: "Dashboard", description: "Indicadores y actividad operativa en una vista priorizada." },
  { key: "admin", label: "Admin", description: "Contenido, usuarios y estados editables sin tocar código." },
  { key: "crm", label: "CRM", description: "Contactos, oportunidades, notas y próximos pasos conectados." },
  { key: "quote", label: "Cotizador", description: "Selección guiada, reglas y resumen de solicitud en un solo flujo." },
  { key: "tracking", label: "Tracking", description: "Estados y seguimiento para que cada parte sepa qué ocurre." },
  { key: "api", label: "API", description: "Servicios que intercambian datos de forma controlada y mantenible." },
] as const;

export const audiovisualServices = [
  "Video corporativo",
  "Fotografía comercial",
  "Producto",
  "Contenido para redes",
  "Cobertura de eventos",
  "Edición y postproducción",
] as const;

export const processSteps = [
  { number: "01", name: "Descubrimiento", text: "Entendemos el negocio, la audiencia y el problema que vale la pena resolver." },
  { number: "02", name: "Estrategia", text: "Definimos alcance, prioridades, contenido y una ruta de trabajo visible." },
  { number: "03", name: "Diseño", text: "Convertimos la estrategia en flujos, interfaz y una dirección visual coherente." },
  { number: "04", name: "Desarrollo", text: "Construimos la solución con una arquitectura preparada para mantenerse." },
  { number: "05", name: "Pruebas", text: "Validamos contenido, dispositivos, accesibilidad, rendimiento y casos críticos." },
  { number: "06", name: "Lanzamiento", text: "Publicamos, configuramos la infraestructura y entregamos el control necesario." },
  { number: "07", name: "Evolución", text: "Medimos, damos soporte y priorizamos mejoras según el uso real." },
] as const;

export const trustStatements = [
  { title: "Soluciones a medida", text: "El alcance parte del problema, no de una plantilla cerrada." },
  { title: "Infraestructura administrada", text: "Despliegue, SSL y operación técnica dentro de una misma conversación." },
  { title: "Productos editables", text: "Los equipos pueden actualizar la información que cambia con el negocio." },
  { title: "Soporte continuo", text: "El lanzamiento es una entrega; la evolución es parte del producto." },
] as const;

export const clientMarks = [
  { name: "Tecnova Perú", logo: "/images/logo-tecnova.png", projectSlug: "tecnova-peru" },
  { name: "Global Norte", logo: "/images/logo-globalnorte.png", projectSlug: "global-norte" },
  { name: "Reuse Tecnología", projectSlug: "reuse-tecnologia" },
  { name: "Geoingenieros", projectSlug: "geoingenieros" },
  { name: "Biciem Ultra Trail", projectSlug: "biciem-ultra-trail" },
  { name: "Grupo Caldexa", projectSlug: "grupo-caldexa" },
  { name: "Hingenia" },
] as const;

export const ecosystemLines = [
  { key: "studio", name: "Wilo Studio", eyebrow: "Soluciones a medida", description: "Web, sistemas, aplicaciones, automatización, identidad y producción visual.", href: "/#servicios", accent: "#F1B824" },
  { key: "express", name: "Wilo Express", eyebrow: "Web rápida para negocios", description: "Una presencia profesional, administrable y lista para operar con una estructura probada.", href: "/express", accent: "#71A7FF" },
  { key: "education", name: "Wilo Education", eyebrow: "Tecnología que se aprende", description: "Robótica, construcción y experiencias STEM para instituciones y estudiantes.", href: "/education", accent: "#8F6BFF" },
  { key: "events", name: "Wilo Events", eyebrow: "Experiencias corporativas", description: "Producción audiovisual e infraestructura técnica para encuentros de marca.", href: "/events", accent: "#FF7A45" },
] as const;

export const aboutWilo = {
  origin: "Arequipa, Perú",
  headline: "Somos de Arequipa. Construimos para cualquier lugar.",
  story: "Wilo reúne tecnología, diseño, producción y educación para resolver necesidades concretas de empresas e instituciones. Cada línea comparte el mismo criterio: hacer que lo complejo se entienda y funcione.",
  mission: "Construir soluciones digitales y creativas que generen valor práctico para empresas y organizaciones.",
  vision: "Consolidar desde Perú un ecosistema reconocido por integrar tecnología, creatividad, educación y experiencias.",
  values: ["Compromiso", "Claridad", "Creatividad", "Mejora continua", "Innovación práctica"],
} as const;

export function findStudioProject(slug: string) {
  return studioProjects.find((project) => project.slug === slug);
}
