import { permanentRedirect } from "next/navigation";
import { serviceShowcaseItems } from "@/data/services-showcase";

export function generateStaticParams() {
  return serviceShowcaseItems
    .filter((item) => item.slug !== "produccion-audiovisual")
    .map((item) => ({ slug: item.slug }));
}

export default async function ServiceRedirectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  permanentRedirect(`/cotizar?service=${encodeURIComponent(slug)}`);
}
