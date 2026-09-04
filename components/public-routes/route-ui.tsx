import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Check, MessageCircle } from "lucide-react";
import type { ReactNode } from "react";
import { whatsappLinkFor } from "@/lib/content";
import { getPublicSiteSettings } from "@/lib/site-settings";

type HeroTone = "yellow" | "cream" | "dark";

export async function PublicHero({
  eyebrow,
  title,
  description,
  tone = "cream",
  image,
  imageAlt,
  imageContain = false,
  badge,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  tone?: HeroTone;
  image?: string;
  imageAlt?: string;
  imageContain?: boolean;
  badge?: string;
  children?: ReactNode;
}) {
  const settings = await getPublicSiteSettings();
  return (
    <header className={`pr-hero pr-hero--${tone}`}>
      <div className="pr-shell pr-hero__grid">
        <div className="pr-hero__copy">
          <span className="pr-kicker">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
          <div className="pr-hero__actions">
            {children ?? (
              <>
                <Link className={tone === "dark" ? "pr-button pr-button--yellow" : "pr-button pr-button--dark"} href="/contacto">
                  Cotiza tu proyecto <ArrowRight aria-hidden="true" size={18} />
                </Link>
                <a
                  className={tone === "dark" ? "pr-button pr-button--line-light" : "pr-button pr-button--line"}
                  href={settings.whatsapp}
                  rel="noreferrer"
                  target="_blank"
                >
                  <MessageCircle aria-hidden="true" size={18} /> WhatsApp
                </a>
              </>
            )}
          </div>
        </div>
        {image ? (
          <div className={`pr-hero__visual${imageContain ? " is-contain" : ""}`}>
            <Image
              alt={imageAlt ?? "Wilo Studio"}
              fill
              priority
              sizes="(max-width: 820px) 100vw, 44vw"
              src={image}
              style={{ objectFit: imageContain ? "contain" : "cover" }}
            />
            {badge ? <span className="pr-floating-badge">{badge}</span> : null}
          </div>
        ) : (
          <div className="pr-hero__signal" aria-hidden="true">
            <span>W</span>
            <i />
            <i />
          </div>
        )}
      </div>
    </header>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  inverse = false,
}: {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  inverse?: boolean;
}) {
  return (
    <div className={`pr-section-heading${inverse ? " is-inverse" : ""}`}>
      <div>
        <span className="pr-kicker">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {description ? <p>{description}</p> : null}
    </div>
  );
}

export async function RouteCta({
  title = "Hagamos que tu siguiente proyecto avance.",
  text = "Cuéntanos qué necesitas. Te responderemos con una propuesta clara de alcance, tiempos e inversión.",
  message = "Hola Wilo Studio, quiero conversar sobre un proyecto.",
}: {
  title?: string;
  text?: string;
  message?: string;
}) {
  const settings = await getPublicSiteSettings();
  return (
    <section className="pr-cta">
      <div className="pr-shell pr-cta__inner">
        <span className="pr-kicker">Siguiente paso</span>
        <h2>{title}</h2>
        <p>{text}</p>
        <div className="pr-cta__actions">
          <Link className="pr-button pr-button--yellow" href="/contacto">
            Solicitar una propuesta <ArrowUpRight aria-hidden="true" size={18} />
          </Link>
          <a className="pr-button pr-button--line-light" href={whatsappLinkFor(settings.phone, message)} rel="noreferrer" target="_blank">
            Escribir por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

export function CheckList({ items }: { items: readonly string[] }) {
  return (
    <ul className="pr-check-list">
      {items.map((item) => (
        <li key={item}>
          <Check aria-hidden="true" size={17} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
