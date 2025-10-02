/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ❗ Makes build succeed even if ESLint finds errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ❗ Makes build succeed even if type errors exist
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
