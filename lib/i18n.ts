export const supportedLocales = ["es", "en", "de", "zh", "ja", "qu", "pt"] as const;

export type Locale = (typeof supportedLocales)[number];

export const localeCookieName = "wilo_locale";

export const localeOptions: ReadonlyArray<{
  code: Locale;
  label: string;
  shortLabel: string;
  flag: string;
  htmlLang: string;
  numberLocale: string;
}> = [
  { code: "es", label: "Español", shortLabel: "ES", flag: "/flags/es.svg", htmlLang: "es-PE", numberLocale: "es-PE" },
  { code: "en", label: "English", shortLabel: "EN", flag: "/flags/en.svg", htmlLang: "en", numberLocale: "en-US" },
  { code: "de", label: "Deutsch", shortLabel: "DE", flag: "/flags/de.svg", htmlLang: "de", numberLocale: "de-DE" },
  { code: "zh", label: "中文", shortLabel: "ZH", flag: "/flags/zh.svg", htmlLang: "zh-CN", numberLocale: "zh-CN" },
  { code: "ja", label: "日本語", shortLabel: "JA", flag: "/flags/ja.svg", htmlLang: "ja", numberLocale: "ja-JP" },
  { code: "qu", label: "Runasimi", shortLabel: "QU", flag: "/flags/qu.svg", htmlLang: "qu-PE", numberLocale: "qu-PE" },
  { code: "pt", label: "Português", shortLabel: "PT", flag: "/flags/pt.svg", htmlLang: "pt-BR", numberLocale: "pt-BR" },
] as const;

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && supportedLocales.includes(value as Locale);
}

const es = {
  "a11y.skip": "Saltar al contenido",
  "a11y.mainNavigation": "Navegación principal",
  "a11y.homeNavigation": "Navegación del inicio",
  "a11y.mobileNavigation": "Navegación móvil",
  "a11y.language": "Seleccionar idioma",
  "a11y.openMenu": "Abrir menú",
  "a11y.closeMenu": "Cerrar menú",
  "a11y.openCart": "Abrir carrito, {count} productos",
  "nav.home": "Inicio",
  "nav.work": "Trabajos",
  "nav.projects": "Proyectos",
  "nav.services": "Servicios",
  "nav.about": "Nosotros",
  "nav.ecosystem": "Ecosistema",
  "nav.contact": "Contacto",
  "nav.quote": "Cotizar",
  "nav.startProject": "Iniciar un proyecto",
  "nav.whatsapp": "Escríbenos por WhatsApp",
  "footer.aria": "Información de Wilo Studio",
  "footer.promise": "Transformamos ideas\nen experiencias\ndigitales excepcionales.",
  "footer.projectTalk": "Hablemos de tu proyecto",
  "footer.writeHere": "Escríbenos aquí",
  "footer.whatsappTalk": "Conversemos por WhatsApp",
  "footer.fromSouth": "Desde el sur para el mundo",
  "footer.connectingIdeas": "Ideas\nque conectan.",
  "footer.studioSubtitle": "Conoce nuestro mundo",
  "footer.ecosystemSubtitle": "Más allá de un estudio",
  "footer.legal": "LEGAL",
  "footer.legalSubtitle": "Transparencia siempre",
  "footer.privacy": "Política de privacidad",
  "footer.terms": "Términos y condiciones",
  "footer.cookies": "Política de cookies",
  "footer.complaints": "Libro de reclamaciones",
  "footer.payments": "Medios de pago",
  "footer.allEcosystem": "Todo el ecosistema",
  "footer.weAre": "SOMOS WILO STUDIO",
  "footer.about": "Creatividad, tecnología y personas, trabajando por un mundo digital más increíble.",
  "footer.manifesto": "Buenas ideas.\nTrabajo real.\nGrandes posibilidades.",
  "footer.keepCreating": "¡Sigamos creando!",
  "footer.rights": "Todos los derechos reservados.",
  "footer.peruvianBilling": "Perú · Facturación peruana.",
  "footer.globalBilling": "United States · Facturación internacional.",
  "footer.borderlessIdeas": "Ideas sin fronteras",
  "footer.sameCommitment": "Un mismo compromiso.",
  "footer.worldLine": "AREQUIPA, PERÚ · UNITED STATES · EL MUNDO",
  "footer.backTop": "Volver arriba",
  "language.changed": "Idioma cambiado a {language}",
} as const;

