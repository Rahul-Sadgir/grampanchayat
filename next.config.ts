import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
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
    cpus: 1,
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
  async redirects() {
    return [
      {
        source: "/komalwadi",
        destination: "/",
        permanent: true,
      },
      {
        source: "/komalvadi",
        destination: "/",
        permanent: true,
      },
      {
        source: "/komalvadi/:path*",
        destination: "/:path*",
        permanent: true,
      },
      {
        source: "/gulwanch",
        destination: "/",
        permanent: false,
      },
      {
        source: "/gulwanch/:path*",
        destination: "/:path*",
        permanent: false,
      },
      {
        source: "/mazagaon",
        destination: "/",
        permanent: false,
      },
      {
        source: "/mazagaon/:path*",
        destination: "/:path*",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/services",
        destination: "/komalwadi/services",
      },
      {
        source: "/services/:path*",
        destination: "/komalwadi/services/:path*",
      },
      {
        source: "/notices",
        destination: "/komalwadi/notices",
      },
      {
        source: "/notices/:path*",
        destination: "/komalwadi/notices/:path*",
      },
      {
        source: "/schemes",
        destination: "/komalwadi/schemes",
      },
      {
        source: "/schemes/:path*",
        destination: "/komalwadi/schemes/:path*",
      },
      {
        source: "/development",
        destination: "/komalwadi/development",
      },
      {
        source: "/development/:path*",
        destination: "/komalwadi/development/:path*",
      },
      {
        source: "/about",
        destination: "/komalwadi/about",
      },
      {
        source: "/about/:path*",
        destination: "/komalwadi/about/:path*",
      },
      {
        source: "/track-application",
        destination: "/komalwadi/track-application",
      },
      {
        source: "/track-application/:path*",
        destination: "/komalwadi/track-application/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://*.google.com https://*.googleapis.com https://*.gstatic.com https://*.googleusercontent.com https://*.openstreetmap.org",
              "connect-src 'self' https://res.cloudinary.com https://api.whatsapp.com https://*.google.com https://*.googleapis.com",
              "frame-src 'self' https://maps.google.com https://www.google.com https://*.google.com https://*.googleusercontent.com https://*.openstreetmap.org",
              "frame-ancestors 'none'",
              "form-action 'self'",
              "base-uri 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
