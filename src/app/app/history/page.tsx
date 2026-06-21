"use client";

import Link from "next/link";
import { useWagerList } from "@/hooks/use-wager-list";
import { STATE_LABELS, STATE_COLORS, isTerminalState } from "@/lib/wager/states";
import { formatGEN, truncateAddress } from "@/lib/ui/format";
import { unixToLocal } from "@/lib/ui/time";
import { Loader2 } from "lucide-react";
import type { WagerState } from "@/lib/genlayer/types";

export default function HistoryPage() {
  const { wagers, loading } = useWagerList();
  const history = wagers.filter((w) => isTerminalState(w.state as WagerState));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold">Wager History</h1>
      <p className="mt-1 text-sm text-p2p-text-secondary">
        Completed, cancelled, and expired wagers.
      </p>

      {loading ? (
        <div className="mt-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-p2p-text-secondary" />
        </div>
      ) : history.length === 0 ? (
        <p className="mt-8 text-sm text-p2p-text-secondary">No past wagers yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {history.map((w) => (
            <Link
              key={w.id}
              href={`/app/bets/${w.id}`}
              className="block rounded-panel border border-p2p-border bg-p2p-panel p-4 transition hover:border-p2p-blue/40"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">{w.title}</h3>
                <span className={`text-xs ${STATE_COLORS[w.state as WagerState]}`}>
                  {STATE_LABELS[w.state as WagerState]}
                </span>
              </div>
              <div className="mt-2 flex gap-4 text-xs text-p2p-text-secondary">
                <span>{truncateAddress(w.opponent)}</span>
                <span>{formatGEN(w.stake_amount)} GEN</span>
                <span>{unixToLocal(w.created_at_unix)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