export type MessageKey = keyof typeof es;
type Dictionary = Record<MessageKey, string>;

const en: Dictionary = {
  "a11y.skip": "Skip to content", "a11y.mainNavigation": "Main navigation", "a11y.homeNavigation": "Home navigation", "a11y.mobileNavigation": "Mobile navigation", "a11y.language": "Select language", "a11y.openMenu": "Open menu", "a11y.closeMenu": "Close menu", "a11y.openCart": "Open cart, {count} products",
  "nav.home": "Home", "nav.work": "Work", "nav.projects": "Projects", "nav.services": "Services", "nav.about": "About us", "nav.ecosystem": "Ecosystem", "nav.contact": "Contact", "nav.quote": "Get a quote", "nav.startProject": "Start a project", "nav.whatsapp": "Message us on WhatsApp",
  "footer.aria": "Wilo Studio information", "footer.promise": "We transform ideas\ninto exceptional\ndigital experiences.", "footer.projectTalk": "Let’s talk about your project", "footer.writeHere": "Write to us here", "footer.whatsappTalk": "Let’s talk on WhatsApp", "footer.fromSouth": "From southern Peru to the world", "footer.connectingIdeas": "Ideas\nthat connect.", "footer.studioSubtitle": "Discover our world", "footer.ecosystemSubtitle": "Beyond a studio", "footer.legal": "LEGAL", "footer.legalSubtitle": "Transparency, always", "footer.privacy": "Privacy policy", "footer.terms": "Terms and conditions", "footer.cookies": "Cookie policy", "footer.complaints": "Complaints book", "footer.payments": "Payment methods", "footer.allEcosystem": "Explore the ecosystem", "footer.weAre": "WE ARE WILO STUDIO", "footer.about": "Creativity, technology and people working toward a more remarkable digital world.", "footer.manifesto": "Good ideas.\nReal work.\nGreat possibilities.", "footer.keepCreating": "Let’s keep creating!", "footer.rights": "All rights reserved.", "footer.peruvianBilling": "Peru · Peruvian billing.", "footer.globalBilling": "United States · International billing.", "footer.borderlessIdeas": "Ideas without borders", "footer.sameCommitment": "The same commitment.", "footer.worldLine": "AREQUIPA, PERU · UNITED STATES · THE WORLD", "footer.backTop": "Back to top", "language.changed": "Language changed to {language}",
};

const de: Dictionary = {
  "a11y.skip": "Zum Inhalt springen", "a11y.mainNavigation": "Hauptnavigation", "a11y.homeNavigation": "Startseitennavigation", "a11y.mobileNavigation": "Mobile Navigation", "a11y.language": "Sprache auswählen", "a11y.openMenu": "Menü öffnen", "a11y.closeMenu": "Menü schließen", "a11y.openCart": "Warenkorb öffnen, {count} Produkte",
  "nav.home": "Start", "nav.work": "Arbeiten", "nav.projects": "Projekte", "nav.services": "Leistungen", "nav.about": "Über uns", "nav.ecosystem": "Ökosystem", "nav.contact": "Kontakt", "nav.quote": "Angebot", "nav.startProject": "Projekt starten", "nav.whatsapp": "Schreiben Sie uns per WhatsApp",
  "footer.aria": "Informationen über Wilo Studio", "footer.promise": "Wir verwandeln Ideen\nin außergewöhnliche\ndigitale Erlebnisse.", "footer.projectTalk": "Sprechen wir über Ihr Projekt", "footer.writeHere": "Schreiben Sie uns hier", "footer.whatsappTalk": "Kontakt über WhatsApp", "footer.fromSouth": "Vom Süden Perus in die Welt", "footer.connectingIdeas": "Ideen,\ndie verbinden.", "footer.studioSubtitle": "Entdecken Sie unsere Welt", "footer.ecosystemSubtitle": "Mehr als ein Studio", "footer.legal": "RECHTLICHES", "footer.legalSubtitle": "Transparenz, immer", "footer.privacy": "Datenschutzerklärung", "footer.terms": "Allgemeine Geschäftsbedingungen", "footer.cookies": "Cookie-Richtlinie", "footer.complaints": "Beschwerdebuch", "footer.payments": "Zahlungsarten", "footer.allEcosystem": "Das ganze Ökosystem", "footer.weAre": "WIR SIND WILO STUDIO", "footer.about": "Kreativität, Technologie und Menschen für eine außergewöhnlichere digitale Welt.", "footer.manifesto": "Gute Ideen.\nEchte Arbeit.\nGroße Möglichkeiten.", "footer.keepCreating": "Weiter kreativ sein!", "footer.rights": "Alle Rechte vorbehalten.", "footer.peruvianBilling": "Peru · Peruanische Rechnungsstellung.", "footer.globalBilling": "United States · Internationale Rechnungsstellung.", "footer.borderlessIdeas": "Ideen ohne Grenzen", "footer.sameCommitment": "Dasselbe Engagement.", "footer.worldLine": "AREQUIPA, PERU · UNITED STATES · DIE WELT", "footer.backTop": "Nach oben", "language.changed": "Sprache geändert zu {language}",
};

