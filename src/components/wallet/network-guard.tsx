"use client";

import { useWalletStore } from "@/stores/wallet-store";
import { getChainId } from "@/lib/genlayer/chain";
import { AlertTriangle } from "lucide-react";

export function NetworkGuard() {
  const { isConnected, isCorrectNetwork, chainId } = useWalletStore();

  if (!isConnected || isCorrectNetwork) return null;

  const expected = getChainId();

  return (
    <div className="flex items-center gap-2 border-b border-p2p-red/30 bg-p2p-red/5 px-4 py-2 text-sm text-p2p-red">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span>
        Wrong network. Switch to GenLayer StudioNet (chain {expected}). Current
        chain: {chainId ?? "unknown"}.
      </span>
    </div>
  );
}
