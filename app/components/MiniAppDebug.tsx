"use client";
import { useEffect, useState } from "react";

export function MiniAppDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [readyStatus, setReadyStatus] = useState<string>("pending");

  useEffect(() => {
    // Écouter l'événement custom quand ready() est appelé
    const onReady = () => {
      setReadyStatus("✅ READY CALLED");
    };
    window.addEventListener("miniapp-ready", onReady);

    // Collecter les infos de debug
    const info = {
      isIframe: window !== window.top,
      parentOrigin: document.referrer || "unknown",
      location: window.location.href,
      userAgent: navigator.userAgent.substring(0, 50) + "...",
      timestamp: new Date().toISOString(),
      sdkAvailable: typeof (window as any).sdk !== "undefined",
      farcasterAvailable: typeof (window as any).farcaster !== "undefined",
    };
    setDebugInfo(info);

    return () => {
      window.removeEventListener("miniapp-ready", onReady);
    };
  }, []);

  // Ne rien afficher en production (sauf si en iframe = mode miniapp)
  if (!debugInfo?.isIframe && process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "rgba(0,0,0,0.9)",
        color: "lime",
        padding: "8px",
        fontSize: "10px",
        fontFamily: "monospace",
        zIndex: 999999,
        borderTop: "2px solid lime",
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
        🔍 MiniApp Debug Info - Ready Status: {readyStatus}
      </div>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        {debugInfo &&
          Object.entries(debugInfo).map(([key, value]) => (
            <span key={key}>
              <strong>{key}:</strong> {String(value)}
            </span>
          ))}
      </div>
      <div style={{ marginTop: "4px", fontSize: "9px", opacity: 0.7 }}>
        Check browser console for detailed logs with [miniapp] prefix
      </div>
    </div>
  );
}
