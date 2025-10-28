// Canonical public URL of the app. Set NEXT_PUBLIC_URL in Vercel to override if needed.
const CANONICAL_URL = "https://numberzz.vercel.app";
const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  CANONICAL_URL ||
  (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
  "http://localhost:3000";

/**
 * MiniApp configuration object. Must follow the mini app manifest specification.
 *
 * @see {@link https://docs.base.org/mini-apps/features/manifest}
 */
export const minikitConfig = {
  accountAssociation: {
    "header": "eyJmaWQiOjEzOTczNjQsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhFQzc5YzYzRUUyMTI5NUE3ODJiMzllQ2ZGY0M2ZDE3MzZmZjU2YjZhIn0",
    "payload": "eyJkb21haW4iOiJudW1iZXJ6ei52ZXJjZWwuYXBwIn0",
    "signature": "If/4EIB/avc5nKK3sYNAu5/Q3gStQA2eZF7eMjwek5EPTv3rEUiloKdZG+CTsjDTJ3KTeRkqOZjYoBooZsG+wRw="
  },
  baseBuilder: {
    allowedAddresses: [],
  },
  miniapp: {
    version: "1",
    name: "Numberzz",
    subtitle: "Collect and Trade Numbers",
    description: "Numberzz: Unique NFT numbers on Base. Each token tells a story. Collect and discover the significance behind every digit in this digital collectible experience.",
    screenshotUrls: [
      `${ROOT_URL}/screenshot1.png`,
      `${ROOT_URL}/screenshot2.png`,
      `${ROOT_URL}/screenshot3.png`
    ],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "utility",
  tags: ["numbers", "nft", "collectibles", "math", "trading"],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "Every Number Tells a Story",
    ogTitle: "Numberzz: Collect Numbers",
    ogDescription: "Join the Numberzz community and start collecting unique numbers today!",
    ogImageUrl: `${ROOT_URL}/hero.png`,
    "noindex": true
  },
} as const;
