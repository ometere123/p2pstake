"use client";

import { useWalletStore } from "@/stores/wallet-store";
import { addressUrl } from "@/lib/genlayer/explorer";
import { getContractAddress } from "@/lib/genlayer/explorer";
import { ExternalLink } from "lucide-react";

export default function SettingsPage() {
  const { address } = useWalletStore();
  const contractAddr = getContractAddress();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold">Settings</h1>
      <p className="mt-1 text-sm text-p2p-text-secondary">
        Wallet and network information.
      </p>

      <div className="mt-8 rounded-panel border border-p2p-border bg-p2p-panel p-5 space-y-4">
        {address && (
          <div>
            <div className="text-xs uppercase tracking-wider text-p2p-text-secondary">
              Your Wallet
            </div>
            <a
              href={addressUrl(address)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 flex items-center gap-1 font-mono text-sm text-p2p-blue hover:underline"
            >
              {address}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
        {contractAddr && (
          <div>
            <div className="text-xs uppercase tracking-wider text-p2p-text-secondary">
              Contract
            </div>
            <a
              href={addressUrl(contractAddr)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 flex items-center gap-1 font-mono text-sm text-p2p-violet hover:underline"
            >
              {contractAddr}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
