"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

export function ProductGallery({ images, productName, stockLabel }: { images: readonly string[]; productName: string; stockLabel: string }) {
  const [active, setActive] = useState(0);
  const select = (index: number) => setActive((index + images.length) % images.length);
  return (
    <div className="product-detail-gallery">
      <div className="product-detail-media">
        <Image key={images[active]} src={images[active]} alt={`${productName}, vista ${active + 1}`} fill priority={active === 0} sizes="(max-width: 900px) 100vw, 50vw" />
        <span>{stockLabel}</span>
        {images.length > 1 ? <div className="product-gallery-arrows"><button type="button" aria-label="Imagen anterior" onClick={() => select(active - 1)}><ChevronLeft /></button><button type="button" aria-label="Imagen siguiente" onClick={() => select(active + 1)}><ChevronRight /></button></div> : null}
      </div>
      {images.length > 1 ? <div className="product-detail-thumbnails" aria-label={`Galería de ${productName}`}>{images.map((image, index) => <button type="button" aria-current={active === index ? "true" : undefined} onClick={() => select(index)} key={`${image}-${index}`}><Image src={image} alt={`${productName}, miniatura ${index + 1}`} fill sizes="(max-width: 680px) 30vw, 12vw" /></button>)}</div> : null}
    </div>
  );
}
