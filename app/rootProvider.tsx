"use client";
import { ReactNode, useEffect } from "react";

export function RootProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Import dynamique pour éviter les erreurs côté serveur
    if (typeof window !== "undefined") {
      let called = false;
      const callOnce = (label: string, fn: () => boolean) => {
        if (called) return true;
        const ok = fn();
        if (ok) {
          called = true;
          console.log(`[miniapp] ✅ ready() called via ${label}`);
        }
        return ok;
      };

      const tryWindowPaths = () => {
        // window.sdk (Base/Farcaster injecté)
        const w: any = window as any;
        if (w.sdk?.actions?.ready) {
          try { w.sdk.actions.ready(); return true; } catch {}
        }
        // window.farcaster fallback
        if (w.farcaster?.ready) {
          try { w.farcaster.ready(); return true; } catch {}
        }
        return false;
      };

      // 1) Tenter immédiatement les chemins window.*
      callOnce("window", tryWindowPaths);

      // 2) Import dynamique du SDK et tentative
      import("@farcaster/miniapp-sdk")
        .then(({ sdk }) => {
          callOnce("module-import", () => {
            try {
              if (sdk?.actions?.ready) { sdk.actions.ready(); return true; }
            } catch {}
            return false;
          });
        })
        .catch(() => {
          // Pas un échec bloquant: le host peut injecter window.sdk
        });

      // 3) Courte boucle de retry (2s) pour couvrir les délais d'injection
      const start = Date.now();
      const interval = setInterval(() => {
        if (called) { clearInterval(interval); return; }
        callOnce("retry-window", tryWindowPaths);
        if (Date.now() - start > 2000) {
          clearInterval(interval);
          if (!called) console.warn("[miniapp] ⚠️ ready() not confirmed after short retry window");
        }
      }, 100);
    }
  }, []);

  return <>{children}</>;
}