const zh: Dictionary = {
  "a11y.skip": "跳到主要内容", "a11y.mainNavigation": "主导航", "a11y.homeNavigation": "首页导航", "a11y.mobileNavigation": "移动导航", "a11y.language": "选择语言", "a11y.openMenu": "打开菜单", "a11y.closeMenu": "关闭菜单", "a11y.openCart": "打开购物车，{count} 件商品",
  "nav.home": "首页", "nav.work": "作品", "nav.projects": "项目", "nav.services": "服务", "nav.about": "关于我们", "nav.ecosystem": "生态系统", "nav.contact": "联系", "nav.quote": "获取报价", "nav.startProject": "启动项目", "nav.whatsapp": "通过 WhatsApp 联系我们",
  "footer.aria": "Wilo Studio 信息", "footer.promise": "将创意转化为\n卓越的\n数字体验。", "footer.projectTalk": "聊聊您的项目", "footer.writeHere": "在这里联系我们", "footer.whatsappTalk": "通过 WhatsApp 沟通", "footer.fromSouth": "从秘鲁南部走向世界", "footer.connectingIdeas": "连接彼此的\n创意。", "footer.studioSubtitle": "了解我们的世界", "footer.ecosystemSubtitle": "不止于工作室", "footer.legal": "法律信息", "footer.legalSubtitle": "始终透明", "footer.privacy": "隐私政策", "footer.terms": "条款与条件", "footer.cookies": "Cookie 政策", "footer.complaints": "投诉登记", "footer.payments": "付款方式", "footer.allEcosystem": "完整生态系统", "footer.weAre": "我们是 WILO STUDIO", "footer.about": "创意、技术与人才，共同打造更精彩的数字世界。", "footer.manifesto": "好创意。\n真行动。\n大可能。", "footer.keepCreating": "继续创造！", "footer.rights": "版权所有。", "footer.peruvianBilling": "秘鲁 · 秘鲁本地开票。", "footer.globalBilling": "美国 · 国际开票。", "footer.borderlessIdeas": "创意无国界", "footer.sameCommitment": "同一份承诺。", "footer.worldLine": "秘鲁阿雷基帕 · 美国 · 全球", "footer.backTop": "返回顶部", "language.changed": "语言已切换为{language}",
};

