import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Finance Manager",
    short_name: "FinanceMgr",
    description: "Manage your budget and track expenses with Finance Manager.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1d4ed8",
    icons: [
      {
        src: "/icon.svg",
        type: "image/svg+xml",
        sizes: "any",
      },
      {
        src: "/icon-light-32x32.png",
        type: "image/png",
        sizes: "32x32",
      },
      {
        src: "/icon-dark-32x32.png",
        type: "image/png",
        sizes: "32x32",
      },
      {
        src: "/apple-icon.png",
        type: "image/png",
        sizes: "180x180",
      },
    ],
  }
}

