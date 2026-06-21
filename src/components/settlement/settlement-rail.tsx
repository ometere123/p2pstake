"use client";

import type { WagerDetail } from "@/lib/genlayer/types";
import { useContractWrite } from "@/hooks/use-contract-write";
import {
  acceptWager,
  fundWager,
  requestResolution,
  finalizeWager,
  claimPayout,
  claimRefund,
} from "@/lib/genlayer/contract";
import { formatGEN } from "@/lib/ui/format";
import { isDeadlinePassed, deadlineCountdown, unixToRelative } from "@/lib/ui/time";
import { TxHashLink } from "@/components/brand/tx-hash-link";
import { Button } from "@/components/ui/button";
import { BUTTON_COPY, ACTION_DESCRIPTIONS } from "@/lib/wager/copy";
import { STATE_LABELS, STATE_COLORS } from "@/lib/wager/states";
import type { WagerState } from "@/lib/genlayer/types";
import {
  CheckCircle,
  Clock,
  Loader2,
  Scale,
  Shield,
  Coins,
  Gavel,
  AlertTriangle,
} from "lucide-react";

interface Props {
  data: WagerDetail;
  wagerId: string;
  onAction: () => void;
}

export function SettlementRail({ data, wagerId, onAction }: Props) {
  const { wager, resolution, appeal, position } = data;
  const { write, txHash, error, isPending, reset } = useContractWrite();

  const role = position?.role || "none";
  const isParticipant = position?.is_participant || false;
  const funded = position?.funded || false;
  const claimed = position?.claimed || false;
  const deadlinePassed = isDeadlinePassed(wager.deadline_unix);
  const findingsCount = data.findings.length;
  const hasLockedSource = data.sources.some((s) => s.locked);

  const handleAction = async (action: string) => {
    reset();
    let hash: string | null = null;

    switch (action) {
      case "accept_wager":
        hash = await write(() => acceptWager(wagerId), wagerId, action);
        break;
      case "fund_wager":
        hash = await write(
          () => fundWager(wagerId, BigInt(wager.stake_amount)),
          wagerId,
          action
        );
        break;
      case "request_resolution":
        hash = await write(() => requestResolution(wagerId), wagerId, action);
        break;
      case "finalize_wager":
        hash = await write(() => finalizeWager(wagerId), wagerId, action);
        break;
      case "claim_payout":
        hash = await write(() => claimPayout(wagerId), wagerId, action);
        break;
      case "claim_refund":
        hash = await write(() => claimRefund(wagerId), wagerId, action);
        break;
    }

    if (hash) onAction();
  };

  return (
    <div className="space-y-3">
      {/* Current state */}
      <div className="rounded-card border border-p2p-border bg-p2p-surface p-3">
        <div className="text-[10px] uppercase tracking-wider text-p2p-text-secondary">
          Current State
        </div>
        <div className={`mt-1 text-sm font-semibold ${STATE_COLORS[wager.state as WagerState]}`}>
          {STATE_LABELS[wager.state as WagerState] || wager.state}
        </div>
      </div>

      {/* Deadline */}
      <div className="rounded-card border border-p2p-border bg-p2p-surface p-3">
        <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-p2p-text-secondary">
          <Clock className="h-3 w-3" /> Deadline
        </div>
        <div className={`mt-1 text-sm font-semibold ${deadlinePassed ? "text-p2p-red" : "text-p2p-gold"}`}>
          {deadlineCountdown(wager.deadline_unix)}
        </div>
      </div>

      {/* Funding checklist */}
      <div className="rounded-card border border-p2p-border bg-p2p-surface p-3">
        <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-p2p-text-secondary">
          <Coins className="h-3 w-3" /> Funding
        </div>
        <div className="mt-2 space-y-1">
          <FundingRow label="Creator" funded={wager.creator_funded} amount={wager.stake_amount} />
          <FundingRow label="Opponent" funded={wager.opponent_funded} amount={wager.stake_amount} />
        </div>
      </div>

      {/* Verdict */}
      {resolution && (
        <div className="rounded-card border border-p2p-violet/30 bg-p2p-violet/5 p-3">
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-p2p-violet">
            <Scale className="h-3 w-3" /> Verdict
          </div>
          <div className="mt-2 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-p2p-text-secondary">Outcome</span>
              <span className="font-semibold text-p2p-text-primary">{resolution.outcome}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-p2p-text-secondary">Winner</span>
              <span className="font-semibold text-p2p-text-primary">{resolution.winner}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-p2p-text-secondary">Confidence</span>
              <span>{resolution.confidence}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-p2p-text-secondary">Source Alignment</span>
              <span>{resolution.source_alignment}</span>
            </div>
            <div className="mt-2 border-t border-p2p-border pt-2 text-p2p-text-secondary">
              {resolution.reason}
            </div>
            {resolution.source_fetch_attempted && (
              <div className="text-[10px] text-p2p-text-secondary">
                Source fetch: {resolution.source_fetch_succeeded ? "succeeded" : "attempted but failed"}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Appeal */}
      {appeal && (
        <div className="rounded-card border border-p2p-gold/30 bg-p2p-gold/5 p-3">
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-p2p-gold">
            <Gavel className="h-3 w-3" /> Appeal
          </div>
          <div className="mt-2 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-p2p-text-secondary">Category</span>
              <span>{appeal.appeal_category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-p2p-text-secondary">Outcome</span>
              <span className="font-semibold">{appeal.outcome}</span>
            </div>
            <div className="mt-1 text-p2p-text-secondary">{appeal.reason}</div>
          </div>
        </div>
      )}

      {/* Appeal window countdown */}
      {wager.state === "RESOLVED" && resolution && (
        <div className="rounded-card border border-p2p-border bg-p2p-surface p-3">
          <div className="text-[10px] uppercase tracking-wider text-p2p-text-secondary">
            Appeal Window
          </div>
          <div className="mt-1 text-sm font-semibold text-p2p-gold">
            {unixToRelative(
              String(
                Number(resolution.resolved_at_unix) +
                  Number(wager.appeal_window_seconds)
              )
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        {/* Accept */}
        {wager.state === "INVITED" && role === "opponent" && (
          <ActionButton
            action="accept_wager"
            onClick={() => handleAction("accept_wager")}
            isPending={isPending}
            icon={Shield}
          />
        )}

        {/* Fund */}
        {["ACCEPTED", "CREATOR_FUNDED", "OPPONENT_FUNDED"].includes(wager.state) &&
          isParticipant &&
          !funded && (
            <ActionButton
              action="fund_wager"
              onClick={() => handleAction("fund_wager")}
              isPending={isPending}
              icon={Coins}
              description={`Send ${formatGEN(wager.stake_amount)} GEN`}
            />
          )}

        {/* Resolution */}
        {["LOCKED", "EVIDENCE_OPEN"].includes(wager.state) &&
          isParticipant &&
          deadlinePassed &&
          findingsCount > 0 &&
          hasLockedSource && (
            <ActionButton
              action="request_resolution"
              onClick={() => handleAction("request_resolution")}
              isPending={isPending}
              icon={Scale}
            />
          )}

        {/* Resolution blockers */}
        {["LOCKED", "EVIDENCE_OPEN"].includes(wager.state) &&
          isParticipant &&
          !deadlinePassed && (
            <div className="flex items-center gap-2 rounded-card border border-p2p-border bg-p2p-surface p-3 text-xs text-p2p-text-secondary">
              <AlertTriangle className="h-3.5 w-3.5 text-p2p-gold" />
              Resolution available after deadline passes
            </div>
          )}

        {/* Appeal link */}
        {wager.state === "RESOLVED" && isParticipant && !data.appeal && (
          <div>
            <a
              href={`/app/bets/${wagerId}/appeal`}
              className="flex w-full items-center justify-center gap-2 rounded-md border border-p2p-gold bg-p2p-gold/10 px-4 py-2.5 text-sm font-medium text-p2p-gold transition hover:bg-p2p-gold/20"
            >
              <Gavel className="h-4 w-4" />
              Appeal With Evidence
            </a>
            <p className="mt-1 text-[10px] text-p2p-text-secondary">
              {ACTION_DESCRIPTIONS.appeal_resolution}
            </p>
          </div>
        )}

        {/* Finalize */}
        {["RESOLVED", "APPEALED"].includes(wager.state) && (
          <ActionButton
            action="finalize_wager"
            onClick={() => handleAction("finalize_wager")}
            isPending={isPending}
            icon={Gavel}
          />
        )}

        {/* Claim */}
        {wager.state === "FINALIZED" && isParticipant && !claimed && (
          <>
            {resolution &&
            ["refund", "invalid"].includes(resolution.outcome) ? (
              <ActionButton
                action="claim_refund"
                onClick={() => handleAction("claim_refund")}
                isPending={isPending}
                icon={Coins}
              />
            ) : (
              <ActionButton
                action="claim_payout"
                onClick={() => handleAction("claim_payout")}
                isPending={isPending}
                icon={Coins}
              />
            )}
          </>
        )}

        {claimed && (
          <div className="flex items-center gap-2 rounded-card border border-p2p-green/30 bg-p2p-green/5 p-3 text-xs text-p2p-green">
            <CheckCircle className="h-3.5 w-3.5" />
            You have claimed your payout.
          </div>
        )}
      </div>

      {/* Tx result */}
      {txHash && (
        <div className="rounded-card border border-p2p-green/30 bg-p2p-green/5 p-3">
          <div className="text-xs font-semibold text-p2p-green">Transaction Confirmed</div>
          <TxHashLink hash={txHash} />
        </div>
      )}

      {error && (
        <div className="rounded-card border border-p2p-red/30 bg-p2p-red/5 p-3 text-xs text-p2p-red">
          {error}
        </div>
      )}
    </div>
  );
}

function FundingRow({
  label,
  funded,
  amount,
}: {
  label: string;
  funded: boolean;
  amount: string;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-p2p-text-secondary">{label}</span>
      <span className={funded ? "text-p2p-green" : "text-p2p-text-secondary"}>
        {funded ? `${formatGEN(amount)} GEN ✓` : "Pending"}
      </span>
    </div>
  );
}

function ActionButton({
  action,
  onClick,
  isPending,
  icon: Icon,
  description,
}: {
  action: string;
  onClick: () => void;
  isPending: boolean;
  icon: React.ElementType;
  description?: string;
}) {
  return (
    <div>
      <Button
        onClick={onClick}
        disabled={isPending}
        className="w-full gap-2 bg-p2p-blue text-white hover:bg-p2p-blue/90"
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
        {BUTTON_COPY[action] || action}
      </Button>
      <p className="mt-1 text-[10px] text-p2p-text-secondary">
        {description || ACTION_DESCRIPTIONS[action] || ""}
      </p>
    </div>
  );
}
