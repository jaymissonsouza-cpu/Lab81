import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LAB81 Studio",
    short_name: "LAB81",
    description: "Design e impressão 3D em Recife. Da ideia ao objeto.",
    start_url: "/",
    display: "standalone",
    background_color: "#111719",
    theme_color: "#111719",
    lang: "pt-BR",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
