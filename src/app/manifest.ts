import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PerumNet NOC",
    short_name: "PerumNet NOC",
    description: "Monitoring jaringan PerumNet.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#f8f8f6",
    theme_color: "#04a99f",
    icons: [
      { src: "/brand/perumnet-mark-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/brand/perumnet-mark-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/brand/perumnet-mark-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
