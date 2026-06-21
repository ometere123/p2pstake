"use client";

import { useState } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/brand/logo-mark";
import { P2PStakeWordmark } from "@/components/brand/p2pstake-wordmark";
import { NetworkPill } from "@/components/brand/network-pill";
import { WalletPill } from "@/components/brand/wallet-pill";
import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/app", label: "Dashboard" },
  { href: "/app/create", label: "Create" },
  { href: "/app/stats", label: "Stats" },
  { href: "/app/debug", label: "Debug" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-p2p-border bg-p2p-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:h-16">
        <Link href="/" className="flex items-center gap-3">
          <LogoMark size={28} />
          <P2PStakeWordmark />
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-4 md:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-p2p-text-secondary transition hover:text-p2p-text-primary"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2">
            <NetworkPill />
            <WalletPill />
          </div>
          <ConnectWalletButton />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-p2p-text-secondary md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-p2p-border bg-p2p-bg px-4 pb-4 pt-2 md:hidden">
          <div className="flex flex-col gap-2">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-card px-3 py-2 text-sm text-p2p-text-secondary transition hover:bg-p2p-surface hover:text-p2p-text-primary"
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 sm:hidden">
            <NetworkPill />
            <WalletPill />
          </div>
        </div>
      )}
    </nav>
  );
}
