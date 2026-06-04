import type { MetadataRoute } from "next";

// Static export: generate this file once at build time.
export const dynamic = "force-static";

// Canonical site URL — the GitHub Pages URL today, the custom domain later.
// Set via env at build time so the sitemap always matches where it is served.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://suhaniboutique.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
