"use client";

import { useEffect, useRef, useState } from "react";

export function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const ran = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || ran.current) return;
      ran.current = true;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setCount(value);
      } else {
        const start = performance.now();
        const frame = (now: number) => {
          const progress = Math.min(1, (now - start) / 1300);
          setCount(Math.round(value * (1 - Math.pow(1 - progress, 3))));
          if (progress < 1) requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      }
      observer.disconnect();
    }, { threshold: 0.4 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [value]);

  return <span ref={ref}>{count}{suffix}</span>;
}
