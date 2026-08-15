import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
