import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb', // Allow PDFs up to 20MB
    },
  },
};

export default nextConfig;
