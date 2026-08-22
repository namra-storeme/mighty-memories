import type { NextConfig } from "next";
import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "55mb", // 50MB uploads + ~5MB multipart overhead
    },
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "storage.googleapis.com" }, // Google Cloud Storage
    ],
  },
};

export default nextConfig;
