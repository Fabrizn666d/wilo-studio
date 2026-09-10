import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const WEB_PRICE_NOTE =
  "Todos los proyectos son personalizados. El precio final puede variar según funcionalidades, secciones, integraciones y complejidad.";

const clients = [
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
];

const slugify = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

async function seedClients() {
  for (const [sortOrder, name] of clients.entries()) {
    const slug = slugify(name);
    await prisma.client.upsert({
      where: { slug },
      update: {},
      create: { slug, name, sortOrder, active: true },
    });
  }
}

async function seedProjects() {
  const projectSeeds = [
    { title: "Dayun Perú", category: "Tecnología", image: "/WEBS/fdsfdsfsd.JPG", summary: "DEMO: Concepto web corporativo y catálogo comercial.", services: ["Demo web", "Catálogo"] },
    { title: "Tecnova", category: "Tecnología", image: "/WEBS/Captura.JPG", summary: "Tienda, repuestos y soporte industrial reunidos en una sola plataforma.", services: ["Ecommerce", "Catálogo", "Panel"] },
    { title: "IBEX Constructora", category: "Tecnología", image: "/brand/portfolio-showcase.webp", summary: "Una presencia sobria para comunicar proyectos, ingeniería y confianza.", services: ["Web corporativa", "Portafolio"] },
    { title: "Reuse Tecnología", category: "Tecnología", image: "/WEBS/dsfsdfds.JPG", summary: "Catálogo de tecnología reacondicionada con beneficios y precios claros.", services: ["Catálogo", "Ecommerce"] },
    { title: "Global Norte", category: "Tecnología", image: "/WEBS/asassa.JPG", summary: "Catálogo mayorista preparado para recibir pedidos de negocio.", services: ["Ecommerce B2B", "Panel"] },
    { title: "Reloj Shop", category: "Tecnología", image: "/images/portfolio/proyecto-5.png", summary: "DEMO: Concepto de ecommerce premium orientado a compra por WhatsApp.", services: ["Demo ecommerce", "UX/UI"] },
    { title: "Biciem Ultra Trail", category: "Tecnología", image: "/brand/portfolio-showcase.webp", summary: "Landing de evento con información e inscripción concentradas en una experiencia ágil.", services: ["Landing", "Evento"] },
    { title: "Bonbazo Musical", category: "Audiovisual", image: "/brand/portfolio-showcase.webp", summary: "POR CONFIRMAR: Portafolio digital de identidad contemporánea.", services: ["Portafolio", "Dirección visual"] },
    { title: "Grupo Caldexa", category: "Tecnología", image: "/WEBS/ddssd.JPG", summary: "Financiamiento explicado de forma directa para acelerar la consulta.", services: ["Landing comercial"] },
    { title: "Geoingenieros", category: "Tecnología", image: "/images/portfolio/proyecto-1.jpg", summary: "Vitrina digital para servicios e instrumentación especializada.", services: ["Web corporativa", "Catálogo técnico"] },
  ];

  for (const [sortOrder, project] of projectSeeds.entries()) {
    const { title } = project;
    const clientName = title === "Biciem Ultra Trail" ? "Biciem" : title === "Geoingenieros" ? "Geoingenieros Consultores" : title;
    const client = await prisma.client.findUnique({ where: { slug: slugify(clientName) } });
    const slug = slugify(title);
    await prisma.project.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        title,
        category: project.category,
        clientId: client?.id ?? null,
        summary: project.summary,
        services: JSON.stringify(project.services),
        coverImage: project.image,
        sortOrder,
        published: true,
        featured: sortOrder < 6,
      },
    });
  }
}

