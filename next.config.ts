/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["http://localhost:3000", "https://floraegypt.com"], // أو localhost أثناء التطوير

    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

module.exports = nextConfig;
