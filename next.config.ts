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
  async rewrites() {
    return [
      {
        // /@username → /users/username (le @ est un caractère réservé dans App Router)
        source: "/@:username",
        destination: "/users/:username",
      },
    ];
  },
};

export default nextConfig;
