export const siteConfig = {
  name: "Wilo Studio",
  legalName: "Fabrizio Willys Apaza Calderón",
  ruc: "10614138365",
  phoneDisplay: "+51 936 617 557",
  phone: "51936617557",
  email: "hola@wilostudio.com", // TODO: validar con el dueño antes de producción.
  location: "Arequipa, Perú",
  url: "https://wilostudio.site",
  whatsapp:
    "https://wa.me/51936617557?text=Hola%20Wilo%20Studio%2C%20quiero%20cotizar%20un%20proyecto.",
} as const;

export const primaryNav = [
  { label: "Proyectos", href: "/proyectos" },
  { label: "Servicios", href: "/servicios" },
  { label: "Education", href: "/education" },
  { label: "Express", href: "/express" },
  { label: "Events", href: "/events" },
  { label: "Nosotros", href: "/nosotros" },
];

export const specialties = [
  "Diseño web",
  "Tiendas online",
  "Apps móviles",
  "API SUNAT",
  "Drones",
  "Foto y video",
  "Pantallas LED",
  "Audio profesional",
  "Robótica educativa",
];

export const serviceLines = [
  {
    key: "technology",
    number: "01",
    title: "Tecnología",
    eyebrow: "El corazón de Wilo Studio",
    href: "/servicios/tecnologia",
    description:
      "Webs corporativas, tiendas online, apps y sistemas administrables que ordenan procesos y convierten visitas en ventas.",
    items: ["Webs y ecommerce", "Apps Android y iOS", "API SUNAT e integraciones"],
  },
  {
    key: "audiovisual",
    number: "02",
    title: "Producción audiovisual",
    eyebrow: "Tu marca, en su mejor versión",
    href: "/servicios/produccion-audiovisual",
    description:
      "Foto y video corporativo, drones y contenido profesional para comunicar con calidad y una dirección visual consistente.",
    items: ["Foto y video corporativo", "Cinematografía con drones", "Contenido para marcas y eventos"],
  },
  {
    key: "infrastructure",
    number: "03",
    title: "Infraestructura y eventos",
    eyebrow: "Producción de gran envergadura",
    href: "/servicios/infraestructura-eventos",
    description:
      "Escenarios, pantallas, iluminación, audio y energía operados como una sola solución técnica para eventos exigentes.",
    items: ["Pantallas LED y TV", "Audio, iluminación y escenarios", "Acometidas y grupos electrógenos"],
  },
] as const;

export const webPlans = [
  {
    slug: "landing-page-presencia-rapida",
    title: "Landing Page",
    subtitle: "Presencia rápida",
    price: 500,
    tax: 90,
    featured: false,
    includes: ["1 página", "Diseño responsive", "WhatsApp y formulario", "SEO inicial"],
  },
  {
    slug: "catalogo-web-panel",
    title: "Catálogo Web + Panel",
    subtitle: "Productos bien ordenados",
    price: 800,
    tax: 144,
    featured: false,
    includes: ["Catálogo administrable", "Panel de gestión", "Filtros", "Contacto por WhatsApp"],
  },
  {
    slug: "pagina-corporativa",
    title: "Página Corporativa",
    subtitle: "Una presencia completa",
    price: 1070,
    tax: 192.6,
    featured: true,
    includes: ["Secciones completas", "Diseño premium", "Mapas y formularios", "SEO avanzado"],
  },
  {
    slug: "tienda-virtual",
    title: "Tienda Virtual",
    subtitle: "Lista para vender",
    price: 1420,
    tax: 255.6,
    featured: false,
    includes: ["Carrito de compras", "Panel administrativo", "Gestión de pedidos", "Pasarela de pago"],
  },
] as const;

export const customDevelopments = [
  { name: "API SUNAT", price: "S/1,500+" },
  { name: "App Android", price: "S/2,500+" },
  { name: "App Android + iOS", price: "S/3,200+" },
] as const;

export const hostingOffers = [
  { name: ".com / .site", price: "S/120", detail: "SSL + primer mes de VPS" },
  { name: ".pe / .com.pe", price: "S/180", detail: "SSL + primer mes de VPS" },
  { name: "Hosting Básico", price: "S/30/mes", detail: "IGV incluido" },
  { name: "Hosting Premium", price: "S/50/mes", detail: "IGV incluido" },
] as const;

export type ProjectCategory = "Tecnología" | "Audiovisual" | "Infraestructura" | "Education";

