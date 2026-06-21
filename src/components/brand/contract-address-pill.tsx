"use client";

import { getContractAddress, isContractAddressSet, addressUrl } from "@/lib/genlayer/explorer";
import { truncateAddress } from "@/lib/ui/format";

export function ContractAddressPill() {
  const addr = getContractAddress();

  if (!isContractAddressSet()) {
    return (
      <span className="rounded-full border border-p2p-red/30 px-3 py-1 font-mono text-xs text-p2p-red">
        No contract address
      </span>
    );
  }

  return (
    <a
      href={addressUrl(addr)}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 rounded-full border border-p2p-border bg-p2p-surface px-3 py-1 font-mono text-xs text-p2p-text-secondary transition hover:border-p2p-violet hover:text-p2p-text-primary"
      title={addr}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-p2p-violet" />
      {truncateAddress(addr)}
    </a>
  );
}
