/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // Memory cache avoids corrupted .next/webpack packs on Windows (white page / 404 CSS)
      config.cache = { type: "memory" };
    }
    return config;
  },
};

export default nextConfig;
