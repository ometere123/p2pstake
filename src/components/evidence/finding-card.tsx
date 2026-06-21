"use client";

import type { Finding } from "@/lib/genlayer/types";
import { truncateAddress } from "@/lib/ui/format";
import { unixToLocal } from "@/lib/ui/time";
import { ExternalLink } from "lucide-react";

interface Props {
  finding: Finding;
  creatorAddress: string;
}

const SIDE_COLORS: Record<string, string> = {
  creator: "border-p2p-blue/30 bg-p2p-blue/5",
  opponent: "border-p2p-gold/30 bg-p2p-gold/5",
  refund: "border-p2p-grey/30 bg-p2p-grey/5",
  invalid: "border-p2p-red/30 bg-p2p-red/5",
};

const SIDE_LABELS: Record<string, string> = {
  creator: "Supports Creator",
  opponent: "Supports Opponent",
  refund: "Suggests Refund",
  invalid: "Suggests Invalid",
};

export function FindingCard({ finding, creatorAddress }: Props) {
  const isCreator = finding.submitter.toLowerCase() === creatorAddress.toLowerCase();
  const borderClass = SIDE_COLORS[finding.supports_side] || "border-p2p-border";

  return (
    <div className={`rounded-card border p-3 ${borderClass}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-p2p-panel px-2 py-0.5 text-[10px] font-medium text-p2p-text-secondary">
            {isCreator ? "Creator" : "Opponent"}
          </span>
          <span className="text-[10px] text-p2p-text-secondary">
            {SIDE_LABELS[finding.supports_side]}
          </span>
        </div>
        <span className="rounded-full bg-p2p-panel px-1.5 py-0.5 text-[10px] text-p2p-text-secondary">
          {finding.confidence}
        </span>
      </div>

      <p className="mt-2 text-sm text-p2p-text-primary">{finding.finding}</p>

      {finding.evidence_url && (
        <a
          href={finding.evidence_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-1 text-xs text-p2p-blue hover:underline"
        >
          Evidence URL <ExternalLink className="h-2.5 w-2.5" />
        </a>
      )}

      <div className="mt-2 flex items-center justify-between text-[10px] text-p2p-text-secondary">
        <span className="font-mono">{truncateAddress(finding.submitter)}</span>
        <span>{unixToLocal(finding.submitted_at_unix)}</span>
      </div>

      {finding.captured_at_claim && (
        <div className="mt-1 text-[10px] text-p2p-gold">
          Claimed capture: {finding.captured_at_claim} (evidence only, not trusted)
        </div>
      )}
    </div>
  );
}
