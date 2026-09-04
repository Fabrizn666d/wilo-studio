"use client";

import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowLeft, ArrowRight, BadgeCheck, Quote } from "lucide-react";
import type { PublicTestimonial } from "@/lib/public-data";

export function TestimonialsCarousel({ items }: { items: PublicTestimonial[] }) {
  const [ref, api] = useEmblaCarousel({ align: "start", loop: true, dragFree: false });
  if (!items.length) {
    return (
      <div className="testimonial-pending">
        <BadgeCheck aria-hidden="true" />
        <div>
          <span>Publicación responsable</span>
          <h3>Los testimonios se mostrarán cuando estén validados.</h3>
          <p>El panel ya permite cargarlos y aprobarlos. Hasta entonces, no atribuimos citas ni cargos sin autorización expresa.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="testimonial-carousel">
      <div className="testimonial-viewport" ref={ref}>
        <div className="testimonial-track">
          {items.map((item) => (
            <article className="testimonial-card" key={item.id}>
              <Quote className="quote-icon" size={38} />
              <blockquote>“{item.quote}”</blockquote>
              <div className="testimonial-author">
                {item.avatarUrl?.startsWith("/") ? <Image src={item.avatarUrl} alt="" width={52} height={52} /> : <span className="testimonial-avatar" aria-hidden="true">{item.name.slice(0, 1)}</span>}
                <div><strong>{item.name}</strong><span>{[item.role, item.company].filter(Boolean).join(" · ")}</span></div>
              </div>
            </article>
          ))}
        </div>
      </div>
      {items.length > 1 && <div className="carousel-actions"><button onClick={() => api?.scrollPrev()} aria-label="Testimonio anterior"><ArrowLeft /></button><button onClick={() => api?.scrollNext()} aria-label="Testimonio siguiente"><ArrowRight /></button></div>}
    </div>
  );
}