async function seedServices() {
  const services = [
    {
      slug: "tecnologia",
      title: "Tecnología",
      category: "TECHNOLOGY",
      summary: "Webs corporativas, tiendas virtuales, catálogos digitales, apps móviles, sistemas a medida e integraciones.",
    },
    {
      slug: "produccion-audiovisual",
      title: "Producción audiovisual",
      category: "AUDIOVISUAL",
      summary: "Foto y video corporativo, cinematografía con drones y cámaras profesionales para marcas y eventos.",
    },
    {
      slug: "infraestructura-eventos",
      title: "Infraestructura y eventos",
      category: "INFRASTRUCTURE",
      summary: "Escenarios, pantallas LED y TV, iluminación, audio profesional, acometidas y subestaciones eléctricas.",
    },
  ];

  for (const [sortOrder, service] of services.entries()) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: {},
      create: { ...service, sortOrder, published: true },
    });
  }
}

async function seedPlans() {
  const plans = [
    {
      slug: "landing-page-presencia-rapida",
      title: "Landing Page",
      subtitle: "Presencia rápida",
      category: "WEB",
      priceCents: 50000,
      taxCents: 9000,
      features: ["1 página", "Diseño responsive", "WhatsApp y formulario", "SEO inicial"],
    },
    {
      slug: "catalogo-web-panel",
      title: "Catálogo Web + Panel",
      category: "WEB",
      priceCents: 80000,
      taxCents: 14400,
      features: ["Catálogo administrable", "Panel de gestión", "Filtros", "WhatsApp"],
    },
    {
      slug: "pagina-corporativa",
      title: "Página Corporativa",
      category: "WEB",
      priceCents: 107000,
      taxCents: 19260,
      features: ["Secciones completas", "Diseño premium", "Mapas y formularios", "SEO avanzado"],
    },
    {
      slug: "tienda-virtual",
      title: "Tienda Virtual",
      category: "WEB",
      priceCents: 142000,
      taxCents: 25560,
      features: ["Carrito", "Panel administrativo", "Gestión de pedidos", "Pasarela de pago"],
    },
    {
      slug: "api-sunat",
      title: "API SUNAT",
      category: "CUSTOM_DEVELOPMENT",
      priceCents: 150000,
      taxCents: 0,
      features: [],
    },
    {
      slug: "app-android",
      title: "App Android",
      category: "CUSTOM_DEVELOPMENT",
      priceCents: 250000,
      taxCents: 0,
      features: [],
    },
    {
      slug: "app-android-ios",
      title: "App Android + iOS",
      category: "CUSTOM_DEVELOPMENT",
      priceCents: 320000,
      taxCents: 0,
      features: [],
    },
    {
      slug: "dominio-com-site",
      title: "Dominio .com / .site",
      category: "INFRASTRUCTURE",
      priceCents: 12000,
      taxCents: 0,
      includesTax: true,
      features: ["SSL", "Primer mes de VPS"],
    },
    {
      slug: "dominio-pe-com-pe",
      title: "Dominio .pe / .com.pe",
      category: "INFRASTRUCTURE",
      priceCents: 18000,
      taxCents: 0,
      includesTax: true,
      features: ["SSL", "Primer mes de VPS"],
    },
    {
      slug: "hosting-basico",
      title: "Hosting Básico",
      category: "INFRASTRUCTURE",
      priceCents: 3000,
      taxCents: 0,
      includesTax: true,
      billingCycle: "MONTHLY",
      features: [],
    },
    {
      slug: "hosting-premium",
      title: "Hosting Premium",
      category: "INFRASTRUCTURE",
      priceCents: 5000,
      taxCents: 0,
      includesTax: true,
      billingCycle: "MONTHLY",
      features: [],
    },
  ];

  for (const [sortOrder, plan] of plans.entries()) {
    const data = {
      ...plan,
      features: JSON.stringify(plan.features),
      sortOrder,
      note: plan.category === "WEB" ? WEB_PRICE_NOTE : null,
      published: true,
    };
    await prisma.plan.upsert({ where: { slug: plan.slug }, update: {}, create: data });
  }
}

