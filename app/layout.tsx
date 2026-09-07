import { CSPProvider } from "@base-ui/react/csp-provider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toast";
import { siteConfig } from "@/config/site";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Nonce généré par proxy.ts pour la CSP stricte (rend toute l'application dynamique).
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* Le nonce est transmis aux balises inline de next-themes et de Base UI (CSP stricte). */}
        <CSPProvider nonce={nonce}>
          <ThemeProvider nonce={nonce}>
            <Toaster>{children}</Toaster>
          </ThemeProvider>
        </CSPProvider>
      </body>
    </html>
  );
}
