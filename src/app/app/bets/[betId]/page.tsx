"use client";

import { useParams } from "next/navigation";
import { useWager } from "@/hooks/use-wager";
import { PactSpine } from "@/components/pact/pact-spine";
import { EvidenceTheater } from "@/components/evidence/evidence-theater";
import { SettlementRail } from "@/components/settlement/settlement-rail";
import { ActivityFeed } from "@/components/settlement/activity-feed";
import { ShareWager } from "@/components/brand/share-wager";
import { Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function BetDetailPage() {
  const params = useParams();
  const betId = params.betId as string;
  const { data, loading, error, refetch } = useWager(betId);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-p2p-text-secondary" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <AlertTriangle className="h-8 w-8 text-p2p-red" />
        <p className="text-sm text-p2p-text-secondary">
          {error || "Wager not found."}
        </p>
        <Link
          href="/app"
          className="text-sm text-p2p-blue hover:underline"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Title bar */}
      <div className="mb-6">
        <Link href="/app" className="text-xs text-p2p-text-secondary hover:text-p2p-blue">
          ← Dashboard
        </Link>
        <h1 className="mt-2 font-display text-xl font-bold">{data.wager.title}</h1>
        <p className="mt-1 font-mono text-xs text-p2p-text-secondary">
          Wager ID: {betId}
        </p>
        <ShareWager wagerId={betId} data={data} />
      </div>

      {/* Three-zone layout */}
      <div className="grid gap-6 lg:grid-cols-[280px_1fr_280px]">
        {/* Left: Pact Spine */}
        <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-p2p-text-secondary">
            Pact Spine
          </div>
          <PactSpine data={data} />
        </aside>

        {/* Center: Evidence Theater */}
        <section>
          <EvidenceTheater data={data} onFindingSubmitted={refetch} />
        </section>

        {/* Right: Settlement Rail */}
        <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-p2p-text-secondary">
            Settlement Rail
          </div>
          <SettlementRail data={data} wagerId={betId} onAction={refetch} />
          <ActivityFeed data={data} />
        </aside>
      </div>
    </div>
  );
}