const ja: Dictionary = {
  "a11y.skip": "本文へ移動", "a11y.mainNavigation": "メインナビゲーション", "a11y.homeNavigation": "ホームナビゲーション", "a11y.mobileNavigation": "モバイルナビゲーション", "a11y.language": "言語を選択", "a11y.openMenu": "メニューを開く", "a11y.closeMenu": "メニューを閉じる", "a11y.openCart": "カートを開く、{count}点",
  "nav.home": "ホーム", "nav.work": "実績", "nav.projects": "プロジェクト", "nav.services": "サービス", "nav.about": "私たちについて", "nav.ecosystem": "エコシステム", "nav.contact": "お問い合わせ", "nav.quote": "見積もり", "nav.startProject": "プロジェクトを始める", "nav.whatsapp": "WhatsAppで問い合わせる",
  "footer.aria": "Wilo Studio の情報", "footer.promise": "アイデアを\n卓越したデジタル体験へ\n変えていきます。", "footer.projectTalk": "プロジェクトについて相談する", "footer.writeHere": "こちらからお問い合わせ", "footer.whatsappTalk": "WhatsAppで相談する", "footer.fromSouth": "ペルー南部から世界へ", "footer.connectingIdeas": "人をつなぐ\nアイデア。", "footer.studioSubtitle": "私たちの世界を知る", "footer.ecosystemSubtitle": "スタジオのその先へ", "footer.legal": "法的情報", "footer.legalSubtitle": "いつでも透明に", "footer.privacy": "プライバシーポリシー", "footer.terms": "利用規約", "footer.cookies": "Cookieポリシー", "footer.complaints": "苦情受付簿", "footer.payments": "お支払い方法", "footer.allEcosystem": "エコシステム全体", "footer.weAre": "WILO STUDIOです", "footer.about": "創造性、テクノロジー、そして人の力で、より素晴らしいデジタル世界へ。", "footer.manifesto": "良いアイデア。\n確かな仕事。\n大きな可能性。", "footer.keepCreating": "創造し続けよう！", "footer.rights": "無断転載を禁じます。", "footer.peruvianBilling": "ペルー · ペルー国内請求。", "footer.globalBilling": "米国 · 国際請求。", "footer.borderlessIdeas": "国境のないアイデア", "footer.sameCommitment": "変わらない約束。", "footer.worldLine": "アレキパ、ペルー · 米国 · 世界", "footer.backTop": "トップへ戻る", "language.changed": "言語を{language}に変更しました",
};

const qu: Dictionary = {
  "a11y.skip": "Ukhunman riy", "a11y.mainNavigation": "Hatun purichiq", "a11y.homeNavigation": "Qallariy purichiq", "a11y.mobileNavigation": "Kuyuq purichiq", "a11y.language": "Rimayta akllay", "a11y.openMenu": "Akllanata kichay", "a11y.closeMenu": "Akllanata wichq'ay", "a11y.openCart": "Rantinapaq wayaqata kichay, {count} rurukuna",
  "nav.home": "Qallariy", "nav.work": "Llamk'aykuna", "nav.projects": "Ruwanakuna", "nav.services": "Yanapakuykuna", "nav.about": "Ñuqayku", "nav.ecosystem": "Ecosistema", "nav.contact": "Rimariwayku", "nav.quote": "Chaninchayta mañay", "nav.startProject": "Ruwanata qallariy", "nav.whatsapp": "WhatsApp nisqawan qillqawayku",
  "footer.aria": "Wilo Studio willakuy", "footer.promise": "Yuyaykunata\nsumaq experiencia digitalman\ntikrayku.", "footer.projectTalk": "Ruwanaykimanta rimarisun", "footer.writeHere": "Kaypi qillqawayku", "footer.whatsappTalk": "WhatsApp nisqapi rimarisun", "footer.fromSouth": "Perú suyupa urayninmanta pachaman", "footer.connectingIdeas": "Tinkuchiq\nyuyaykuna.", "footer.studioSubtitle": "Pachaykuta riqsiy", "footer.ecosystemSubtitle": "Estudiomanta aswan karuman", "footer.legal": "KAMACHIY", "footer.legalSubtitle": "Sut'i kay wiñaypaq", "footer.privacy": "Sapanchasqa willakuy kamachiy", "footer.terms": "Kamachiykuna", "footer.cookies": "Cookie kamachiy", "footer.complaints": "Willakuykunapa qillqana", "footer.payments": "Qullqi quypa ñankuna", "footer.allEcosystem": "Tukuy ecosistema", "footer.weAre": "WILO STUDIO KAYKU", "footer.about": "Yuyay, tecnología, runakunapas aswan sumaq digital pachapaq kuska llamk'anku.", "footer.manifesto": "Sumaq yuyaykuna.\nChiqap llamk'ay.\nHatun atiykuna.", "footer.keepCreating": "Ruwaspa puririsun!", "footer.rights": "Tukuy hayñikuna waqaychasqa.", "footer.peruvianBilling": "Perú · Perú suyupi facturación.", "footer.globalBilling": "United States · Hawa suyukunapa facturación.", "footer.borderlessIdeas": "Mana qurpayuq yuyaykuna", "footer.sameCommitment": "Kikin compromiso.", "footer.worldLine": "AREQUIPA, PERÚ · UNITED STATES · PACHA", "footer.backTop": "Hawanman kutiy", "language.changed": "Rimayqa {language} nisqaman tikrasqa",
};

