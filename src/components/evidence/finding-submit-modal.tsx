"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { findingSchema, type FindingFormData } from "@/lib/wager/validation";
import type { EvidenceSource } from "@/lib/genlayer/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TxHashLink } from "@/components/brand/tx-hash-link";
import { useContractWrite } from "@/hooks/use-contract-write";
import { submitSourceFinding } from "@/lib/genlayer/contract";
import { generateId } from "@/lib/ui/hashes";
import { FileCheck, Loader2 } from "lucide-react";

interface Props {
  wagerId: string;
  sources: EvidenceSource[];
  onSubmitted: () => void;
}

export function FindingSubmitModal({ wagerId, sources, onSubmitted }: Props) {
  const [open, setOpen] = useState(false);
  const { write, txHash, error, isPending, reset } = useContractWrite();

  const lockedSources = sources.filter((s) => s.locked);

  const form = useForm<FindingFormData>({
    resolver: zodResolver(findingSchema),
    defaultValues: {
      finding_id: generateId(),
      source_id: "",
      finding: "",
      evidence_url: "",
      supports_side: "creator",
      captured_at_claim: "",
      confidence: "medium",
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    const hash = await write(
      () =>
        submitSourceFinding({
          wager_id: wagerId,
          finding_id: data.finding_id,
          source_id: data.source_id,
          finding: data.finding,
          evidence_url: data.evidence_url,
          supports_side: data.supports_side,
          captured_at_claim: data.captured_at_claim || "",
          confidence: data.confidence,
        }),
      wagerId,
      "submit_source_finding"
    );

    if (hash) {
      onSubmitted();
      setTimeout(() => {
        setOpen(false);
        form.reset({ ...form.formState.defaultValues, finding_id: generateId() } as FindingFormData);
        reset();
      }, 2000);
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" className="gap-1.5 bg-p2p-blue text-white hover:bg-p2p-blue/90">
            <FileCheck className="h-3.5 w-3.5" />
            Submit Source Finding
          </Button>
        }
      />
      <DialogContent className="border-p2p-border bg-p2p-panel text-p2p-text-primary sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Submit Source Finding</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-p2p-text-secondary">
          A finding is not just a claim. It must point to one of the sources both
          sides already accepted.
        </p>

        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          {/* Source select: locked sources only */}
          <div>
            <Label className="text-xs text-p2p-text-secondary">Locked Source</Label>
            <select
              {...form.register("source_id")}
              className="mt-1 w-full rounded-md border border-p2p-border bg-p2p-surface px-3 py-2 text-sm text-p2p-text-primary"
            >
              <option value="">Select a locked source...</option>
              {lockedSources.map((s) => (
                <option key={s.source_id} value={s.source_id}>
                  {s.is_fallback ? "[Fallback]" : "[Primary]"} {s.label}
                </option>
              ))}
            </select>
            {form.formState.errors.source_id && (
              <p className="mt-1 text-xs text-p2p-red">
                {form.formState.errors.source_id.message}
              </p>
            )}
          </div>

          {/* Finding */}
          <div>
            <Label className="text-xs text-p2p-text-secondary">Finding</Label>
            <Textarea
              {...form.register("finding")}
              placeholder="Describe what you found at this source..."
              rows={3}
              className="mt-1 border-p2p-border bg-p2p-surface text-sm"
            />
            {form.formState.errors.finding && (
              <p className="mt-1 text-xs text-p2p-red">
                {form.formState.errors.finding.message}
              </p>
            )}
          </div>

          {/* Evidence URL */}
          <div>
            <Label className="text-xs text-p2p-text-secondary">Evidence URL</Label>
            <Input
              {...form.register("evidence_url")}
              placeholder="https://..."
              className="mt-1 border-p2p-border bg-p2p-surface text-sm"
            />
          </div>

          {/* Supports side */}
          <div>
            <Label className="text-xs text-p2p-text-secondary">Supports Side</Label>
            <select
              {...form.register("supports_side")}
              className="mt-1 w-full rounded-md border border-p2p-border bg-p2p-surface px-3 py-2 text-sm text-p2p-text-primary"
            >
              <option value="creator">Creator</option>
              <option value="opponent">Opponent</option>
              <option value="refund">Refund</option>
              <option value="invalid">Invalid</option>
            </select>
          </div>

          {/* Confidence */}
          <div>
            <Label className="text-xs text-p2p-text-secondary">Confidence</Label>
            <select
              {...form.register("confidence")}
              className="mt-1 w-full rounded-md border border-p2p-border bg-p2p-surface px-3 py-2 text-sm text-p2p-text-primary"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Captured at claim */}
          <div>
            <Label className="text-xs text-p2p-text-secondary">
              Captured At (optional)
            </Label>
            <Input
              {...form.register("captured_at_claim")}
              placeholder="e.g. 2025-01-15 14:30 UTC"
              className="mt-1 border-p2p-border bg-p2p-surface text-sm"
            />
            <p className="mt-1 text-[10px] text-p2p-gold">
              This is treated as evidence, not automatic truth.
            </p>
          </div>

          {/* Result */}
          {txHash && (
            <div className="rounded-card border border-p2p-green/30 bg-p2p-green/5 p-3">
              <div className="text-xs font-semibold text-p2p-green">Finding Submitted</div>
              <TxHashLink hash={txHash} />
            </div>
          )}

          {error && (
            <div className="rounded-card border border-p2p-red/30 bg-p2p-red/5 p-3 text-xs text-p2p-red">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isPending || !!txHash}
            className="w-full gap-2 bg-p2p-blue text-white hover:bg-p2p-blue/90"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Source Finding"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
