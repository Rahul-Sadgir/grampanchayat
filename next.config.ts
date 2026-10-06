import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async redirects() {
    return [
      {
        source: "/komalvadi",
        destination: "/komalwadi",
        permanent: true,
      },
      {
        source: "/komalvadi/:path*",
        destination: "/komalwadi/:path*",
        permanent: true,
      },
      {
        source: "/gulwanch",
        destination: "/komalwadi",
        permanent: false,
      },
      {
        source: "/gulwanch/:path*",
        destination: "/komalwadi/:path*",
        permanent: false,
      },
      {
        source: "/mazagaon",
        destination: "/komalwadi",
        permanent: false,
      },
      {
        source: "/mazagaon/:path*",
        destination: "/komalwadi/:path*",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
