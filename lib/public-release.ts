export const PUBLIC_FEATURES = {
  home: true,
  showcase: true,
  projects: false,
  about: false,
  contact: false,
  services: false,
  store: false,
  education: false,
  events: false,
  express: false,
  quote: false,
  checkout: false,
  customers: false,
  promotions: false,
  referrals: false,
} as const;

export type PublicFeature = keyof typeof PUBLIC_FEATURES;

export const MAINTENANCE_HREF = "/en-construccion";

export function publicHref(feature: PublicFeature, readyHref: string) {
  return PUBLIC_FEATURES[feature] ? readyHref : MAINTENANCE_HREF;
}

export function publicExternalHref(feature: PublicFeature, readyHref: string) {
  return PUBLIC_FEATURES[feature] ? readyHref : MAINTENANCE_HREF;
}
