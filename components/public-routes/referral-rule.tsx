"use client";

import { useEffect, useState } from "react";

const defaultRule = "3 referidos = nuevas funciones gratis para tu web";

export function ReferralRule() {
  const [rule, setRule] = useState(defaultRule);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/ajustes", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) return;
        const payload = (await response.json()) as { settings?: Record<string, unknown> };
        const current = payload.settings?.["referrals.current_rule"];
        if (typeof current === "string" && current.trim()) setRule(current);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  return <>{rule}</>;
}
