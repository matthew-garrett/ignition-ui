import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["static.alchemyapi.io", "tokens.1inch.io"],
    unoptimized: true, // Required for static exports
  },
  // Disable the automatic 404 generation
  trailingSlash: true,
};

export default nextConfig;
