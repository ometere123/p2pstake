"use client";

import { useWalletStore } from "@/stores/wallet-store";
import { Button } from "@/components/ui/button";
import { Wallet, LogOut } from "lucide-react";

export function ConnectWalletButton() {
  const { isConnected, isConnecting, connect, disconnect } =
    useWalletStore();

  if (isConnected) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={disconnect}
        className="gap-2 border-p2p-border bg-p2p-surface text-xs text-p2p-text-secondary hover:border-p2p-red hover:text-p2p-red"
      >
        <LogOut className="h-3.5 w-3.5" />
        Disconnect
      </Button>
    );
  }

  return (
    <Button
      onClick={connect}
      disabled={isConnecting}
      size="sm"
      className="gap-2 bg-p2p-blue text-white hover:bg-p2p-blue/90"
    >
      <Wallet className="h-3.5 w-3.5" />
      {isConnecting ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}
