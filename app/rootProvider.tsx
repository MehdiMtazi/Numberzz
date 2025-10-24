"use client";
import { ReactNode, useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";

export function RootProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    console.log("[miniapp] 🚀 Initializing SDK ready() for Base/Farcaster");
    
    let readyCalled = false;
    let attemptCount = 0;
    const MAX_ATTEMPTS = 200; // 60 secondes max (200 * 300ms)
    const ATTEMPT_INTERVAL = 300;

    // Fonction pour vérifier et appeler ready()
    const tryCallReady = (context: string) => {
      if (readyCalled) return true;
      
      attemptCount++;
      
      try {
        // Stratégie 1: Appel direct via import
        if (sdk && typeof sdk.actions?.ready === "function") {
          sdk.actions.ready();
          readyCalled = true;
          console.log(`[miniapp] ✅ ready() SUCCESS via ${context}`, {
            attempt: attemptCount,
            timestamp: Date.now(),
            sdkType: typeof sdk,
            actionsType: typeof sdk.actions,
          });
          
          // Notifier window pour d'autres composants
          window.dispatchEvent(new CustomEvent("miniapp-ready"));
          return true;
        }

        // Stratégie 2: Vérifier window.sdk (peut être injecté par Base)
        const windowSdk = (window as any).sdk;
        if (windowSdk && typeof windowSdk.actions?.ready === "function") {
          windowSdk.actions.ready();
          readyCalled = true;
          console.log(`[miniapp] ✅ ready() SUCCESS via window.sdk (${context})`);
          window.dispatchEvent(new CustomEvent("miniapp-ready"));
          return true;
        }

        // Stratégie 3: Vérifier window.farcaster
        const farcaster = (window as any).farcaster;
        if (farcaster && typeof farcaster.ready === "function") {
          farcaster.ready();
          readyCalled = true;
          console.log(`[miniapp] ✅ ready() SUCCESS via window.farcaster (${context})`);
          window.dispatchEvent(new CustomEvent("miniapp-ready"));
          return true;
        }

        // Log périodique pour debug
        if (attemptCount === 1 || attemptCount % 20 === 0) {
          console.log(`[miniapp] 🔄 Attempt ${attemptCount}/${MAX_ATTEMPTS} (${context})`, {
            sdkExists: !!sdk,
            sdkType: typeof sdk,
            hasActions: !!(sdk as any)?.actions,
            readyType: typeof (sdk as any)?.actions?.ready,
            windowSdk: !!(window as any).sdk,
            windowFarcaster: !!(window as any).farcaster,
            userAgent: navigator.userAgent,
            referrer: document.referrer,
          });
        }

      } catch (error) {
        if (attemptCount === 1 || attemptCount % 20 === 0) {
          console.warn(`[miniapp] ⚠️ Error during attempt ${attemptCount}:`, error);
        }
      }

      return false;
    };

    // PHASE 1: Tentative immédiate au mount
    if (tryCallReady("immediate")) {
      return;
    }

    // PHASE 2: Polling agressif
    const pollingInterval = setInterval(() => {
      if (readyCalled || attemptCount >= MAX_ATTEMPTS) {
        clearInterval(pollingInterval);
        
        if (!readyCalled && attemptCount >= MAX_ATTEMPTS) {
          console.error("[miniapp] ❌ FAILED: ready() not called after", MAX_ATTEMPTS, "attempts");
          console.error("[miniapp] Debug info:", {
            sdkModule: sdk,
            windowSdk: (window as any).sdk,
            windowFarcaster: (window as any).farcaster,
            location: window.location.href,
            referrer: document.referrer,
            isIframe: window !== window.top,
            parentOrigin: window !== window.top ? document.referrer : "not-iframe",
          });
        }
        return;
      }

      tryCallReady("polling");
    }, ATTEMPT_INTERVAL);

    // PHASE 3: Réessayer sur DOMContentLoaded (si pas encore déclenché)
    const onDOMReady = () => {
      console.log("[miniapp] 📄 DOMContentLoaded triggered");
      tryCallReady("DOMContentLoaded");
    };
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", onDOMReady);
    } else {
      onDOMReady();
    }

    // PHASE 4: Réessayer sur load complet
    const onLoad = () => {
      console.log("[miniapp] 🏁 window.load triggered");
      setTimeout(() => tryCallReady("window-load"), 0);
      setTimeout(() => tryCallReady("window-load+100"), 100);
      setTimeout(() => tryCallReady("window-load+500"), 500);
      setTimeout(() => tryCallReady("window-load+1000"), 1000);
    };
    window.addEventListener("load", onLoad);

    // PHASE 5: Réessayer sur visibilité
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("[miniapp] 👁️ Tab visible");
        tryCallReady("visibility-change");
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    // PHASE 6: Réessayer sur interaction utilisateur
    const onUserInteraction = () => {
      console.log("[miniapp] 🖱️ User interaction detected");
      tryCallReady("user-interaction");
    };
    const interactionEvents = ["click", "touchstart", "mousedown", "keydown"];
    interactionEvents.forEach(event => {
      document.addEventListener(event, onUserInteraction, { once: true, capture: true });
    });

    // PHASE 7: Message PostMessage depuis parent iframe (Base/Farcaster peut communiquer ainsi)
    const onMessage = (event: MessageEvent) => {
      console.log("[miniapp] 📨 PostMessage received:", event.data, "from", event.origin);
      tryCallReady("postmessage");
    };
    window.addEventListener("message", onMessage);

    // Cleanup
    return () => {
      clearInterval(pollingInterval);
      document.removeEventListener("DOMContentLoaded", onDOMReady);
      window.removeEventListener("load", onLoad);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      interactionEvents.forEach(event => {
        document.removeEventListener(event, onUserInteraction, { capture: true });
      });
      window.removeEventListener("message", onMessage);
    };
  }, []);

  return <>{children}</>;
}