async function seedStoreCategories() {
  const categories = [
    { slug: "laptops", name: "Laptops", description: "Equipos portátiles para productividad, diseño y desarrollo." },
    { slug: "pc-workstations", name: "PC & Workstations", description: "Equipos de alto rendimiento configurados para trabajo profesional." },
    { slug: "componentes", name: "Componentes", description: "Memoria, almacenamiento y piezas para ampliar tu equipo." },
    { slug: "perifericos", name: "Periféricos", description: "Teclados, mouse, audio y accesorios de control." },
    {
      slug: "licencias-de-software",
      name: "Software & licencias",
      description: "Licencias originales de Adobe, Corel, Microsoft, antivirus, Autodesk y otras marcas.",
    },
    { slug: "accesorios", name: "Accesorios", description: "Conectividad, protección y organización para tu setup." },
    {
      slug: "wilo-education",
      name: "Wilo Education",
      description: "Kits de robótica educativa tipo LEGO (STEM) para niños, colegios y talleres.",
    },
  ];
  for (const [sortOrder, category] of categories.entries()) {
    await prisma.productCategory.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description, active: true, sortOrder },
      create: { ...category, active: true, sortOrder },
    });
  }
}

async function seedStoreProducts() {
  const products = [
    { slug: "wilo-creator-14", sku: "WILO-LAP-014", name: "Wilo Creator 14", category: "laptops", brand: "Wilo Select", detail: "Laptop creativa", priceCents: 349900, stock: 7, featured: true, image: "/images/wilo/generated/store-products-v1.webp", specs: ["Intel Core Ultra 7", "32 GB RAM", "SSD NVMe 1 TB", "Pantalla 14 pulgadas 2.8K"] },
    { slug: "thinkpad-e14-gen-6", sku: "LEN-E14-G6", name: "ThinkPad E14 Gen 6", category: "laptops", brand: "Lenovo", detail: "Laptop empresarial", priceCents: 419900, stock: 4, featured: false, image: "/images/wilo/generated/store-products-v1.webp", specs: ["Intel Core Ultra 5", "16 GB RAM", "SSD 512 GB", "Garantía local"] },
    { slug: "workstation-aqp-x7", sku: "WILO-WS-X7", name: "Workstation AQP X7", category: "pc-workstations", brand: "Wilo Select", detail: "Estación de trabajo", priceCents: 629900, stock: 3, featured: true, image: "/images/wilo/generated/store-products-v1.webp", specs: ["AMD Ryzen 9", "NVIDIA RTX", "64 GB RAM", "SSD NVMe 2 TB"] },
    { slug: "kingston-fury-32gb-ddr5", sku: "KNG-FRY-32", name: "Kingston Fury 32 GB DDR5", category: "componentes", brand: "Kingston", detail: "Memoria RAM", priceCents: 38900, stock: 18, featured: false, image: "/images/wilo/generated/store-products-v1.webp", specs: ["Kit 2 x 16 GB", "DDR5", "6000 MT/s", "Garantía del fabricante"] },
    { slug: "samsung-990-pro-2tb", sku: "SAM-990-2T", name: "Samsung 990 PRO 2 TB", category: "componentes", brand: "Samsung", detail: "SSD NVMe", priceCents: 79900, stock: 10, featured: true, image: "/images/wilo/generated/store-products-v1.webp", specs: ["NVMe PCIe 4.0", "2 TB", "Disipador incluido", "Software de monitoreo"] },
    { slug: "logitech-mx-master-3s", sku: "LOG-MX3S", name: "Logitech MX Master 3S", category: "perifericos", brand: "Logitech", detail: "Mouse inalámbrico", priceCents: 42900, stock: 12, featured: false, image: "/images/wilo/generated/store-products-v1.webp", specs: ["Sensor 8K DPI", "Bluetooth", "USB Logi Bolt", "Carga USB-C"] },
    { slug: "keychron-k2-pro", sku: "KEY-K2-PRO", name: "Keychron K2 Pro", category: "perifericos", brand: "Keychron", detail: "Teclado mecánico", priceCents: 44900, stock: 6, featured: false, image: "/images/wilo/generated/store-products-v1.webp", specs: ["Formato 75%", "Hot swap", "Bluetooth y USB-C", "Compatible con Windows y macOS"] },
    { slug: "microsoft-365-business-standard", sku: "MS-365-BS", name: "Microsoft 365 Business Standard", category: "licencias-de-software", brand: "Microsoft", detail: "Suscripción anual", priceCents: 52900, stock: null, digital: true, featured: true, image: "/services/corporate-email/visual.webp", specs: ["12 meses", "Aplicaciones Office", "Correo empresarial", "Entrega digital"] },
    { slug: "windows-11-pro", sku: "MS-W11-PRO", name: "Windows 11 Pro", category: "licencias-de-software", brand: "Microsoft", detail: "Licencia permanente", priceCents: 69900, stock: null, digital: true, featured: false, image: "/services/platforms/visual.webp", specs: ["Licencia original", "Activación digital", "1 dispositivo", "Soporte de instalación"] },
    { slug: "adobe-creative-cloud-anual", sku: "ADB-CC-12M", name: "Adobe Creative Cloud", category: "licencias-de-software", brand: "Adobe", detail: "Suscripción anual", priceCents: 239900, stock: null, digital: true, featured: true, image: "/services/audiovisual/visual.webp", specs: ["12 meses", "Suite creativa", "Almacenamiento en la nube", "Activación coordinada"] },
    { slug: "dock-usb-c-11-en-1", sku: "WILO-DCK-11", name: "Dock USB-C 11 en 1", category: "accesorios", brand: "Wilo Select", detail: "Conectividad", priceCents: 29900, stock: 15, featured: false, image: "/images/wilo/generated/store-products-v1.webp", specs: ["HDMI 4K", "Ethernet Gigabit", "USB-C PD", "Lector SD"] },
    { slug: "mochila-tech-pro", sku: "WILO-BAG-PRO", name: "Mochila Tech Pro", category: "accesorios", brand: "Wilo Select", detail: "Protección y transporte", priceCents: 18900, stock: 20, featured: false, image: "/images/wilo/generated/store-products-v1.webp", specs: ["Hasta 16 pulgadas", "Compartimentos acolchados", "Tela resistente al agua", "Bolsillo de seguridad"] },
    { slug: "kit-robotica-explorer", sku: "WEDU-ROB-01", name: "Kit Robótica Explorer", category: "wilo-education", brand: "Wilo Education", detail: "Kit STEM", priceCents: 89900, stock: 9, featured: true, image: "/images/wilo/generated/education-robot-v2.webp", specs: ["Controlador programable", "Sensores y motores", "Guía de actividades", "Acompañamiento inicial"] },
  ];
  for (const product of products) {
    const category = await prisma.productCategory.findUnique({ where: { slug: product.category } });
    if (!category) continue;
    const data = {
      categoryId: category.id,
      sku: product.sku,
      name: product.name,
      description: `${product.name} seleccionado para una experiencia de compra clara, con disponibilidad y entrega coordinadas por Wilo Studio.`,
      specifications: JSON.stringify(product.specs),
      images: JSON.stringify([product.image]),
      licenseType: product.brand,
      licenseDuration: product.detail,
      digital: product.digital ?? false,
      priceCents: product.priceCents,
      includesTax: true,
      currency: "PEN",
      stock: product.stock,
      active: true,
      featured: product.featured,
    };
    await prisma.product.upsert({ where: { slug: product.slug }, update: data, create: { slug: product.slug, ...data } });
  }
}

