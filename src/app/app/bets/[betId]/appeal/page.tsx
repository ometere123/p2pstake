"use client";

import { useParams, useRouter } from "next/navigation";
import { useWager } from "@/hooks/use-wager";
import { useContractWrite } from "@/hooks/use-contract-write";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { appealSchema, type AppealFormData } from "@/lib/wager/validation";
import { appealResolution } from "@/lib/genlayer/contract";
import { generateId } from "@/lib/ui/hashes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TxHashLink } from "@/components/brand/tx-hash-link";
import { unixToRelative } from "@/lib/ui/time";
import Link from "next/link";
import { Loader2, AlertTriangle, Gavel, ArrowLeft } from "lucide-react";

const APPEAL_CATEGORIES = [
  { value: "new_evidence", label: "New Evidence", desc: "New evidence not available during original resolution" },
  { value: "wrong_source_read", label: "Wrong Source Read", desc: "A locked source was misread or misinterpreted" },
  { value: "deadline_misread", label: "Deadline Misread", desc: "The deadline was incorrectly interpreted" },
  { value: "fraudulent_evidence", label: "Fraudulent Evidence", desc: "A finding contains fabricated or misleading evidence" },
  { value: "condition_misinterpreted", label: "Condition Misinterpreted", desc: "The win/loss condition was misunderstood" },
];

export default function AppealPage() {
  const params = useParams();
  const router = useRouter();
  const betId = params.betId as string;
  const { data, loading, error: loadError } = useWager(betId);
  const { write, txHash, error: writeError, isPending } = useContractWrite();

  const form = useForm<AppealFormData>({
    resolver: zodResolver(appealSchema),
    defaultValues: {
      appeal_id: generateId(),
      appeal_category: "new_evidence",
      appeal_reason: "",
      finding_id: "",
      evidence_url: "",
    },
  });
  const selectedAppealCategory = useWatch({
    control: form.control,
    name: "appeal_category",
  });

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-p2p-text-secondary" />
      </div>
    );
  }

  if (loadError || !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <AlertTriangle className="h-8 w-8 text-p2p-red" />
        <p className="text-sm text-p2p-text-secondary">{loadError || "Wager not found."}</p>
      </div>
    );
  }

  const { wager, resolution, findings } = data;
  const canAppeal = wager.state === "RESOLVED" && data.position?.is_participant;

  const appealWindowEnd = resolution
    ? Number(resolution.resolved_at_unix) + Number(wager.appeal_window_seconds)
    : 0;

  const onSubmit = form.handleSubmit(async (formData) => {
    const hash = await write(
      () =>
        appealResolution({
          wager_id: betId,
          appeal_id: formData.appeal_id,
          appeal_category: formData.appeal_category,
          appeal_reason: formData.appeal_reason,
          finding_id: formData.finding_id || "",
          evidence_url: formData.evidence_url || "",
        }),
      betId,
      "appeal_resolution"
    );

    if (hash) {
      setTimeout(() => router.push(`/app/bets/${betId}`), 2000);
    }
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href={`/app/bets/${betId}`}
        className="inline-flex items-center gap-1 text-xs text-p2p-text-secondary hover:text-p2p-blue"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to Wager
      </Link>

      <div className="mt-4">
        <h1 className="font-display text-2xl font-bold">Appeal Resolution</h1>
        <p className="mt-1 text-sm text-p2p-text-secondary">
          Appeals require evidence. Disagreement alone is not enough.
        </p>
      </div>

      {/* Original resolution summary */}
      {resolution && (
        <div className="mt-6 rounded-panel border border-p2p-violet/30 bg-p2p-violet/5 p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-p2p-violet">
            Original Resolution
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-p2p-text-secondary">Outcome:</span>{" "}
              <span className="font-semibold">{resolution.outcome}</span>
            </div>
            <div>
              <span className="text-p2p-text-secondary">Winner:</span>{" "}
              <span className="font-semibold">{resolution.winner}</span>
            </div>
            <div>
              <span className="text-p2p-text-secondary">Confidence:</span>{" "}
              {resolution.confidence}
            </div>
            <div>
              <span className="text-p2p-text-secondary">Source Alignment:</span>{" "}
              {resolution.source_alignment}
            </div>
          </div>
          <p className="mt-2 text-xs text-p2p-text-secondary">{resolution.reason}</p>
          <div className="mt-2 text-[10px] text-p2p-gold">
            Appeal window: {unixToRelative(String(appealWindowEnd))} remaining
          </div>
        </div>
      )}

      {!canAppeal ? (
        <div className="mt-6 rounded-panel border border-p2p-border bg-p2p-surface p-6 text-center">
          <AlertTriangle className="mx-auto h-6 w-6 text-p2p-gold" />
          <p className="mt-2 text-sm text-p2p-text-secondary">
            {wager.state !== "RESOLVED"
              ? "This wager is not in RESOLVED state."
              : "Only wager participants can file an appeal."}
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-5">
          {/* Category */}
          <div>
            <Label className="text-p2p-text-secondary">Appeal Category</Label>
            <div className="mt-2 space-y-2">
              {APPEAL_CATEGORIES.map((cat) => (
                <label
                  key={cat.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-card border p-3 transition ${
                    selectedAppealCategory === cat.value
                      ? "border-p2p-blue bg-p2p-blue/5"
                      : "border-p2p-border bg-p2p-surface hover:border-p2p-text-secondary"
                  }`}
                >
                  <input
                    type="radio"
                    value={cat.value}
                    {...form.register("appeal_category")}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="text-sm font-medium">{cat.label}</div>
                    <div className="text-xs text-p2p-text-secondary">{cat.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <Label className="text-p2p-text-secondary">Appeal Reason</Label>
            <Textarea
              {...form.register("appeal_reason")}
              placeholder="Explain specifically why the original resolution is incorrect..."
              rows={4}
              className="mt-1 border-p2p-border bg-p2p-surface text-sm"
            />
            {form.formState.errors.appeal_reason && (
              <p className="mt-1 text-xs text-p2p-red">
                {form.formState.errors.appeal_reason.message}
              </p>
            )}
          </div>

          {/* Referenced finding */}
          <div>
            <Label className="text-p2p-text-secondary">Referenced Finding (optional)</Label>
            <select
              {...form.register("finding_id")}
              className="mt-1 w-full rounded-md border border-p2p-border bg-p2p-surface px-3 py-2 text-sm text-p2p-text-primary"
            >
              <option value="">None</option>
              {findings.map((f) => (
                <option key={f.finding_id} value={f.finding_id}>
                  {f.finding_id} — {f.finding.slice(0, 60)}...
                </option>
              ))}
            </select>
          </div>

          {/* New evidence URL */}
          <div>
            <Label className="text-p2p-text-secondary">New Evidence URL (optional)</Label>
            <Input
              {...form.register("evidence_url")}
              placeholder="https://..."
              className="mt-1 border-p2p-border bg-p2p-surface text-sm"
            />
          </div>

          {/* Results */}
          {txHash && (
            <div className="rounded-card border border-p2p-green/30 bg-p2p-green/5 p-4">
              <div className="text-sm font-semibold text-p2p-green">Appeal Submitted</div>
              <TxHashLink hash={txHash} />
              <p className="mt-1 text-xs text-p2p-text-secondary">
                Redirecting to wager detail...
              </p>
            </div>
          )}

          {writeError && (
            <div className="rounded-card border border-p2p-red/30 bg-p2p-red/5 p-4 text-xs text-p2p-red">
              {writeError}
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending || !!txHash}
            className="w-full gap-2 bg-p2p-gold text-p2p-bg hover:bg-p2p-gold/90"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting Appeal...
              </>
            ) : (
              <>
                <Gavel className="h-4 w-4" />
                Appeal With Evidence
              </>
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
