/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Produces a self-contained server bundle in .next/standalone — used by the
  // production Dockerfile (copies standalone/ + static/ + public/).
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      // Local-dev uploads served by the FastAPI service.
      { protocol: "http", hostname: "localhost", port: "8000" },
      { protocol: "http", hostname: "127.0.0.1", port: "8000" },
      // Render-hosted API (local-disk uploads) and common object-store hosts.
      { protocol: "https", hostname: "**.onrender.com" },
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
      // Custom CDN in front of the R2 bucket (S3_PUBLIC_BASE_URL).
      { protocol: "https", hostname: "cdn.wallmeri.com" },
    ],
  },
};

export default nextConfig;
