import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" className="dark font-sans">
      <body className="min-h-screen bg-p2p-bg text-p2p-text-primary font-body antialiased">
        {children}
      </body>
    </html>
  );
}
