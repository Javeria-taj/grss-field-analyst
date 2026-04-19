import type { Metadata } from "next";
import { Orbitron, Exo_2 } from "next/font/google";
import "./globals.css";

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

export const viewport = {
  themeColor: '#03070f',
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${orbitron.variable} ${exo2.variable} antialiased`}>
        {/* Starfield and earth deco rendered client-side in providers */}
        <div id="app" style={{ position: "relative", zIndex: 3, minHeight: "100vh" }}>
          {children}
        </div>
      </body>
    </html>
  );
}
