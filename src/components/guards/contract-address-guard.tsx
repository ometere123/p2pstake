"use client";

import { isContractAddressSet } from "@/lib/genlayer/explorer";
import { AlertTriangle } from "lucide-react";

export function ContractAddressGuard() {
  if (isContractAddressSet()) return null;

  return (
    <div className="flex items-center gap-2 border-b border-p2p-gold/30 bg-p2p-gold/5 px-4 py-2 text-sm text-p2p-gold">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span>
        No contract address configured. Set{" "}
        <code className="font-mono text-xs">
          NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS
        </code>{" "}
        to interact with P2PStake.
      </span>
    </div>
  );
}
