import type { Metadata, Viewport } from "next";
import "./globals.css";
import { site } from "@/content/site";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: { default: `${site.name} | Médica em Brasília, atendimento online`, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  appleWebApp: { title: site.name, statusBarStyle: "default" },
  openGraph: { type: "website", locale: "pt_BR", siteName: site.name, title: `${site.fullName} | ${site.tagline}`, description: site.description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#F6F2ED", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Jost:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  );
}
