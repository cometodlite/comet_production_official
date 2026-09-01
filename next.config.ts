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
      // COMET BUNDLE 허브 (모노레포 apps/bundle). 이 앱은 basePath "/app-bundles"로
      // 서빙되므로 경로를 1:1로 넘긴다. comet-bundle Vercel 프로젝트의 Root Directory가
      // apps/bundle, Deployment Protection(Vercel Authentication)이 꺼져 있어야 한다.
      {
        source: "/app-bundles",
        destination: "https://comet-bundle.vercel.app/app-bundles",
      },
      {
        source: "/app-bundles/:path*",
        destination: "https://comet-bundle.vercel.app/app-bundles/:path*",
      },
    ];
  },
};

export default nextConfig;
