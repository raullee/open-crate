import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Transpile the workspace engine package so the app can import it directly.
  transpilePackages: ["@open-crate/core"],
};

export default nextConfig;
