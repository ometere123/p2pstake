"use client";

import { txUrl } from "@/lib/genlayer/explorer";
import { truncateHash } from "@/lib/ui/hashes";
import { ExternalLink } from "lucide-react";

interface TxHashLinkProps {
  hash: string;
  label?: string;
}

export function TxHashLink({ hash, label }: TxHashLinkProps) {
  if (!hash) return null;

  return (
    <a
      href={txUrl(hash)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 font-mono text-xs text-p2p-blue transition hover:text-p2p-blue/80"
      title={hash}
    >
      {label || truncateHash(hash)}
      <ExternalLink className="h-3 w-3" />
    </a>
  );
}
