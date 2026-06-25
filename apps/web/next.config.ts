import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(appDir, "../..");

const nextConfig: NextConfig = {
  turbopack: {
    root: repoRoot,
  },
  // Transpile the workspace engine package so the app can import it directly.
  transpilePackages: ["@open-crate/core"],
};

export default nextConfig;
