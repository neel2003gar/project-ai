import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // GitHub Pages configuration
  basePath: '/ai-data-analysis-app',
  assetPrefix: '/ai-data-analysis-app/',
  distDir: 'out'
};

export default nextConfig;