const pt: Dictionary = {
  "a11y.skip": "Pular para o conteúdo", "a11y.mainNavigation": "Navegação principal", "a11y.homeNavigation": "Navegação inicial", "a11y.mobileNavigation": "Navegação móvel", "a11y.language": "Selecionar idioma", "a11y.openMenu": "Abrir menu", "a11y.closeMenu": "Fechar menu", "a11y.openCart": "Abrir carrinho, {count} produtos",
  "nav.home": "Início", "nav.work": "Trabalhos", "nav.projects": "Projetos", "nav.services": "Serviços", "nav.about": "Sobre nós", "nav.ecosystem": "Ecossistema", "nav.contact": "Contato", "nav.quote": "Solicitar orçamento", "nav.startProject": "Iniciar um projeto", "nav.whatsapp": "Fale conosco pelo WhatsApp",
  "footer.aria": "Informações da Wilo Studio", "footer.promise": "Transformamos ideias\nem experiências digitais\nexcepcionais.", "footer.projectTalk": "Vamos falar sobre seu projeto", "footer.writeHere": "Escreva para nós aqui", "footer.whatsappTalk": "Vamos conversar no WhatsApp", "footer.fromSouth": "Do sul do Peru para o mundo", "footer.connectingIdeas": "Ideias\nque conectam.", "footer.studioSubtitle": "Conheça nosso mundo", "footer.ecosystemSubtitle": "Além de um estúdio", "footer.legal": "LEGAL", "footer.legalSubtitle": "Transparência sempre", "footer.privacy": "Política de privacidade", "footer.terms": "Termos e condições", "footer.cookies": "Política de cookies", "footer.complaints": "Livro de reclamações", "footer.payments": "Formas de pagamento", "footer.allEcosystem": "Todo o ecossistema", "footer.weAre": "SOMOS A WILO STUDIO", "footer.about": "Criatividade, tecnologia e pessoas trabalhando por um mundo digital mais incrível.", "footer.manifesto": "Boas ideias.\nTrabalho real.\nGrandes possibilidades.", "footer.keepCreating": "Vamos continuar criando!", "footer.rights": "Todos os direitos reservados.", "footer.peruvianBilling": "Peru · Faturamento peruano.", "footer.globalBilling": "Estados Unidos · Faturamento internacional.", "footer.borderlessIdeas": "Ideias sem fronteiras", "footer.sameCommitment": "O mesmo compromisso.", "footer.worldLine": "AREQUIPA, PERU · ESTADOS UNIDOS · O MUNDO", "footer.backTop": "Voltar ao topo", "language.changed": "Idioma alterado para {language}",
};

export const dictionaries: Record<Locale, Dictionary> = { es, en, de, zh, ja, qu, pt };

export function translate(locale: Locale, key: MessageKey, values?: Record<string, string | number>) {
  let message = dictionaries[locale][key] ?? es[key];
  if (values) {
    for (const [name, value] of Object.entries(values)) message = message.replaceAll(`{${name}}`, String(value));
  }
  return message;
}

export function getLocaleOption(locale: Locale) {
  return localeOptions.find((option) => option.code === locale) ?? localeOptions[0];
}
