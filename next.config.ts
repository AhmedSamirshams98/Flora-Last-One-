/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
        domains: ['http://localhost:3000'], // أو localhost أثناء التطوير

    unoptimized: true, // ✅ هذا سيحل المشكلة فوراً

    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

module.exports = nextConfig;
