"use client";

import { useWalletStore } from "@/stores/wallet-store";
import { truncateAddress } from "@/lib/ui/format";
import { addressUrl } from "@/lib/genlayer/explorer";

export function WalletPill() {
  const { address, isConnected } = useWalletStore();

  if (!isConnected || !address) return null;

  return (
    <a
      href={addressUrl(address)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 rounded-full border border-p2p-border bg-p2p-surface px-3 py-1 font-mono text-xs text-p2p-text-secondary transition hover:border-p2p-blue hover:text-p2p-text-primary"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-p2p-green" />
      {truncateAddress(address)}
    </a>
  );
}
