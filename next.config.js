/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  reactStrictMode: true,
  turbopack: {
    root: process.cwd(),
  },
  logging: {
    fetches:{ fullUrl: true },
  }
}

module.exports = nextConfig
