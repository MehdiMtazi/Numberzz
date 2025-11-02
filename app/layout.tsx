import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import { minikitConfig } from "@/minikit.config";
import { RootProvider } from "./rootProvider";
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
          <meta httpEquiv="cache-control" content="max-age=0, must-revalidate" />
          <meta name="theme-color" content="#070812" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="Numberzz" />
          <link rel="icon" href="/favicon.png" type="image/png" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link rel="apple-touch-icon-precomposed" href="/apple-touch-icon-precomposed.png" />
          <link rel="icon" href="/favicon-16.png" type="image/png" sizes="16x16" />
          <link rel="icon" href="/favicon-32.png" type="image/png" sizes="32x32" />
          <link rel="shortcut icon" href="/favicon.png" />
        </head>
        <body className={`${inter.variable} ${sourceCodePro.variable}`}>
          <div>{children}</div>
        </body>
      </html>
    </RootProvider>
  );
}
