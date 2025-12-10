import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  images: {
    unoptimized: true, // Désactiver l'optimisation car on utilise <img /> natif
    remotePatterns: [
      {
        protocol: "https",
        hostname: "royale-edition-content.s3.eu-north-1.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
