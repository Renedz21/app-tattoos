import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ["@prisma/client", "prisma", "@aws-sdk/client-s3"],
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns'],
  },
  turbopack: {
    resolveAlias: {
      "@prisma/client": "./lib/generated/prisma/client",
    },
  }
};

export default nextConfig;
