"use client";

import { useWalletStore } from "@/stores/wallet-store";
import { getChainId } from "@/lib/genlayer/chain";

export function NetworkPill() {
  const { chainId, isConnected, isCorrectNetwork } = useWalletStore();
  const expectedChainId = getChainId();

  if (!isConnected) return null;

  return (
    <div
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs ${
        isCorrectNetwork
          ? "border-p2p-green/30 text-p2p-green"
          : "border-p2p-red/30 text-p2p-red"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isCorrectNetwork ? "bg-p2p-green" : "bg-p2p-red"
        }`}
      />
      {isCorrectNetwork
        ? "StudioNet"
        : `Wrong network (${chainId ?? "?"} ≠ ${expectedChainId})`}
    </div>
  );
}
