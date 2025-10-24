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
  async headers() {
    return [
      {
        // Appliquer ces en-têtes à toutes les routes
        source: '/:path*',
        headers: [
          // Autoriser l'embed en iframe par TOUS les hôtes possibles (Base App, Warpcast, Farcaster, etc.)
          {
            key: 'Content-Security-Policy',
            value:
              "frame-ancestors *;",
          },
          // Retirer X-Frame-Options pour éviter les conflits
        ],
      },
    ];
  },
}

module.exports = nextConfig