async function seedPromotion() {
  const details = [
    "S/500 de descuento en apps Android",
    "S/100 de descuento en versión Apple",
    "Funciones adicionales para tu web: pasarelas Stripe, Culqi, Izipay o Niubiz",
    "Login con Google, Facebook, Apple o Microsoft",
    "API SUNAT",
    "Integración 3D y planos",
  ];
  await prisma.promotion.upsert({
    where: { slug: "promo-agosto" },
    update: {},
    create: {
      slug: "promo-agosto",
      title: "Promo de Agosto",
      details: JSON.stringify(details),
      referralBenefit: "3 referidos = nuevas funciones gratis para tu web",
      active: false,
      featured: true,
    },
  });
  await prisma.promotion.upsert({
    where: { slug: "bienvenida-store" },
    update: {
      code: "WILO10",
      discountType: "PERCENT",
      discountValue: 10,
      minimumCents: 20_000,
      maxUses: 500,
      active: true,
    },
    create: {
      slug: "bienvenida-store",
      title: "Bienvenida Wilo Store",
      summary: "10% de descuento en productos elegibles desde S/ 200.",
      details: JSON.stringify(["Válido en el catálogo Wilo Store", "Sujeto a stock y vigencia"]),
      code: "WILO10",
      discountType: "PERCENT",
      discountValue: 10,
      minimumCents: 20_000,
      maxUses: 500,
      categorySlugs: "[]",
      productIds: "[]",
      active: true,
      featured: false,
    },
  });
}

