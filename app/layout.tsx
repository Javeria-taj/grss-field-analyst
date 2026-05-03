import type { Metadata } from "next";
import { Orbitron, Exo_2 } from "next/font/google";
import { Suspense, ReactNode } from "react";
import "./globals.css";
import StarfieldCanvas from "@/components/ui/StarfieldCanvas";
import Toast from "@/components/ui/Toast";
import ClientShell from "@/components/ClientShell";
import BackgroundSystem from "@/components/game/BackgroundSystem";
import ReactionOverlay from "@/components/game/ReactionOverlay";
import MissionFeed from "@/components/game/MissionFeed";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  display: "swap",
});

const exo2 = Exo_2({
  variable: "--font-exo2",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

import type { Viewport } from "next";

export const viewport: Viewport = {
  themeColor: '#03070f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "IEEE GRSS | Field Analyst Mission",
  description: "IEEE GRSS Field Analyst — A gamified geoscience platform for live events. 5 missions across remote sensing, satellite imagery, disaster response and more.",
  keywords: ["IEEE GRSS", "geoscience", "remote sensing", "satellite", "game", "quiz"],
  openGraph: {
    title: "IEEE GRSS Field Analyst",
    description: "Gamified geoscience platform — 5 missions, 200+ participants, one Earth to save.",
    type: "website",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "180x180", type: "image/png" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${orbitron.variable} ${exo2.variable} antialiased`}>
        <ClientShell>
          <BackgroundSystem />
          <ReactionOverlay />
          <MissionFeed />
          <MissionFeed />
          <StarfieldCanvas />
          <Toast />
          <main id="app-root" style={{ position: "relative", zIndex: 3, minHeight: "100dvh" }}>
            <Suspense fallback={null}>
              {children}
            </Suspense>
          </main>
        </ClientShell>
      </body>
    </html>
  );
}
