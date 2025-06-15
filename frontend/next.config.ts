/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Allow loading images from localhost:5000
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "5000",
        pathname: "/**",
      },
    ],
    // Optionally, allow localhost with default loader
    domains: ["localhost", "127.0.0.1"],
  },
};

module.exports = nextConfig;
