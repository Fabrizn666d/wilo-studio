import { permanentRedirect } from "next/navigation";
import { getStudioProject } from "@/lib/studio-projects";

const legacyAliases: Readonly<Record<string, string>> = {
  tecnova: "tecnova-peru",
};

export default async function LegacyProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const targetSlug = legacyAliases[slug] ?? slug;
  const project = await getStudioProject(targetSlug);
  permanentRedirect(project ? `/proyectos/${targetSlug}` : "/proyectos");
}