export const projects = [
  { slug: "geoingenieros", title: "Geoingenieros Consultores", category: "Tecnología", image: "/images/portfolio/proyecto-1.jpg", service: "Web corporativa y catálogo técnico", result: "Una vitrina digital clara para servicios e instrumentación especializada.", status: "Proyecto" },
  { slug: "dayun-peru", title: "Dayun Perú", category: "Tecnología", image: "/WEBS/fdsfdsfsd.JPG", service: "Demo web corporativa y catálogo", result: "Concepto demostrativo para presentar modelos, repuestos y consultas comerciales.", status: "Demo" },
  { slug: "global-norte", title: "Global Norte", category: "Tecnología", image: "/WEBS/asassa.JPG", service: "Ecommerce B2B", result: "Catálogo mayorista ordenado, rápido y preparado para recibir pedidos.", status: "Proyecto" },
  { slug: "tecnova", title: "Tecnova", category: "Tecnología", image: "/WEBS/Captura.JPG", service: "Tienda y soporte industrial", result: "Productos, repuestos y servicios técnicos reunidos en una sola plataforma.", status: "Proyecto" },
  { slug: "reloj-shop", title: "Reloj Shop", category: "Tecnología", image: "/images/portfolio/proyecto-5.png", service: "Demo de ecommerce premium", result: "Concepto demostrativo orientado a confianza, colección y compra por WhatsApp.", status: "Demo" },
  { slug: "reuse-tecnologia", title: "Reuse Tecnología", category: "Tecnología", image: "/WEBS/dsfsdfds.JPG", service: "Catálogo de tecnología", result: "Inventario reacondicionado presentado con beneficios, precios y filtros claros.", status: "Proyecto" },
  { slug: "ibex-constructora", title: "IBEX Constructora", category: "Tecnología", image: "/brand/portfolio-showcase.webp", service: "Web corporativa", result: "Una presencia sobria para comunicar proyectos, ingeniería y confianza.", status: "Proyecto" },
  { slug: "biciem-ultra-trail", title: "Biciem Ultra Trail", category: "Tecnología", image: "/brand/portfolio-showcase.webp", service: "Landing para evento", result: "Información, cuenta regresiva e inscripción concentradas en una experiencia ágil.", status: "Proyecto" },
  { slug: "bonbazo-musical", title: "Bonbazo Musical", category: "Audiovisual", image: "/brand/portfolio-showcase.webp", service: "Portafolio digital", result: "Diseños y producciones presentados con una identidad intensa y contemporánea.", status: "Por confirmar" },
  { slug: "grupo-caldexa", title: "Grupo Caldexa", category: "Tecnología", image: "/WEBS/ddssd.JPG", service: "Landing comercial", result: "Financiamiento explicado de forma directa para acelerar la consulta.", status: "Proyecto" },
] satisfies Array<{ slug: string; title: string; category: ProjectCategory; image: string; service: string; result: string; status: "Proyecto" | "Demo" | "Por confirmar" }>;

export const clients = [
  "Tecnova",
  "Dayun Perú",
  "Global Norte",
  "Geoingenieros Consultores",
  "Hingenia",
  "Grupo Caldexa",
  "IBEX Constructora",
  "Reuse Tecnología",
  "Biciem",
  "Reloj Shop",
  "Bonbazo Musical",
  "Rico Pollo",
  "Backus",
  "Mundo Cars",
] as const;

export const workSteps = [
  { number: "01", title: "Reunión", text: "Escuchamos tu negocio, tus objetivos y el problema que debemos resolver." },
  { number: "02", title: "Propuesta", text: "Definimos alcance, tiempos, inversión y entregables sin letras pequeñas." },
  { number: "03", title: "Diseño", text: "Creamos la experiencia visual y validamos la dirección antes de programar." },
  { number: "04", title: "Desarrollo", text: "Construimos, integramos y probamos cada flujo en móvil y escritorio." },
  { number: "05", title: "Entrega", text: "Publicamos, capacitamos a tu equipo y seguimos disponibles para darte soporte." },
] as const;

export const faqs = [
  { question: "¿Cuánto demora una página web?", answer: "El plazo depende del alcance y de la entrega de contenidos. En la propuesta recibirás un cronograma claro antes de iniciar." },
  { question: "¿Puedo administrar mi web?", answer: "Sí. Los proyectos que requieren actualización frecuente incluyen panel de gestión y capacitación para tu equipo." },
  { question: "¿El dominio y hosting están incluidos?", answer: "Cada propuesta detalla la infraestructura. Los dominios .com o .site cuestan S/120 y .pe o .com.pe S/180, con SSL y primer mes de VPS incluidos." },
  { question: "¿Emiten comprobante?", answer: "Sí. Wilo Studio emite boleta y factura electrónica. Los precios de planes web publicados no incluyen IGV." },
  { question: "¿Cómo se realiza el pago?", answer: "Para proyectos trabajamos con 50% para iniciar y 50% contra entrega. También aceptamos transferencias, Yape y Plin." },
  { question: "¿Trabajan fuera de Arequipa?", answer: "Sí. Atendemos proyectos en todo el Perú de forma remota y coordinamos producción presencial según el alcance." },
] as const;

