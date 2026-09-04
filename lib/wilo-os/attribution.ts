const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

export function leadAttributionFromRequest(request: Request) {
  const referrer = request.headers.get("referer");
  if (!referrer) return {};
  try {
    const url = new URL(referrer);
    const attribution: Record<string, string> = { referrer: `${url.origin}${url.pathname}`.slice(0, 500) };
    for (const key of utmKeys) {
      const value = url.searchParams.get(key)?.trim();
      if (value) attribution[key] = value.slice(0, 160);
    }
    return attribution;
  } catch {
    return {};
  }
}
