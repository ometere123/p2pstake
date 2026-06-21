import type { WagerState } from "@/lib/genlayer/types";

export const WAGER_STATES: WagerState[] = [
  "INVITED",
  "ACCEPTED",
  "CREATOR_FUNDED",
  "OPPONENT_FUNDED",
  "LOCKED",
  "EVIDENCE_OPEN",
  "RESOLVED",
  "APPEALED",
  "FINALIZED",
  "CLAIMED",
  "CANCELLED",
  "EXPIRED",
];

export const STATE_LABELS: Record<WagerState, string> = {
  INVITED: "Waiting for Opponent",
  ACCEPTED: "Terms Accepted",
  CREATOR_FUNDED: "Creator Funded",
  OPPONENT_FUNDED: "Opponent Funded",
  LOCKED: "Stake Locked",
  EVIDENCE_OPEN: "Evidence Room Open",
  RESOLVED: "Verdict Issued",
  APPEALED: "Appeal Reviewed",
  FINALIZED: "Final",
  CLAIMED: "Payout Claimed",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

export const STATE_COLORS: Record<WagerState, string> = {
  INVITED: "text-p2p-gold",
  ACCEPTED: "text-p2p-blue",
  CREATOR_FUNDED: "text-p2p-blue",
  OPPONENT_FUNDED: "text-p2p-blue",
  LOCKED: "text-p2p-violet",
  EVIDENCE_OPEN: "text-p2p-violet",
  RESOLVED: "text-p2p-green",
  APPEALED: "text-p2p-gold",
  FINALIZED: "text-p2p-green",
  CLAIMED: "text-p2p-green",
  CANCELLED: "text-p2p-grey",
  EXPIRED: "text-p2p-grey",
};

export const STATE_BG_COLORS: Record<WagerState, string> = {
  INVITED: "bg-p2p-gold/10 border-p2p-gold/30",
  ACCEPTED: "bg-p2p-blue/10 border-p2p-blue/30",
  CREATOR_FUNDED: "bg-p2p-blue/10 border-p2p-blue/30",
  OPPONENT_FUNDED: "bg-p2p-blue/10 border-p2p-blue/30",
  LOCKED: "bg-p2p-violet/10 border-p2p-violet/30",
  EVIDENCE_OPEN: "bg-p2p-violet/10 border-p2p-violet/30",
  RESOLVED: "bg-p2p-green/10 border-p2p-green/30",
  APPEALED: "bg-p2p-gold/10 border-p2p-gold/30",
  FINALIZED: "bg-p2p-green/10 border-p2p-green/30",
  CLAIMED: "bg-p2p-green/10 border-p2p-green/30",
  CANCELLED: "bg-p2p-grey/10 border-p2p-grey/30",
  EXPIRED: "bg-p2p-grey/10 border-p2p-grey/30",
};

export type UserRole = "creator" | "opponent" | "none";

export function getNextActions(
  state: WagerState,
  role: UserRole,
  funded: boolean
): string[] {
  const actions: string[] = [];

  switch (state) {
    case "INVITED":
      if (role === "opponent") actions.push("accept_wager");
      if (role === "creator") actions.push("cancel_expired_wager");
      break;
    case "ACCEPTED":
      if (!funded) actions.push("fund_wager");
      break;
    case "CREATOR_FUNDED":
      if (role === "opponent" && !funded) actions.push("fund_wager");
      break;
    case "OPPONENT_FUNDED":
      if (role === "creator" && !funded) actions.push("fund_wager");
      break;
    case "LOCKED":
    case "EVIDENCE_OPEN":
      actions.push("submit_source_finding");
      actions.push("request_resolution");
      break;
    case "RESOLVED":
      actions.push("appeal_resolution");
      actions.push("finalize_wager");
      break;
    case "APPEALED":
      actions.push("finalize_wager");
      break;
    case "FINALIZED":
      actions.push("claim_payout");
      break;
  }

  return actions;
}

export function isTerminalState(state: WagerState): boolean {
  return ["CLAIMED", "CANCELLED", "EXPIRED"].includes(state);
}

export function isActiveState(state: WagerState): boolean {
  return !isTerminalState(state);
}
