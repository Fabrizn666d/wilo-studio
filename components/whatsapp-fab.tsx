"use client";

import { MessageCircle } from "lucide-react";
import { useSiteSettings } from "./site-settings-provider";

export function WhatsappFab() {
  const settings = useSiteSettings();
  return <a className="whatsapp-fab" href={settings.whatsapp} target="_blank" rel="noreferrer" aria-label="Escribir a Wilo Studio por WhatsApp"><MessageCircle size={23} /><span>Hablemos</span></a>;
}
