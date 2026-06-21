"use client";

import Link from "next/link";
import { LogoMark } from "@/components/brand/logo-mark";
import { P2PStakeWordmark } from "@/components/brand/p2pstake-wordmark";
import { NetworkPill } from "@/components/brand/network-pill";
import { WalletPill } from "@/components/brand/wallet-pill";
import { ConnectWalletButton } from "@/components/wallet/connect-wallet-button";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-p2p-border bg-p2p-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          <LogoMark size={28} />
          <P2PStakeWordmark />
        </Link>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/app"
            className="text-sm text-p2p-text-secondary transition hover:text-p2p-text-primary"
          >
            Dashboard
          </Link>
          <Link
            href="/app/create"
            className="text-sm text-p2p-text-secondary transition hover:text-p2p-text-primary"
          >
            Create
          </Link>
          <Link
            href="/app/stats"
            className="text-sm text-p2p-text-secondary transition hover:text-p2p-text-primary"
          >
            Stats
          </Link>
          <Link
            href="/app/debug"
            className="text-sm text-p2p-text-secondary transition hover:text-p2p-text-primary"
          >
            Debug
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <NetworkPill />
          <WalletPill />
          <ConnectWalletButton />
        </div>
      </div>
    </nav>
  );
}
