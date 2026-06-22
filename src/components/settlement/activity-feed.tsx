"use client";

import type { WagerDetail } from "@/lib/genlayer/types";
import { unixToLocal } from "@/lib/ui/time";
import { truncateAddress } from "@/lib/ui/format";
import { CheckCircle, Clock, Coins, FileCheck, Scale, Gavel, Shield, XCircle } from "lucide-react";

interface Activity {
  icon: React.ElementType;
  label: string;
  time: string;
  color: string;
  detail?: string;
}

export function ActivityFeed({ data }: { data: WagerDetail }) {
  const { wager, findings, resolution, appeal } = data;
  const activities: Activity[] = [];

  activities.push({
    icon: FileCheck,
    label: "Wager created",
    time: unixToLocal(wager.created_at_unix),
    color: "text-p2p-blue",
    detail: `by ${truncateAddress(wager.creator)}`,
  });

  if (wager.state !== "INVITED" && wager.state !== "CANCELLED") {
    activities.push({
      icon: Shield,
      label: "Terms accepted; sources locked",
      time: "",
      color: "text-p2p-violet",
      detail: `by ${truncateAddress(wager.opponent)}`,
    });
  }

  if (wager.creator_funded) {
    activities.push({
      icon: Coins,
      label: "Creator funded",
      time: "",
      color: "text-p2p-green",
      detail: truncateAddress(wager.creator),
    });
  }

  if (wager.opponent_funded) {
    activities.push({
      icon: Coins,
      label: "Opponent funded",
      time: "",
      color: "text-p2p-green",
      detail: truncateAddress(wager.opponent),
    });
  }

  if (wager.creator_funded && wager.opponent_funded) {
    activities.push({
      icon: CheckCircle,
      label: "Stake locked; both sides funded",
      time: "",
      color: "text-p2p-violet",
    });
  }

  for (const f of findings) {
    const side = f.submitter.toLowerCase() === wager.creator.toLowerCase() ? "Creator" : "Opponent";
    activities.push({
      icon: FileCheck,
      label: `${side} submitted finding`,
      time: unixToLocal(f.submitted_at_unix),
      color: "text-p2p-blue",
      detail: `Source: ${f.source_id} · Supports: ${f.supports_side}`,
    });
  }

  if (resolution) {
    activities.push({
      icon: Scale,
      label: `Resolved: ${resolution.outcome}`,
      time: unixToLocal(resolution.resolved_at_unix),
      color: "text-p2p-violet",
      detail: `Winner: ${resolution.winner} · Confidence: ${resolution.confidence}`,
    });
  }

  if (appeal) {
    activities.push({
      icon: Gavel,
      label: `Appeal: ${appeal.outcome}`,
      time: unixToLocal(appeal.created_at_unix),
      color: "text-p2p-gold",
      detail: `Category: ${appeal.appeal_category}`,
    });
  }

  if (wager.state === "FINALIZED" || wager.state === "CLAIMED") {
    activities.push({
      icon: CheckCircle,
      label: "Wager finalized",
      time: "",
      color: "text-p2p-green",
    });
  }

  if (wager.claimed_creator) {
    activities.push({
      icon: Coins,
      label: "Creator claimed",
      time: "",
      color: "text-p2p-green",
    });
  }

  if (wager.claimed_opponent) {
    activities.push({
      icon: Coins,
      label: "Opponent claimed",
      time: "",
      color: "text-p2p-green",
    });
  }

  if (wager.state === "CANCELLED") {
    activities.push({ icon: XCircle, label: "Cancelled", time: "", color: "text-p2p-grey" });
  }
  if (wager.state === "EXPIRED") {
    activities.push({ icon: Clock, label: "Expired", time: "", color: "text-p2p-grey" });
  }

  return (
    <div className="rounded-card border border-p2p-border bg-p2p-surface p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-p2p-text-secondary">
        Activity
      </div>
      <div className="mt-3 space-y-0">
        {activities.map((a, i) => (
          <div key={i} className="flex gap-3">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <a.icon className={`h-3.5 w-3.5 shrink-0 ${a.color}`} />
              {i < activities.length - 1 && (
                <div className="w-px flex-1 bg-p2p-border" />
              )}
            </div>
            {/* Content */}
            <div className="pb-3">
              <div className="text-xs font-medium text-p2p-text-primary">{a.label}</div>
              {a.detail && (
                <div className="text-[10px] text-p2p-text-secondary">{a.detail}</div>
              )}
              {a.time && (
                <div className="text-[10px] text-p2p-text-secondary">{a.time}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
