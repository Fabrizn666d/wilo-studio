"use client";

import Image from "next/image";
import { CalendarDays, Gift, LoaderCircle, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import { whatsappLinkFor } from "@/lib/content";
import { useSiteSettings } from "@/components/site-settings-provider";

type Promotion = {
  id: string;
  title: string;
  summary?: string | null;
  details?: unknown;
  imageUrl?: string | null;
  referralBenefit?: string | null;
  startAt?: string | null;
  endAt?: string | null;
  featured?: boolean;
};

function dateLabel(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Lima" }).format(date);
}

export function PromotionsFeed() {
  const settings = useSiteSettings();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/promos", { signal: controller.signal })
      .then(async (response) => {
        const payload = (await response.json()) as { ok?: boolean; promotions?: Promotion[] };
        if (!response.ok || !payload.ok) throw new Error("promotions");
        setPromotions(payload.promotions ?? []);
        setStatus("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setStatus("error");
      });
    return () => controller.abort();
  }, []);

  if (status === "loading") return <div className="pr-feed-state is-dark"><LoaderCircle className="pr-spin" aria-hidden="true" /><p>Consultando promociones vigentes…</p></div>;
  if (status === "error") return <div className="pr-feed-state is-dark"><Tag aria-hidden="true" /><p>No pudimos consultar las promociones en este momento.</p><a href={settings.whatsapp} rel="noreferrer" target="_blank">Consultar por WhatsApp</a></div>;
  if (!promotions.length) return <div className="pr-feed-state is-dark"><Gift aria-hidden="true" /><h2>Nuevas oportunidades están por venir.</h2><p>Ahora no hay una promoción publicada como vigente. Cuando el equipo active una desde el administrador, aparecerá automáticamente aquí.</p><a href={settings.whatsapp} rel="noreferrer" target="_blank">Cuéntanos qué necesitas</a></div>;

  return (
    <div className="pr-promo-list">
      {promotions.map((promotion) => {
        const details = Array.isArray(promotion.details) ? promotion.details.filter((item): item is string => typeof item === "string") : [];
        const start = dateLabel(promotion.startAt);
        const end = dateLabel(promotion.endAt);
        const localImage = promotion.imageUrl?.startsWith("/") ? promotion.imageUrl : null;
        return (
          <article className={`pr-promo-card${promotion.featured ? " is-featured" : ""}`} key={promotion.id}>
            {localImage ? <figure><Image alt={`Arte de ${promotion.title}`} fill sizes="(max-width: 820px) 100vw, 42vw" src={localImage} /></figure> : <div className="pr-promo-card__mark" aria-hidden="true"><Gift size={58} /></div>}
            <div className="pr-promo-card__copy">
              <span className="pr-mini-label">Promoción vigente</span>
              <h2>{promotion.title}</h2>
              {promotion.summary ? <p>{promotion.summary}</p> : null}
              {details.length ? <ul>{details.map((detail) => <li key={detail}>{detail}</li>)}</ul> : null}
              {promotion.referralBenefit ? <div className="pr-promo-card__benefit"><Gift aria-hidden="true" size={19} /><span><small>Beneficio por referidos</small><strong>{promotion.referralBenefit}</strong></span></div> : null}
              {start || end ? <p className="pr-promo-card__dates"><CalendarDays aria-hidden="true" size={17} /> {start && end ? `Del ${start} al ${end}` : end ? `Válida hasta el ${end}` : `Vigente desde el ${start}`}</p> : null}
              <a className="pr-button pr-button--yellow" href={whatsappLinkFor(settings.phone, `Hola Wilo Studio, quiero información sobre la promoción: ${promotion.title}.`)} rel="noreferrer" target="_blank">Quiero esta promoción</a>
            </div>
          </article>
        );
      })}
    </div>
  );
}
