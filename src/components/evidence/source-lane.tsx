"use client";

import type { EvidenceSource, Finding } from "@/lib/genlayer/types";
import { FindingCard } from "./finding-card";
import { Lock, Globe, GitBranch, Link2, MessageSquare } from "lucide-react";

const SOURCE_ICONS: Record<string, React.ElementType> = {
  public_url: Globe,
  github: GitBranch,
  social_post: MessageSquare,
  onchain_tx: Link2,
  document: Link2,
  manual_witness: MessageSquare,
};

interface Props {
  source: EvidenceSource;
  findings: Finding[];
  creatorAddress: string;
}

export function SourceLane({ source, findings, creatorAddress }: Props) {
  const Icon = SOURCE_ICONS[source.source_type] || Link2;
  const isPrimary = !source.is_fallback;

  return (
    <div
      className={`rounded-card border bg-p2p-surface p-4 ${
        isPrimary ? "border-p2p-blue/30" : "border-p2p-border"
      }`}
    >
      {/* Source header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg ${
              isPrimary ? "bg-p2p-blue/10" : "bg-p2p-surface"
            }`}
          >
            <Icon className={`h-3.5 w-3.5 ${isPrimary ? "text-p2p-blue" : "text-p2p-text-secondary"}`} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-semibold ${isPrimary ? "text-p2p-blue" : "text-p2p-text-secondary"}`}>
                {isPrimary ? "PRIMARY" : "FALLBACK"}
              </span>
              {source.locked && (
                <span className="flex items-center gap-0.5 rounded-full bg-p2p-violet/10 px-1.5 py-0.5 text-[10px] text-p2p-violet">
                  <Lock className="h-2.5 w-2.5" /> Locked
                </span>
              )}
            </div>
            <div className="text-sm font-medium text-p2p-text-primary">{source.label}</div>
          </div>
        </div>
        <span className="rounded-full bg-p2p-panel px-2 py-0.5 text-[10px] text-p2p-text-secondary">
          {source.source_type}
        </span>
      </div>

      {source.url && (
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 block truncate font-mono text-xs text-p2p-blue hover:underline"
        >
          {source.url}
        </a>
      )}

      <p className="mt-1 text-xs text-p2p-text-secondary">{source.description}</p>

      {/* Findings in this lane */}
      {findings.length > 0 ? (
        <div className="mt-3 space-y-2 border-t border-p2p-border pt-3">
          <div className="text-[10px] uppercase tracking-wider text-p2p-text-secondary">
            Findings ({findings.length})
          </div>
          {findings.map((f) => (
            <FindingCard key={f.finding_id} finding={f} creatorAddress={creatorAddress} />
          ))}
        </div>
      ) : (
        <div className="mt-3 border-t border-p2p-border pt-3">
          <p className="text-xs text-p2p-text-secondary italic">
            No findings submitted for this source.
          </p>
        </div>
      )}
    </div>
  );
}
