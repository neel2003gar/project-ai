import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // GitHub Pages configuration
  basePath: '/project-ai-2',
  assetPrefix: '/project-ai-2/',
  // Ensure static files are handled correctly
  distDir: 'out'
};

export default nextConfig;
