export type RealSite = {
  name: string;
  category: string;
  displayUrl: string;
  href: string;
  logo?: string;
  initials?: string;
};

export const realSites: RealSite[] = [
  { name: "IBEX Constructora", category: "Construcción / corporativo", displayUrl: "ibexconstructora.pe", href: "https://ibexconstructora.pe", logo: "/images/wilo/about/logos/ibex.svg" },
  { name: "Grupo Caldexa", category: "Inmobiliaria / financiamiento", displayUrl: "grupocaldexa.com", href: "https://grupocaldexa.com/", initials: "GC" },
  { name: "Reuse", category: "Ecommerce / tecnología", displayUrl: "reuse.pe", href: "https://www.reuse.pe/", logo: "/images/wilo/about/logos/reuse.svg" },
  { name: "Global Norte", category: "B2B / mayorista", displayUrl: "globalnorte.pe", href: "https://globalnorte.pe/", logo: "/images/wilo/about/logos/global-norte.svg" },
  { name: "Tecnova Perú", category: "Industria / maquinaria", displayUrl: "tecnovaperu.com.pe", href: "https://tecnovaperu.com.pe/", logo: "/images/wilo/about/logos/tecnova.svg" },
  { name: "Geoingenieros", category: "Drones / tecnología", displayUrl: "geoingenieros.com.pe", href: "https://geoingenieros.com.pe/", logo: "/images/wilo/about/logos/geoingenieros.svg" },
  { name: "Hingenia", category: "Educación / cursos", displayUrl: "hingenia.com", href: "https://hingenia.com/", logo: "/images/wilo/about/logos/hingenia.svg" },
  { name: "BICIEM", category: "Evento / comunidad", displayUrl: "biciem.com", href: "https://biciem.com/", logo: "/images/wilo/about/logos/biciem.svg" },
];

export const referenceSites: RealSite[] = [
  { name: "V&V", category: "Inmobiliaria", displayUrl: "vyv.pe", href: "https://vyv.pe/", initials: "V&V" },
  { name: "Abril", category: "Desarrolladora inmobiliaria", displayUrl: "abril.pe", href: "https://abril.pe/", initials: "A" },
  { name: "AutoSell", category: "Automotriz", displayUrl: "autosell.pe", href: "https://www.autosell.pe/inicio", logo: "/images/logo-autosell.png" },
  { name: "Dayun Perú Demo", category: "Automotriz / demo", displayUrl: "dayun-peru-demo.netlify.app", href: "https://dayun-peru-demo.netlify.app/", logo: "/images/logo-dayun.png" },
  { name: "Centrum Motors", category: "Automotriz", displayUrl: "centrummotors.com", href: "https://www.centrummotors.com/", logo: "/images/logo-centrummotors.png" },
];

export const showcaseScreens = [
  { name: "Reloj Shop", src: "/WEBS/cb5c5540-dbf7-440b-b30e-c90c8672c734.png" },
  { name: "KRAC'S Sport", src: "/WEBS/ChatGPT Image 27 jun 2026, 19_54_23.png" },
  { name: "Global Norte", src: "/WEBS/asassa.JPG" },
  { name: "G&V Solar", src: "/WEBS/gv-solar.png" },
  { name: "Bonbazo Musical", src: "/WEBS/bonbazo-musical.png" },
  { name: "Industrias López", src: "/WEBS/industrias-lopez.png" },
] as const;
