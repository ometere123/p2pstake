"use client";

import type { Resolution } from "@/lib/genlayer/types";
import { Scale, CheckCircle, XCircle, RefreshCw, AlertTriangle, Shield } from "lucide-react";

const OUTCOME_CONFIG: Record<string, {
  icon: React.ElementType;
  label: string;
  color: string;
  bg: string;
}> = {
  creator_wins: { icon: CheckCircle, label: "Creator Wins", color: "text-p2p-green", bg: "border-p2p-green/30 bg-p2p-green/5" },
  opponent_wins: { icon: CheckCircle, label: "Opponent Wins", color: "text-p2p-blue", bg: "border-p2p-blue/30 bg-p2p-blue/5" },
  refund: { icon: RefreshCw, label: "Refund", color: "text-p2p-gold", bg: "border-p2p-gold/30 bg-p2p-gold/5" },
  invalid: { icon: XCircle, label: "Invalid", color: "text-p2p-red", bg: "border-p2p-red/30 bg-p2p-red/5" },
};

function parseConfidence(val: string): number {
  const n = parseInt(val, 10);
  if (!isNaN(n)) return Math.max(0, Math.min(100, n));
  if (val === "high") return 85;
  if (val === "medium") return 55;
  return 25;
}

function parseStructuredSummary(summary: string) {
  const sections: { label: string; text: string; color: string }[] = [];
  const parts = summary.split(" | ");
  for (const part of parts) {
    if (part.startsWith("EVIDENCE:")) sections.push({ label: "Evidence Trace", text: part.slice(10).trim(), color: "text-p2p-blue" });
    else if (part.startsWith("RULES:")) sections.push({ label: "Rule Application", text: part.slice(7).trim(), color: "text-p2p-green" });
    else if (part.startsWith("AMBIGUITY:")) sections.push({ label: "Ambiguity Notes", text: part.slice(11).trim(), color: "text-p2p-gold" });
    else if (part.startsWith("WARNINGS:")) sections.push({ label: "Manipulation Warnings", text: part.slice(10).trim(), color: "text-p2p-red" });
    else if (part.trim()) sections.push({ label: "Source Assessment", text: part.trim(), color: "text-p2p-text-secondary" });
  }
  return sections;
}

const ALIGNMENT_COLORS: Record<string, string> = {
  strong: "text-p2p-green",
  partial: "text-p2p-blue",
  weak: "text-p2p-gold",
  conflicting: "text-p2p-red",
  none: "text-p2p-grey",
};

interface Props {
  resolution: Resolution;
}

export function VerdictCard({ resolution }: Props) {
  const config = OUTCOME_CONFIG[resolution.outcome] || OUTCOME_CONFIG.invalid;
  const Icon = config.icon;
  const confidenceNum = parseConfidence(resolution.confidence);
  const structuredSections = parseStructuredSummary(resolution.source_fetch_summary || "");

  return (
    <div className={`rounded-panel border p-5 ${config.bg}`}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Scale className="h-4 w-4 text-p2p-violet" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-p2p-violet">
          Verdict
        </span>
      </div>

      {/* Outcome */}
      <div className="mt-4 flex items-center gap-3">
        <Icon className={`h-8 w-8 ${config.color}`} />
        <div>
          <div className={`font-display text-xl font-bold ${config.color}`}>
            {config.label}
          </div>
          <div className="text-xs text-p2p-text-secondary">
            Winner: <span className="font-semibold text-p2p-text-primary">{resolution.winner}</span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {/* Confidence */}
        <div className="rounded-card border border-p2p-border bg-p2p-bg/50 p-3">
          <div className="text-[10px] uppercase tracking-wider text-p2p-text-secondary">
            Confidence
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="relative h-2 flex-1 rounded-full bg-p2p-border">
              <div
                className={`absolute left-0 top-0 h-2 rounded-full ${
                  confidenceNum >= 70 ? "bg-p2p-green" : confidenceNum >= 40 ? "bg-p2p-gold" : "bg-p2p-red"
                }`}
                style={{ width: `${confidenceNum}%` }}
              />
            </div>
            <span className="font-mono text-sm font-bold text-p2p-text-primary">
              {confidenceNum}
            </span>
          </div>
        </div>

        {/* Source Alignment */}
        <div className="rounded-card border border-p2p-border bg-p2p-bg/50 p-3">
          <div className="text-[10px] uppercase tracking-wider text-p2p-text-secondary">
            Source Alignment
          </div>
          <div className={`mt-1 text-xs font-semibold capitalize ${ALIGNMENT_COLORS[resolution.source_alignment] || ""}`}>
            {resolution.source_alignment}
          </div>
        </div>
      </div>

      {/* Reason */}
      <div className="mt-4 rounded-card border border-p2p-border bg-p2p-bg/50 p-3">
        <div className="text-[10px] uppercase tracking-wider text-p2p-text-secondary">
          Reason
        </div>
        <p className="mt-1 text-xs text-p2p-text-primary leading-relaxed">
          {resolution.reason}
        </p>
      </div>

      {/* Structured verdict sub-sections */}
      {structuredSections.length > 0 && (
        <div className="mt-4 space-y-3">
          {structuredSections.map((sec, i) => (
            <div key={i} className="rounded-card border border-p2p-border bg-p2p-bg/50 p-3">
              <div className={`text-[10px] font-semibold uppercase tracking-wider ${sec.color}`}>
                {sec.label}
              </div>
              <p className="mt-1 text-xs text-p2p-text-secondary leading-relaxed">
                {sec.text}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Consensus method */}
      <div className="mt-4 rounded-card border border-p2p-border bg-p2p-bg/50 p-3">
        <div className="text-[10px] uppercase tracking-wider text-p2p-text-secondary">
          Consensus Method
        </div>
        <div className="mt-2 space-y-1 text-xs text-p2p-text-secondary">
          <div className="flex items-center gap-1.5">
            {resolution.source_fetch_attempted ? (
              resolution.source_fetch_succeeded ? (
                <><CheckCircle className="h-3 w-3 text-p2p-green" />Source fetch succeeded</>
              ) : (
                <><AlertTriangle className="h-3 w-3 text-p2p-gold" />Source fetch failed: findings only</>
              )
            ) : (
              <><AlertTriangle className="h-3 w-3 text-p2p-text-secondary" />No source fetch: findings only</>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Scale className="h-3 w-3 text-p2p-violet" />
            Equivalence: outcome + winner + confidence(±15) + source_alignment
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="h-3 w-3 text-p2p-blue" />
            GenLayer prompt_comparative consensus
          </div>
        </div>
      </div>
    </div>
  );
}
