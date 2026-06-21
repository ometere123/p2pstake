"use client";

import { useState, useEffect } from "react";
import { getAllWagerIds, getWager, getResolution } from "@/lib/genlayer/contract";
import { formatGEN } from "@/lib/ui/format";
import { Loader2, BarChart3, Scale, Coins, Users, Shield } from "lucide-react";

interface Stats {
  totalWagers: number;
  invited: number;
  accepted: number;
  locked: number;
  evidenceOpen: number;
  resolved: number;
  appealed: number;
  finalized: number;
  claimed: number;
  cancelled: number;
  expired: number;
  creatorWins: number;
  opponentWins: number;
  refunds: number;
  invalid: number;
  totalStakedWei: bigint;
  uniqueAddresses: Set<string>;
}

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const ids = await getAllWagerIds();
      const s: Stats = {
        totalWagers: ids.length,
        invited: 0, accepted: 0, locked: 0, evidenceOpen: 0,
        resolved: 0, appealed: 0, finalized: 0, claimed: 0,
        cancelled: 0, expired: 0,
        creatorWins: 0, opponentWins: 0, refunds: 0, invalid: 0,
        totalStakedWei: BigInt(0),
        uniqueAddresses: new Set(),
      };

      for (const id of ids) {
        const wager = await getWager(id);
        if (!wager) continue;

        s.uniqueAddresses.add(wager.creator.toLowerCase());
        s.uniqueAddresses.add(wager.opponent.toLowerCase());

        if (wager.creator_funded || wager.opponent_funded) {
          const stakeWei = BigInt(wager.stake_amount);
          if (wager.creator_funded) s.totalStakedWei += stakeWei;
          if (wager.opponent_funded) s.totalStakedWei += stakeWei;
        }

        switch (wager.state) {
          case "INVITED": s.invited++; break;
          case "ACCEPTED": case "CREATOR_FUNDED": case "OPPONENT_FUNDED": s.accepted++; break;
          case "LOCKED": s.locked++; break;
          case "EVIDENCE_OPEN": s.evidenceOpen++; break;
          case "RESOLVED": s.resolved++; break;
          case "APPEALED": s.appealed++; break;
          case "FINALIZED": s.finalized++; break;
          case "CLAIMED": s.claimed++; break;
          case "CANCELLED": s.cancelled++; break;
          case "EXPIRED": s.expired++; break;
        }

        if (["RESOLVED", "APPEALED", "FINALIZED", "CLAIMED"].includes(wager.state)) {
          const res = await getResolution(id);
          if (res) {
            switch (res.outcome) {
              case "creator_wins": s.creatorWins++; break;
              case "opponent_wins": s.opponentWins++; break;
              case "refund": s.refunds++; break;
              case "invalid": s.invalid++; break;
            }
          }
        }
      }

      setStats(s);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-p2p-text-secondary" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center gap-3">
        <BarChart3 className="h-6 w-6 text-p2p-blue" />
        <h1 className="font-display text-2xl font-bold">Protocol Statistics</h1>
      </div>
      <p className="mt-1 text-sm text-p2p-text-secondary">
        Live on-chain metrics from the P2PStake contract.
      </p>

      {/* Top-level metrics */}
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={Scale} label="Total Wagers" value={stats.totalWagers} />
        <StatCard icon={Coins} label="Total Staked" value={`${formatGEN(stats.totalStakedWei.toString())} GEN`} />
        <StatCard icon={Users} label="Unique Addresses" value={stats.uniqueAddresses.size} />
        <StatCard icon={Shield} label="Settled" value={stats.creatorWins + stats.opponentWins + stats.refunds + stats.invalid} />
      </div>

      {/* State breakdown */}
      <div className="mt-8 rounded-panel border border-p2p-border bg-p2p-panel p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-p2p-text-secondary">
          Wager States
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatRow label="Invited" value={stats.invited} color="text-p2p-gold" />
          <StatRow label="Accepted / Funding" value={stats.accepted} color="text-p2p-blue" />
          <StatRow label="Locked" value={stats.locked} color="text-p2p-violet" />
          <StatRow label="Evidence Open" value={stats.evidenceOpen} color="text-p2p-violet" />
          <StatRow label="Resolved" value={stats.resolved} color="text-p2p-green" />
          <StatRow label="Appealed" value={stats.appealed} color="text-p2p-gold" />
          <StatRow label="Finalized" value={stats.finalized} color="text-p2p-green" />
          <StatRow label="Claimed" value={stats.claimed} color="text-p2p-green" />
          <StatRow label="Cancelled" value={stats.cancelled} color="text-p2p-grey" />
          <StatRow label="Expired" value={stats.expired} color="text-p2p-grey" />
        </div>
      </div>

      {/* Outcome breakdown */}
      <div className="mt-6 rounded-panel border border-p2p-border bg-p2p-panel p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-p2p-text-secondary">
          Settlement Outcomes
        </h2>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatRow label="Creator Wins" value={stats.creatorWins} color="text-p2p-green" />
          <StatRow label="Opponent Wins" value={stats.opponentWins} color="text-p2p-blue" />
          <StatRow label="Refunds" value={stats.refunds} color="text-p2p-gold" />
          <StatRow label="Invalid" value={stats.invalid} color="text-p2p-red" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="rounded-panel border border-p2p-border bg-p2p-panel p-4">
      <div className="flex items-center gap-2 text-p2p-text-secondary">
        <Icon className="h-4 w-4" />
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className="mt-2 font-display text-2xl font-bold text-p2p-text-primary">
        {value}
      </div>
    </div>
  );
}

function StatRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center justify-between rounded-card border border-p2p-border bg-p2p-surface px-3 py-2">
      <span className="text-xs text-p2p-text-secondary">{label}</span>
      <span className={`font-mono text-sm font-semibold ${color}`}>{value}</span>
    </div>
  );
}
