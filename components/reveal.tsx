"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

export function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reduced = useReducedMotion();
  const [fallbackVisible, setFallbackVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setFallbackVisible(true), 4_500);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      animate={fallbackVisible ? { opacity: 1, y: 0 } : undefined}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.14 }}
      transition={reduced
        ? { duration: 0, delay: 0 }
        : { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
