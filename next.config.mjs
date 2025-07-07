/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // GitHub Pages configuration
  basePath: '/project-ai-2',
  assetPrefix: '/project-ai-2/'
};

module.exports = nextConfig;
