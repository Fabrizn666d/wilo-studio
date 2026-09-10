export type PublicCalendarProvider = {
  configured: boolean;
  name: "google" | "external" | "none";
  bookingUrl: string | null;
};

export function getPublicCalendarProvider(): PublicCalendarProvider {
  const bookingUrl = process.env.NEXT_PUBLIC_CALENDAR_BOOKING_URL?.trim() || null;
  const requested = process.env.NEXT_PUBLIC_CALENDAR_PROVIDER?.trim().toLowerCase();
  return {
    configured: Boolean(bookingUrl),
    name: bookingUrl ? (requested === "google" ? "google" : "external") : "none",
    bookingUrl,
  };
}
