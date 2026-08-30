import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Prevent a parent-level lockfile from being treated as this project's root.
    root: process.cwd(),
  },
  outputFileTracingIncludes: {
    "/evaluation/files/[file]": ["./private/evaluation/*.pdf"],
  },
  async rewrites() {
    return [
      {
        source: "/lister",
        destination: "https://lister-gilt.vercel.app/lister",
      },
      {
        source: "/lister/:path*",
        destination: "https://lister-gilt.vercel.app/lister/:path*",
      },
    ];
  },
};

export default nextConfig;
