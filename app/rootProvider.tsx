"use client";
import { ReactNode, useEffect } from "react";

export function RootProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Import dynamique pour éviter les erreurs côté serveur
    if (typeof window !== "undefined") {
      import("@farcaster/miniapp-sdk").then(({ sdk }) => {
        // Attendre que le SDK soit disponible et appeler ready()
        const attemptReady = () => {
          try {
            if (sdk?.actions?.ready) {
              sdk.actions.ready();
              console.log("[miniapp] ✅ sdk.actions.ready() appelé avec succès");
              return true;
            }
          } catch (e) {
            console.warn("[miniapp] SDK pas encore prêt:", e);
          }
          return false;
        };

        // Essayer immédiatement
        if (!attemptReady()) {
          // Réessayer après un court délai
          setTimeout(attemptReady, 100);
          setTimeout(attemptReady, 500);
          setTimeout(attemptReady, 1000);
        }
      }).catch(() => {
        // SDK pas disponible = mode standalone, c'est normal
        console.log("[miniapp] Mode standalone (SDK Farcaster non disponible)");
      });
    }
  }, []);

  return <>{children}</>;
}
