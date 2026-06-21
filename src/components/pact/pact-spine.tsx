"use client";

import type { WagerDetail } from "@/lib/genlayer/types";
import { formatGEN, truncateAddress } from "@/lib/ui/format";
import { unixToLocal, deadlineCountdown } from "@/lib/ui/time";
import { STATE_LABELS, STATE_COLORS } from "@/lib/wager/states";
import { Lock, Clock, Shield, FileCheck, Users, Coins } from "lucide-react";
import type { WagerState } from "@/lib/genlayer/types";

interface Props {
  data: WagerDetail;
}

export function PactSpine({ data }: Props) {
  const { wager, sources } = data;
  const isLocked = wager.creator_funded && wager.opponent_funded;
  const primarySources = sources.filter((s) => !s.is_fallback);
  const fallbackSources = sources.filter((s) => s.is_fallback);

  return (
    <div className="space-y-3">
      {/* Seal badge */}
      {isLocked && (
        <div className="flex items-center gap-2 rounded-card border border-p2p-violet/30 bg-p2p-violet/5 px-3 py-2">
          <Lock className="h-3.5 w-3.5 text-p2p-violet" />
          <span className="text-xs font-semibold text-p2p-violet">
            Terms Locked · Sources Locked · Stake Locked
          </span>
        </div>
      )}

      {/* State */}
      <Section icon={Shield} label="Status">
        <span className={`text-sm font-semibold ${STATE_COLORS[wager.state as WagerState]}`}>
          {STATE_LABELS[wager.state as WagerState] || wager.state}
        </span>
      </Section>

      {/* Parties */}
      <Section icon={Users} label="Parties">
        <Row label="Creator" value={truncateAddress(wager.creator)} mono />
        <Row label="Opponent" value={truncateAddress(wager.opponent)} mono />
      </Section>

      {/* Stake */}
      <Section icon={Coins} label="Stake">
        <Row label="Each side" value={`${formatGEN(wager.stake_amount)} GEN`} />
        <Row label="Total pot" value={`${formatGEN(String(BigInt(wager.stake_amount) * BigInt(2)))} GEN`} />
        <Row label="Creator funded" value={wager.creator_funded ? "Yes" : "No"} />
        <Row label="Opponent funded" value={wager.opponent_funded ? "Yes" : "No"} />
      </Section>

      {/* Deadline */}
      <Section icon={Clock} label="Deadline">
        <Row label="Local" value={unixToLocal(wager.deadline_unix)} />
        <Row label="Countdown" value={deadlineCountdown(wager.deadline_unix)} />
        <Row label="Unix" value={wager.deadline_unix} mono />
      </Section>

      {/* Conditions */}
      <Section icon={FileCheck} label="Win Condition">
        <p className="text-xs text-p2p-text-secondary">{wager.win_condition}</p>
      </Section>

      <Section icon={Shield} label="Loss Condition">
        <p className="text-xs text-p2p-text-secondary">{wager.loss_condition}</p>
      </Section>

      {/* Proof rules */}
      <Section icon={FileCheck} label="Accepted Proof" color="text-p2p-green">
        <p className="text-xs text-p2p-text-secondary">{wager.accepted_proof}</p>
      </Section>

      <Section icon={Shield} label="Excluded Proof" color="text-p2p-red">
        <p className="text-xs text-p2p-text-secondary">{wager.excluded_proof}</p>
      </Section>

      {/* Sources */}
      <Section icon={Lock} label={`Sources (${sources.length})`} color="text-p2p-violet">
        {primarySources.map((s) => (
          <div key={s.source_id} className="mt-1">
            <span className="text-[10px] font-semibold uppercase text-p2p-blue">Primary</span>
            <div className="text-xs text-p2p-text-secondary">{s.label}</div>
            {s.url && <div className="font-mono text-[10px] text-p2p-text-secondary truncate">{s.url}</div>}
            {s.locked && (
              <span className="inline-flex items-center gap-0.5 mt-0.5 text-[10px] text-p2p-violet">
                <Lock className="h-2.5 w-2.5" /> Locked
              </span>
            )}
          </div>
        ))}
        {fallbackSources.map((s) => (
          <div key={s.source_id} className="mt-1">
            <span className="text-[10px] font-semibold uppercase text-p2p-text-secondary">Fallback</span>
            <div className="text-xs text-p2p-text-secondary">{s.label}</div>
            {s.locked && (
              <span className="inline-flex items-center gap-0.5 mt-0.5 text-[10px] text-p2p-violet">
                <Lock className="h-2.5 w-2.5" /> Locked
              </span>
            )}
          </div>
        ))}
      </Section>
    </div>
  );
}

function Section({
  icon: Icon,
  label,
  color = "text-p2p-text-secondary",
  children,
}: {
  icon: React.ElementType;
  label: string;
  color?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-card border border-p2p-border bg-p2p-surface p-3">
      <div className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider ${color}`}>
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-p2p-text-secondary">{label}</span>
      <span className={mono ? "font-mono text-p2p-text-primary" : "text-p2p-text-primary"}>
        {value}
      </span>
    </div>
  );
}
