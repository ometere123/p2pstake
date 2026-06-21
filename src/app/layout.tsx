import type { Metadata } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "P2PStake — Source-Locked Wager Escrow",
  description:
    "Plain english bets. Source-locked evidence. GenLayer settlement. P2PStake lets two people stake GEN behind any clear condition with locked proof sources.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "P2PStake",
    description: "Lock the bet. Lock the proof. Let GenLayer settle it.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("dark", spaceGrotesk.variable, inter.variable, ibmPlexMono.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-screen bg-p2p-bg text-p2p-text-primary font-body antialiased">
        {children}
      </body>
    </html>
  );
}
