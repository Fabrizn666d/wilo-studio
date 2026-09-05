"use client";

import { useRef, type ReactNode, type PointerEvent } from "react";
import { useHydratedReducedMotion } from "@/lib/use-hydrated-reduced-motion";

/** A small local parallax. It never captures wheel or touch gestures. */
export function EditorialTilt({ children, className }: { children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useHydratedReducedMotion();
  function move(event: PointerEvent<HTMLDivElement>) {
    if (reduced || event.pointerType !== "mouse" || !root.current) return;
    const rect = root.current.getBoundingClientRect();
    root.current.style.setProperty("--scene-tilt-x", `${-(event.clientY - rect.top - rect.height / 2) / rect.height * 2}deg`);
    root.current.style.setProperty("--scene-tilt-y", `${(event.clientX - rect.left - rect.width / 2) / rect.width * 3}deg`);
  }
  function reset() {
    root.current?.style.setProperty("--scene-tilt-x", "0deg");
    root.current?.style.setProperty("--scene-tilt-y", "0deg");
  }
  return <div ref={root} className={className} onPointerMove={move} onPointerLeave={reset}>{children}</div>;
}
