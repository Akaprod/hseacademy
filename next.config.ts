import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  experimental: {
    // CageFS limite les process forks — 1 worker suffit
    cpus: 1,
  },
};

export default nextConfig;
