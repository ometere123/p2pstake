"use client";

import { useWalletStore } from "@/stores/wallet-store";
import { ConnectWalletButton } from "./connect-wallet-button";
import { Wallet } from "lucide-react";

export function WalletGate({ children }: { children: React.ReactNode }) {
  const { isConnected } = useWalletStore();

  if (!isConnected) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-p2p-surface">
          <Wallet className="h-8 w-8 text-p2p-text-secondary" />
        </div>
        <div className="text-center">
          <h2 className="font-display text-xl font-semibold text-p2p-text-primary">
            Connect Your Wallet
          </h2>
          <p className="mt-2 max-w-sm text-sm text-p2p-text-secondary">
            Connect your wallet to view and manage your wagers. Your wallet is
            your identity on P2PStake.
          </p>
        </div>
        <ConnectWalletButton />
      </div>
    );
  }

  return <>{children}</>;
}
