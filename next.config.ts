/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000, // 1 year

    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "floraegypt.com",
      },
    ],
  },

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Compression
  compress: true,

  // Disable source maps in production
  productionBrowserSourceMaps: false,

  // React strict mode
  reactStrictMode: true,

  // Remove powered by header
  poweredByHeader: false,

  // Headers for caching and security
};

module.exports = nextConfig;
