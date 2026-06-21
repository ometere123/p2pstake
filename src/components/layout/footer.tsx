"use client";

import { addressUrl } from "@/lib/genlayer/explorer";
import { getContractAddress, isContractAddressSet } from "@/lib/genlayer/explorer";
import { truncateAddress } from "@/lib/ui/format";

export function Footer() {
  const addr = getContractAddress();

  return (
    <footer className="border-t border-p2p-border bg-p2p-bg px-4 py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 text-xs text-p2p-text-secondary">
        <p>
          P2PStake is for clear, evidence-resolvable wagers. Harmful, illegal,
          exploitative, or unverifiable bets are not allowed.
        </p>
        <div className="flex items-center gap-4">
          <span>Testnet only — not real money</span>
          {isContractAddressSet() && (
            <a
              href={addressUrl(addr)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-p2p-blue hover:underline"
            >
              Contract: {truncateAddress(addr)}
            </a>
          )}
          <span>Powered by GenLayer</span>
        </div>
      </div>
    </footer>
  );
}
