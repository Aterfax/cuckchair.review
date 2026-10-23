import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  // The parent directory contains unrelated lockfiles; pin the workspace
  // root so Next.js does not infer the wrong one.
  outputFileTracingRoot: process.cwd(),
};

export default nextConfig;
