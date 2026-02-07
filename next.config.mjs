/** @type {import('next').NextConfig} */
const nextConfig = {
<<<<<<< HEAD
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
=======
    reactStrictMode: true,
    // Optimize images
    images: {
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920],
        imageSizes: [16, 32, 48, 64, 96, 128, 256],
    },
    // Disable source maps in production to reduce bundle size
    productionBrowserSourceMaps: false,
    // Enable experimental features for better performance
    experimental: {
        optimizePackageImports: ['lucide-react', 'recharts', 'react-icons'],
    },
>>>>>>> c268406 (fixed database and hydration errors)
};

export default nextConfig;
