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
      // COMET BUNDLE 모노레포 프리뷰 (apps/lister). comet-bundle Vercel 프로젝트가
      // lister를 basePath "/lister"로 서빙하므로 경로를 그쪽으로 번역한다.
      // comet-bundle 프로젝트의 Deployment Protection(Vercel Authentication)이
      // 꺼져 있어야 이 rewrite가 통한다.
      {
        source: "/app-bundles",
        destination: "https://comet-bundle.vercel.app/lister",
      },
      {
        source: "/app-bundles/:path*",
        destination: "https://comet-bundle.vercel.app/lister/:path*",
      },
    ];
  },
};

export default nextConfig;
