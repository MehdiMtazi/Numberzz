import { minikitConfig } from "../../../minikit.config";

export async function GET() {
  // Construction manuelle du manifest pour garantir que accountAssociation est présent
  const manifest = {
    accountAssociation: {
      header: "eyJmaWQiOjEzOTczNjQsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhFQzc5YzYzRUUyMTI5NUE3ODJiMzllQ2ZGY0M2ZDE3MzZmZjU2YjZhIn0",
      payload: "eyJkb21haW4iOiJudW1iZXJ6ei52ZXJjZWwuYXBwIn0",
      signature: "If/4EIB/avc5nKK3sYNAu5/Q3gStQA2eZF7eMjwek5EPTv3rEUiloKdZG+CTsjDTJ3KTeRkqOZjYoBooZsG+wRw="
    },
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
  };
  
  return Response.json(manifest);
}
