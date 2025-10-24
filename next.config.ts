/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Désactive ESLint pendant le build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Désactive aussi les vérifications TypeScript (optionnel)
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig