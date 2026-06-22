"use client";

import { useFormContext } from "react-hook-form";
import type { CreateWagerFormData } from "@/lib/wager/validation";
import { Button } from "@/components/ui/button";
import { TxHashLink } from "@/components/brand/tx-hash-link";
import { useContractWrite } from "@/hooks/use-contract-write";
import { createWager } from "@/lib/genlayer/contract";
import { genToWei } from "@/lib/ui/format";
import { localDateToUnix } from "@/lib/ui/time";
import { useRouter } from "next/navigation";
import { Lock, Shield, FileCheck, Loader2, AlertTriangle } from "lucide-react";
import { isCoolingOff, isExcluded } from "@/components/guards/session-safety";
import { useState, useEffect } from "react";

interface Props {
  onPrev: () => void;
}

export function ReviewAndSealStep({ onPrev }: Props) {
  const { getValues, handleSubmit } = useFormContext<CreateWagerFormData>();
  const { write, txHash, error, isPending } = useContractWrite();
  const router = useRouter();
  const data = getValues();

  const selfExcluded = isExcluded();
  const coolOff = isCoolingOff();
  const [cooldownLeft, setCooldownLeft] = useState(coolOff ? 300 : 0);

  useEffect(() => {
    if (!coolOff || cooldownLeft <= 0) return;
    const t = setInterval(() => setCooldownLeft((s) => Math.max(s - 1, 0)), 1000);
    return () => clearInterval(t);
  }, [coolOff, cooldownLeft]);

  const primarySources = data.sources?.filter((s) => !s.is_fallback) ?? [];
  const fallbackSources = data.sources?.filter((s) => s.is_fallback) ?? [];

  const onSeal = handleSubmit(async (formData) => {
    const deadlineUnix = localDateToUnix(formData.deadline_date, formData.deadline_time);
    const stakeWei = genToWei(formData.stake_amount);
    const evWindowSecs = parseInt(formData.evidence_window_hours || "24") * 3600;
    const apWindowSecs = parseInt(formData.appeal_window_hours || "12") * 3600;

    const hash = await write(
      () =>
        createWager({
          wager_id: formData.wager_id,
          opponent: formData.opponent,
          title: formData.title,
          stake_amount: stakeWei,
          deadline_unix: deadlineUnix,
          win_condition: formData.win_condition,
          loss_condition: formData.loss_condition,
          accepted_proof: formData.accepted_proof,
          excluded_proof: formData.excluded_proof,
          resolution_question: formData.resolution_question || "",
          appeal_standard: [
            formData.appeal_standard || "",
            formData.conflict_rule ? `CONFLICT RULE: ${formData.conflict_rule}` : "",
            formData.cancellation_rule ? `CANCELLATION RULE: ${formData.cancellation_rule}` : "",
            formData.postponement_rule ? `POSTPONEMENT RULE: ${formData.postponement_rule}` : "",
          ].filter(Boolean).join(" | "),
          evidence_window_seconds: evWindowSecs,
          appeal_window_seconds: apWindowSecs,
          sources: formData.sources,
        }),
      formData.wager_id,
      "create_wager"
    );

    if (hash) {
      setTimeout(() => router.push(`/app/bets/${formData.wager_id}`), 2000);
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold">Step 6: Review & Seal</h2>
        <p className="mt-1 text-sm text-p2p-text-secondary">
          Review all terms. Once sealed, these cannot be changed.
        </p>
      </div>

      {/* Summary */}
      <div className="space-y-4">
        <div className="rounded-card border border-p2p-border bg-p2p-surface p-4">
          <div className="text-[10px] uppercase tracking-wider text-p2p-text-secondary">Title</div>
          <div className="mt-1 text-sm font-semibold">{data.title || "-"}</div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-card border border-p2p-border bg-p2p-surface p-4">
            <div className="text-[10px] uppercase tracking-wider text-p2p-text-secondary">Stake</div>
            <div className="mt-1 text-sm font-semibold">{data.stake_amount || "0"} GEN</div>
          </div>
          <div className="rounded-card border border-p2p-border bg-p2p-surface p-4">
            <div className="text-[10px] uppercase tracking-wider text-p2p-text-secondary">Deadline</div>
            <div className="mt-1 text-sm font-semibold">
              {data.deadline_date} {data.deadline_time}
            </div>
          </div>
        </div>

        <div className="rounded-card border border-p2p-border bg-p2p-surface p-4">
          <div className="text-[10px] uppercase tracking-wider text-p2p-green">Win Condition</div>
          <div className="mt-1 text-sm">{data.win_condition || "-"}</div>
        </div>

        <div className="rounded-card border border-p2p-border bg-p2p-surface p-4">
          <div className="text-[10px] uppercase tracking-wider text-p2p-red">Loss Condition</div>
          <div className="mt-1 text-sm">{data.loss_condition || "-"}</div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-card border border-p2p-border bg-p2p-surface p-4">
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-p2p-blue">
              <FileCheck className="h-3 w-3" /> Accepted Proof
            </div>
            <div className="mt-1 text-xs text-p2p-text-secondary">{data.accepted_proof || "-"}</div>
          </div>
          <div className="rounded-card border border-p2p-border bg-p2p-surface p-4">
            <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-p2p-gold">
              <Shield className="h-3 w-3" /> Excluded Proof
            </div>
            <div className="mt-1 text-xs text-p2p-text-secondary">{data.excluded_proof || "-"}</div>
          </div>
        </div>

        {/* Sources */}
        <div className="rounded-card border border-p2p-border bg-p2p-surface p-4">
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-p2p-violet">
            <Lock className="h-3 w-3" /> Evidence Sources ({data.sources?.length || 0})
          </div>
          <div className="mt-2 space-y-2">
            {primarySources.map((s, i) => (
              <div key={i} className="text-xs">
                <span className="text-p2p-blue">Primary:</span> {s.label}: {s.url}
              </div>
            ))}
            {fallbackSources.map((s, i) => (
              <div key={i} className="text-xs text-p2p-text-secondary">
                <span>Fallback:</span> {s.label}: {s.url}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tx result */}
      {txHash && (
        <div className="rounded-card border border-p2p-green/30 bg-p2p-green/5 p-4">
          <div className="text-sm font-semibold text-p2p-green">Wager Sealed</div>
          <div className="mt-1">
            <TxHashLink hash={txHash} />
          </div>
          <p className="mt-1 text-xs text-p2p-text-secondary">
            Redirecting to wager detail...
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-card border border-p2p-red/30 bg-p2p-red/5 p-4">
          <div className="text-sm text-p2p-red">{error}</div>
        </div>
      )}

      {selfExcluded && (
        <div className="flex items-start gap-2 rounded-card border border-p2p-red/30 bg-p2p-red/5 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-p2p-red" />
          <p className="text-xs text-p2p-red">
            Self-exclusion is active. You cannot create wagers during this period.
            Manage in Settings.
          </p>
        </div>
      )}

      {coolOff && cooldownLeft > 0 && !selfExcluded && (
        <div className="flex items-start gap-2 rounded-card border border-p2p-gold/30 bg-p2p-gold/5 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-p2p-gold" />
          <p className="text-xs text-p2p-gold">
            Cooling-off mode is active. You can seal in {Math.floor(cooldownLeft / 60)}m {cooldownLeft % 60}s.
          </p>
        </div>
      )}

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onPrev}
          disabled={isPending}
          className="border-p2p-border text-p2p-text-secondary"
        >
          Back
        </Button>
        <Button
          onClick={onSeal}
          disabled={isPending || !!txHash || selfExcluded || (coolOff && cooldownLeft > 0)}
          className="gap-2 bg-p2p-violet text-white hover:bg-p2p-violet/90"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sealing...
            </>
          ) : (
            "Seal Bet Terms"
          )}
        </Button>
      </div>
    </div>
  );
}
