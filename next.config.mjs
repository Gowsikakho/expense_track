/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@neondatabase/serverless']
  },
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
  },
  // Performance optimizations
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;
