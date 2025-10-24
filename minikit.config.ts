const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
  "http://localhost:3000";

/**
 * MiniApp configuration object. Must follow the mini app manifest specification.
 *
 * @see {@link https://docs.base.org/mini-apps/features/manifest}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: "",
  },
  baseBuilder: {
    allowedAddresses: ["0x4fF5b9d86977890c3dDc913Ff8e289B69e64301C"],
  },
  miniapp: {
    version: "1",
    name: "Numberzz",
    subtitle: "Collect & Trade Unique Numbers",
    description: "Numberzz is a unique NFT collection on Base where you can collect, trade, and own numbers from 0 to infinity. Each number is a rare digital asset with its own rarity tier. Discover hidden easter eggs, unlock achievements, and become part of an exclusive community of number collectors.",
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
    tags: ["nft", "collectibles", "base", "numbers", "trading", "easter-eggs"],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "Every Number Tells a Story",
    ogTitle: "Numberzz - Collect Unique Numbers on Base",
    ogDescription: "Join the Numberzz community and start collecting unique numbers today!",
    ogImageUrl: `${ROOT_URL}/hero.png`,
    "noindex": true
  },
} as const;
