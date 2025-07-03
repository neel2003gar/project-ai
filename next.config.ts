import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Set this to your GitHub Pages URL
  basePath: process.env.NODE_ENV === 'production' ? '/project-ai-2' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/project-ai-2/' : '',
};

export default nextConfig;
