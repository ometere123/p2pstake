"use client";

import Link from "next/link";
import { useWagerList } from "@/hooks/use-wager-list";
import { STATE_LABELS, STATE_BG_COLORS, STATE_COLORS, isActiveState } from "@/lib/wager/states";
import { formatGEN, truncateAddress } from "@/lib/ui/format";
import { deadlineCountdown } from "@/lib/ui/time";
import { EMPTY_STATE_COPY } from "@/lib/wager/copy";
import { Loader2, Plus, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { WagerState } from "@/lib/genlayer/types";

type Filter = "all" | "active" | "resolved" | "terminal";

export default function DashboardPage() {
  const { wagers, loading } = useWagerList();
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = wagers.filter((w) => {
    if (filter === "all") return true;
    if (filter === "active") return isActiveState(w.state) && !["RESOLVED", "APPEALED", "FINALIZED"].includes(w.state);
    if (filter === "resolved") return ["RESOLVED", "APPEALED", "FINALIZED"].includes(w.state);
    if (filter === "terminal") return !isActiveState(w.state);
    return true;
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Dashboard</h1>
          <p className="mt-1 text-sm text-p2p-text-secondary">
            Your wagers ({wagers.length})
          </p>
        </div>
        <Link href="/app/create">
          <Button className="gap-2 bg-p2p-blue text-white hover:bg-p2p-blue/90">
            <Plus className="h-4 w-4" />
            New Wager
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="mt-6 flex gap-2">
        {(["all", "active", "resolved", "terminal"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1 text-xs capitalize transition ${
              filter === f
                ? "border-p2p-blue bg-p2p-blue/10 text-p2p-blue"
                : "border-p2p-border text-p2p-text-secondary hover:border-p2p-text-secondary"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="mt-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-p2p-text-secondary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-sm text-p2p-text-secondary">{EMPTY_STATE_COPY.no_wagers}</p>
          <Link href="/app/create">
            <Button className="mt-4 gap-2 bg-p2p-blue text-white hover:bg-p2p-blue/90">
              <Plus className="h-4 w-4" />
              Create Source-Locked Bet
            </Button>
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((w) => (
            <Link
              key={w.id}
              href={`/app/bets/${w.id}`}
              className="group rounded-panel border border-p2p-border bg-p2p-panel p-4 transition hover:border-p2p-blue/40"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-display text-sm font-semibold line-clamp-2 group-hover:text-p2p-blue transition">
                  {w.title}
                </h3>
                <span
                  className={`shrink-0 ml-2 rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATE_BG_COLORS[w.state as WagerState]} ${STATE_COLORS[w.state as WagerState]}`}
                >
                  {STATE_LABELS[w.state as WagerState] || w.state}
                </span>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-p2p-text-secondary">
                <div className="flex justify-between">
                  <span>Opponent</span>
                  <span className="font-mono">{truncateAddress(w.opponent)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Stake</span>
                  <span>{formatGEN(w.stake_amount)} GEN</span>
                </div>
                <div className="flex justify-between">
                  <span>Deadline</span>
                  <span>{deadlineCountdown(w.deadline_unix)}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-1 text-[10px]">
                <Lock className="h-3 w-3 text-p2p-violet" />
                <span className="text-p2p-text-secondary">
                  {w.creator_funded && w.opponent_funded
                    ? "Sources locked · Stake locked"
                    : "Sources pending lock"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
