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

const CONFIDENCE_BARS: Record<string, number> = { high: 3, medium: 2, low: 1 };

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
  const bars = CONFIDENCE_BARS[resolution.confidence] || 1;

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
          <div className="mt-1 flex items-center gap-1.5">
            <div className="flex gap-0.5">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className={`h-3 w-1.5 rounded-sm ${
                    n <= bars ? "bg-p2p-blue" : "bg-p2p-border"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold capitalize">
              {resolution.confidence}
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

      {/* Source Assessment */}
      {resolution.source_fetch_summary && (
        <div className="mt-4 rounded-card border border-p2p-border bg-p2p-bg/50 p-3">
          <div className="text-[10px] uppercase tracking-wider text-p2p-text-secondary">
            Source Assessment
          </div>
          <p className="mt-1 text-xs text-p2p-text-secondary leading-relaxed whitespace-pre-wrap">
            {resolution.source_fetch_summary}
          </p>
        </div>
      )}

      {/* Evidence Trace */}
      <div className="mt-4 rounded-card border border-p2p-border bg-p2p-bg/50 p-3">
        <div className="text-[10px] uppercase tracking-wider text-p2p-text-secondary">
          Evidence Trace
        </div>
        <div className="mt-2 space-y-1 text-xs text-p2p-text-secondary">
          <div className="flex items-center gap-1.5">
            {resolution.source_fetch_attempted ? (
              resolution.source_fetch_succeeded ? (
                <>
                  <CheckCircle className="h-3 w-3 text-p2p-green" />
                  Source fetch attempted and succeeded
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3 w-3 text-p2p-gold" />
                  Source fetch attempted but failed — resolved from findings only
                </>
              )
            ) : (
              <>
                <AlertTriangle className="h-3 w-3 text-p2p-text-secondary" />
                No source fetch attempted — resolved from submitted findings
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Scale className="h-3 w-3 text-p2p-violet" />
            Equivalence: outcome + winner + confidence + source_alignment
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="h-3 w-3 text-p2p-blue" />
            Validated via GenLayer prompt_comparative consensus
          </div>
        </div>
      </div>
    </div>
  );
}
