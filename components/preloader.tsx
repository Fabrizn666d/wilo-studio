"use client";

import gsap from "gsap";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type LoaderAsset = HTMLImageElement | HTMLVideoElement;
const SESSION_KEY = "wilo-loader-seen";

function isAssetReady(asset: LoaderAsset) {
  return asset instanceof HTMLVideoElement
    ? asset.readyState >= 2
    : asset.complete;
}

export function Preloader() {
  const loaderRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const targetRef = useRef<HTMLElement | null>(null);
  const targetStyleRef = useRef({ opacity: "", visibility: "" });
  const mascotRef = useRef<HTMLElement | null>(null);
  const revealedRef = useRef(false);
  const [visible, setVisible] = useState(true);

  const restoreTarget = useCallback(() => {
    if (!targetRef.current) return;
    targetRef.current.style.opacity = targetStyleRef.current.opacity;
    targetRef.current.style.visibility = targetStyleRef.current.visibility;
    targetRef.current = null;
  }, []);

  const restoreMascot = useCallback(() => {
    if (!mascotRef.current) return;
    gsap.set(mascotRef.current, { clearProps: "transform,opacity,visibility" });
    mascotRef.current = null;
  }, []);

  const revealSite = useCallback(() => {
    if (
      revealedRef.current ||
      !loaderRef.current ||
      !curtainRef.current ||
      !logoRef.current
    ) return;

    revealedRef.current = true;

    const target = document.querySelector<HTMLElement>("[data-wilo-logo-target]");
    const loaderRect = logoRef.current.getBoundingClientRect();
    const targetRect = target?.getBoundingClientRect();
    const destination = targetRect && targetRect.width > 0
      ? {
          x: targetRect.left + targetRect.width / 2 - (loaderRect.left + loaderRect.width / 2),
          y: targetRect.top + targetRect.height / 2 - (loaderRect.top + loaderRect.height / 2),
          scale: targetRect.width / loaderRect.width,
        }
      : { x: 0, y: 0, scale: 0.28 };
    const logoImage = logoRef.current.querySelector("img");
    const mascot = document.querySelector<HTMLElement>("[data-loader-mascot]");

    if (target) {
      targetRef.current = target;
      targetStyleRef.current = {
        opacity: target.style.opacity,
        visibility: target.style.visibility,
      };
      target.style.opacity = "0";
      target.style.visibility = "hidden";
    }

    if (mascot) {
      mascotRef.current = mascot;
      gsap.set(mascot, {
        autoAlpha: 0,
        y: Math.min(window.innerHeight * 0.28, 240),
        scale: 0.96,
      });
    }

    const finish = () => {
      try {
        window.sessionStorage.setItem(SESSION_KEY, "true");
      } catch {}
      document.documentElement.classList.remove("is-wilo-loading");
      restoreTarget();
      restoreMascot();
      loaderRef.current?.setAttribute("aria-hidden", "true");
      setVisible(false);
    };

    const timeline = gsap.timeline({
      delay: 0.06,
      defaults: { overwrite: "auto" },
      onComplete: finish,
    });
    timelineRef.current = timeline;

    timeline
      .to(
        logoRef.current,
        {
          ...destination,
          duration: 0.9,
          ease: "power4.inOut",
        },
        0.16,
      )
      .to(
        curtainRef.current,
        {
          yPercent: -100,
          duration: 1,
          ease: "power4.inOut",
        },
        0.3,
      );

    if (progressRef.current) {
      timeline
        .to(progressRef.current, { scaleX: 1, duration: 0.38, ease: "power2.out" }, 0)
        .to(progressRef.current.parentElement, { autoAlpha: 0, duration: 0.16, ease: "power2.out" }, 0.28);
    }

    if (statusRef.current) {
      timeline.to(statusRef.current, { autoAlpha: 0, y: -8, duration: 0.18, ease: "power2.out" }, 0.25);
    }

    if (logoImage) {
      timeline.to(
        logoImage,
        {
          filter: "none",
          duration: 0.18,
          ease: "power2.inOut",
        },
        0.72,
      );
    }

    if (mascot) {
      timeline.to(
        mascot,
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.78,
          ease: "power3.inOut",
        },
        0.46,
      );
    }
  }, [restoreMascot, restoreTarget]);

  useEffect(() => {
    let sessionState: string | null = null;
    try {
      sessionState = window.sessionStorage.getItem(SESSION_KEY);
    } catch {}

    // Automated audits can opt out explicitly. Real repeat visits still get a
    // short branded entrance instead of the loader silently disappearing.
    if (sessionState === "skip") {
      revealedRef.current = true;
      document.documentElement.classList.remove("is-wilo-loading");
      setVisible(false);
      return;
    }

    document.documentElement.classList.add("is-wilo-loading");

    const assets = Array.from(
      document.querySelectorAll<LoaderAsset>("[data-loader-asset]"),
    );
    const readyAssets = new Set(assets.filter(isAssetReady));
    const startedAt = performance.now();
    const repeatVisit = sessionState === "true";
    const minimumDuration = repeatVisit ? 180 : 420;
    let revealTimer = 0;
    let fallbackTimer = 0;

    const scheduleReveal = () => {
      if (readyAssets.size < assets.length || revealedRef.current) return;
      const remaining = Math.max(0, minimumDuration - (performance.now() - startedAt));
      window.clearTimeout(revealTimer);
      revealTimer = window.setTimeout(revealSite, remaining);
    };

    const markReady = (event: Event) => {
      readyAssets.add(event.currentTarget as LoaderAsset);
      scheduleReveal();
    };

    assets.forEach((asset) => {
      const readyEvent = asset instanceof HTMLVideoElement ? "loadeddata" : "load";
      asset.addEventListener(readyEvent, markReady);
      asset.addEventListener("error", markReady);
    });

    scheduleReveal();
    fallbackTimer = window.setTimeout(revealSite, repeatVisit ? 520 : 900);

    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(fallbackTimer);
      timelineRef.current?.kill();
      restoreTarget();
      restoreMascot();
      assets.forEach((asset) => {
        const readyEvent = asset instanceof HTMLVideoElement ? "loadeddata" : "load";
        asset.removeEventListener(readyEvent, markReady);
        asset.removeEventListener("error", markReady);
      });
      document.documentElement.classList.remove("is-wilo-loading");
    };
  }, [restoreMascot, restoreTarget, revealSite]);

  if (!visible) return null;

  return (
    <div
      ref={loaderRef}
      className="preloader"
      role="status"
      aria-label="Cargando la experiencia de Wilo Studio"
    >
      <div ref={curtainRef} className="preloader-curtain" />
      <div className="preloader-brand-stage">
        <div ref={logoRef} className="preloader-brand">
          <Image
            src="/images/wilo/hero/wilo-logo.webp"
            alt=""
            fill
            sizes="(max-width: 767px) 58vw, 480px"
            priority
          />
        </div>
      </div>
      <div ref={statusRef} className="preloader-status" aria-hidden="true">
        <span>WILO STUDIO</span>
        <span>AREQUIPA · PERÚ</span>
      </div>
      <span className="preloader-progress" aria-hidden="true">
        <span ref={progressRef} />
      </span>
      <span className="preloader-sr-only" aria-live="polite">
        Preparando la experiencia
      </span>
    </div>
  );
}
