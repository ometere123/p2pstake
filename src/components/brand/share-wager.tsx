"use client";

import { useState } from "react";
import type { WagerDetail } from "@/lib/genlayer/types";
import { formatGEN, truncateAddress } from "@/lib/ui/format";
import { deadlineCountdown } from "@/lib/ui/time";
import { STATE_LABELS } from "@/lib/wager/states";
import type { WagerState } from "@/lib/genlayer/types";
import { Share2, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  wagerId: string;
  data: WagerDetail;
}

export function ShareWager({ wagerId, data }: Props) {
  const [copied, setCopied] = useState<"link" | "summary" | null>(null);
  const { wager, sources } = data;

  const url = typeof window !== "undefined"
    ? `${window.location.origin}/app/bets/${wagerId}`
    : "";

  const summary = [
    `P2PStake Wager: ${wager.title}`,
    `Stake: ${formatGEN(wager.stake_amount)} GEN each`,
    `Status: ${STATE_LABELS[wager.state as WagerState] || wager.state}`,
    `Deadline: ${deadlineCountdown(wager.deadline_unix)}`,
    `Creator: ${truncateAddress(wager.creator)}`,
    `Opponent: ${truncateAddress(wager.opponent)}`,
    `Sources: ${sources.map((s) => s.label).join(", ")}`,
    `Win: ${wager.win_condition}`,
    ``,
    url,
  ].join("\n");

  const copyLink = async () => {
    await navigator.clipboard.writeText(url);
    setCopied("link");
    setTimeout(() => setCopied(null), 2000);
  };

  const copySummary = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied("summary");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={copyLink}
        className="gap-1.5 border-p2p-border text-xs text-p2p-text-secondary"
      >
        {copied === "link" ? (
          <><Check className="h-3 w-3 text-p2p-green" />Copied!</>
        ) : (
          <><Copy className="h-3 w-3" />Copy Link</>
        )}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={copySummary}
        className="gap-1.5 border-p2p-border text-xs text-p2p-text-secondary"
      >
        {copied === "summary" ? (
          <><Check className="h-3 w-3 text-p2p-green" />Copied!</>
        ) : (
          <><Share2 className="h-3 w-3" />Share Summary</>
        )}
      </Button>
    </div>
  );
}
