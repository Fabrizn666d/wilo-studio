import { permanentRedirect } from "next/navigation";

export default function ExpressRedirectPage() {
  permanentRedirect(process.env.NEXT_PUBLIC_WILO_EXPRESS_URL || "https://wilo.site");
}
