import type { NextConfig } from "next";

// basePath is empty for local dev and the eventual custom domain (served at
// root), and set to "/suhani-boutique" by the GitHub Pages build, where the
// site lives under a repo subpath. Driven by env so no value is hardcoded.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Static HTML export — required for GitHub Pages (no Node server).
  output: "export",
  basePath,
  images: {
    // No image optimization server exists on static hosting.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
