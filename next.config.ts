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
  // Fix Turbopack workspace root — sans cette directive, Turbopack détecte
  // le lockfile parent /home/z/package-lock.json et calcule RELATIVE_ROOT_PATH
  // = "../../../.." qui casse la résolution de @prisma/client-<hash> en prod.
  // root: __dirname force le workspace root au dossier du projet.
  turbopack: {
    root: __dirname,
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