export type StoreProduct = {
  id: string;
  slug: string;
  sku?: string | null;
  name: string;
  category: string;
  brand: string;
  license: string;
  price: number | null;
  currency?: string;
  image: string;
  images?: readonly string[];
  stock?: number | null;
  delivery: string;
  description: string;
  specs: readonly string[];
};

// Los precios de tienda no aparecen en el material entregado; se cargan desde el admin antes de activar venta directa.
export const products = [
  { id: "adobe-creative-cloud", slug: "adobe-creative-cloud", name: "Adobe Creative Cloud", category: "Licencias de software", brand: "Adobe", license: "Licencia original · vigencia por confirmar", price: null, image: "/images/icon-branding.png", delivery: "Entrega digital", description: "Herramientas creativas para diseño, fotografía, video y contenido profesional.", specs: ["Activación digital", "Soporte de instalación", "Comprobante electrónico"] },
  { id: "microsoft-365", slug: "microsoft-365", name: "Microsoft 365", category: "Licencias de software", brand: "Microsoft", license: "Licencia original · vigencia por confirmar", price: null, image: "/images/icon-sistemas.png", delivery: "Entrega digital", description: "Productividad para trabajo, estudio y colaboración con aplicaciones de Microsoft.", specs: ["Activación digital", "Cuenta protegida", "Soporte de instalación"] },
  { id: "windows-11-pro", slug: "windows-11-pro", name: "Windows 11 Pro", category: "Licencias de software", brand: "Microsoft", license: "Licencia original · modalidad por confirmar", price: null, image: "/images/icon-apps.png", delivery: "Entrega digital", description: "Sistema operativo para equipos profesionales con funciones avanzadas de seguridad.", specs: ["Activación digital", "Comprobante electrónico", "Soporte remoto"] },
  { id: "coreldraw-graphics-suite", slug: "coreldraw-graphics-suite", name: "CorelDRAW Graphics Suite", category: "Licencias de software", brand: "Corel", license: "Licencia original · vigencia por confirmar", price: null, image: "/images/icon-web.png", delivery: "Entrega digital", description: "Suite de ilustración, diagramación y diseño para profesionales y negocios.", specs: ["Activación digital", "Actualizaciones según licencia", "Soporte de instalación"] },
  { id: "kit-stem-inicial", slug: "kit-stem-inicial", name: "Kit STEM Inicial", category: "Wilo Education", brand: "Wilo Education", license: "Kit educativo · edad por confirmar", price: null, image: "/images/camaleon.png", delivery: "Stock por confirmar", description: "Primeros retos de construcción, mecanismos y pensamiento lógico para aprender jugando.", specs: ["Piezas de construcción", "Guía de retos", "Actividades progresivas"] },
  { id: "kit-robotica-aula", slug: "kit-robotica-aula", name: "Kit Robótica para Aula", category: "Wilo Education", brand: "Wilo Education", license: "Pack educativo · edad por confirmar", price: null, image: "/images/camaleon.png", delivery: "Stock por confirmar", description: "Pack colaborativo para explorar robótica y programación por bloques en colegios y talleres.", specs: ["Sensores y motor según configuración", "Programación por bloques", "Capacitación disponible"] },
] as const satisfies readonly StoreProduct[];

export const bankAccounts = [
  { bank: "BCP", currency: "Soles", account: "38018217208082", cci: "00238011821720808247" },
  { bank: "BCP", currency: "Dólares", account: "38018217205179", cci: "00238011821720517944" },
  { bank: "BBVA", currency: "Soles", account: "0011-0240-0201346113", cci: "01124000020134611398" },
  { bank: "Interbank", currency: "Soles", account: "898 3516438012", cci: "00389801351643801247" },
  { bank: "Scotiabank", currency: "Soles", account: "1290589918", cci: "00904220129058991836" },
  { bank: "BanBif", currency: "Soles", account: "008034993751", cci: "03871010803499375107" },
] as const;

export const alwaysIncluded = [
  "SEO técnico inicial",
  "Seguridad y SSL",
  "Rendimiento optimizado",
  "Infraestructura VPS",
  "Mantenimiento y soporte",
  "Capacitación para tu equipo",
] as const;

export const formatSoles = (amount: number) =>
  new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", minimumFractionDigits: 0 }).format(amount);

export const whatsappLinkFor = (phone: string, message: string) =>
  `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;

export const whatsappLink = (message: string) => whatsappLinkFor(siteConfig.phone, message);