async function seedSettings() {
  const settings = [
    ["business.name", "Wilo Studio", "text", true, null],
    ["business.owner", "WILO INDUSTRIES GROUP E.I.R.L.", "text", true, null],
    ["business.ruc", "10614138365", "text", true, null],
    ["business.location", "Arequipa, Perú", "text", true, null],
    ["business.invoice_note", "Emitimos boleta y factura electrónica.", "text", true, null],
    ["contact.whatsapp", "51936617557", "text", true, null],
    ["contact.email", "hola@wilostudio.com", "text", true, "Pendiente de confirmar con el dueño."],
    ["contact.email_verified", "false", "boolean", true, "Activar solo después de validar la cuenta."],
    ["site.url", "https://wilostudio.site", "url", true, null],
    ["projects.payment_terms", "50% para iniciar y 50% contra entrega.", "text", true, null],
    ["referrals.current_rule", "3 referidos = nuevas funciones gratis para tu web", "text", true, null],
    ["payments.yape_plin", "936 617 557", "text", true, null],
    ["payments.instructions", "Una vez realizado el pago, envíanos el comprobante por WhatsApp.", "text", true, null],
    [
      "payments.bank_accounts",
      JSON.stringify([
        { bank: "BCP", currency: "PEN", account: "38018217208082", cci: "00238011821720808247" },
        { bank: "BCP", currency: "USD", account: "38018217205179", cci: "00238011821720517944" },
        { bank: "BBVA", currency: "PEN", account: "0011-0240-0201346113", cci: "01124000020134611398" },
        { bank: "Interbank", currency: "PEN", account: "898 3516438012", cci: "00389801351643801247" },
        { bank: "Scotiabank", currency: "PEN", account: "1290589918", cci: "00904220129058991836" },
        { bank: "BanBif", currency: "PEN", account: "008034993751", cci: "03871010803499375107" },
      ]),
      "json",
      true,
      null,
    ],
  ];

  for (const [key, value, type, isPublic, description] of settings) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value, type, public: isPublic, description },
      create: { key, value, type, public: isPublic, description },
    });
  }
}

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn("ADMIN_EMAIL/ADMIN_PASSWORD no están definidos; no se creó ningún superadministrador.");
    return;
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("ADMIN_EMAIL no es un correo válido.");
  if (password.length < 12) throw new Error("ADMIN_PASSWORD debe tener al menos 12 caracteres.");
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: { role: "SUPER_ADMIN", active: true },
    create: { email, passwordHash, role: "SUPER_ADMIN", active: true, name: "Superadministrador" },
  });
}

async function main() {
  await seedClients();
  await seedProjects();
  await seedServices();
  await seedPlans();
  await seedStoreCategories();
  await seedStoreProducts();
  await seedPromotion();
  await seedSettings();
  await seedAdmin();
  console.info("Seed de Wilo Studio completado.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
