import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import { minikitConfig } from "@/minikit.config";
import { RootProvider } from "./rootProvider";
import { MiniAppDebug } from "./components/MiniAppDebug";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: minikitConfig.miniapp.name,
    description: minikitConfig.miniapp.description,
    other: {
      "fc:miniapp": JSON.stringify({
        version: minikitConfig.miniapp.version,
        imageUrl: minikitConfig.miniapp.heroImageUrl,
        button: {
          title: `Launch ${minikitConfig.miniapp.name}`,
          action: {
            name: `Launch ${minikitConfig.miniapp.name}`,
            type: "launch_miniapp",
          },
        },
      }),
    },
  };
}

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const sourceCodePro = Source_Code_Pro({
  variable: "--font-source-code-pro",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RootProvider>
      <html lang="en">
        <head>
          {/* Script inline pour appeler ready() le plus tôt possible, avant même React */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
(function() {
  console.log('[miniapp] 🎯 Early inline script executing');
  
  var attemptReady = function(source) {
    try {
      // Tenter via module importé (si disponible)
      if (typeof window !== 'undefined') {
        if (window.sdk && typeof window.sdk.actions?.ready === 'function') {
          window.sdk.actions.ready();
          console.log('[miniapp] ✅ ready() called from inline script via window.sdk (' + source + ')');
          return true;
        }
        
        if (window.farcaster && typeof window.farcaster.ready === 'function') {
          window.farcaster.ready();
          console.log('[miniapp] ✅ ready() called from inline script via window.farcaster (' + source + ')');
          return true;
        }
      }
    } catch (e) {
      console.warn('[miniapp] Inline script error (' + source + '):', e);
    }
    return false;
  };
  
  // Tentative immédiate
  if (!attemptReady('immediate')) {
    // Réessayer au DOMContentLoaded
    document.addEventListener('DOMContentLoaded', function() {
      attemptReady('DOMContentLoaded');
    });
    
    // Réessayer au load
    window.addEventListener('load', function() {
      attemptReady('load');
    });
    
    // Polling court
    var attempts = 0;
    var maxAttempts = 100;
    var interval = setInterval(function() {
      attempts++;
      if (attemptReady('polling-' + attempts) || attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 200);
  }
})();
              `,
            }}
          />
        </head>
        <body className={`${inter.variable} ${sourceCodePro.variable}`}>
          <div>{children}</div>
          <MiniAppDebug />
        </body>
      </html>
    </RootProvider>
  );
}
