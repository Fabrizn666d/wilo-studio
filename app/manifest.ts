import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return { name: "Wilo Studio", short_name: "Wilo", description: "Diseño, tecnología, producción y experiencias.", start_url: "/", display: "standalone", background_color: "#050505", theme_color: "#F1B824", lang: "es-PE", icons: [{ src: "/brand/wilo-mark.png", sizes: "1254x1254", type: "image/png" }] };
}
