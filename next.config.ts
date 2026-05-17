import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/evaluation/files/[file]": ["./private/evaluation/*.pdf"],
  },
};

export default nextConfig;
