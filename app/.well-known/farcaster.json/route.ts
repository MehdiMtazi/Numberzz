import { minikitConfig } from "../../../minikit.config";

export async function GET() {
  // Retourner directement la config sans withValidManifest pour garantir l'accountAssociation
  return Response.json({
    accountAssociation: minikitConfig.accountAssociation,
    frame: {
      version: minikitConfig.miniapp.version,
      name: minikitConfig.miniapp.name,
      iconUrl: minikitConfig.miniapp.iconUrl,
      homeUrl: minikitConfig.miniapp.homeUrl,
      imageUrl: minikitConfig.miniapp.heroImageUrl,
      splashImageUrl: minikitConfig.miniapp.splashImageUrl,
      splashBackgroundColor: minikitConfig.miniapp.splashBackgroundColor,
      webhookUrl: minikitConfig.miniapp.webhookUrl,
      description: minikitConfig.miniapp.description,
      subtitle: minikitConfig.miniapp.subtitle,
      primaryCategory: minikitConfig.miniapp.primaryCategory,
    }
  });
}
