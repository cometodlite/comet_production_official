import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cloudflare Worker가 comet.cometprod.com을 거쳐 전달하므로 x-forwarded-host와 Origin이 다르다.
  experimental: {
    serverActions: { allowedOrigins: ["comet.kenet.co.kr", "comet.cometprod.com"] },
  },
  // 회사 서버(Docker) 빌드에서만 standalone 출력을 만든다. Vercel 빌드는 그대로.
  ...(process.env.COMET_STANDALONE ? { output: "standalone" as const } : {}),
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
        destination: "https://lister.cometprod.com/lister",
      },
      {
        source: "/lister/:path*",
        destination: "https://lister.cometprod.com/lister/:path*",
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
