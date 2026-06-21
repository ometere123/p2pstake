"use client";

import { useFormContext } from "react-hook-form";
import type { CreateWagerFormData } from "@/lib/wager/validation";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Props {
  onNext: () => void;
  onPrev: () => void;
}

export function ProofRulesStep({ onNext, onPrev }: Props) {
  const { register, formState: { errors }, trigger } = useFormContext<CreateWagerFormData>();

  const handleNext = async () => {
    const valid = await trigger(["accepted_proof", "excluded_proof"]);
    if (valid) onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold">Step 5: Proof Rules</h2>
        <p className="mt-1 text-sm text-p2p-text-secondary">
          What counts as proof? What doesn&apos;t? These rules are locked before funding.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-p2p-text-secondary">Accepted Proof</Label>
          <Textarea
            {...register("accepted_proof")}
            placeholder="The public URL must load before the deadline and display the agreed hero section."
            rows={3}
            className="mt-1 border-p2p-border bg-p2p-surface text-sm"
          />
          {errors.accepted_proof && (
            <p className="mt-1 text-xs text-p2p-red">{errors.accepted_proof.message}</p>
          )}
        </div>

        <div>
          <Label className="text-p2p-text-secondary">Excluded Proof</Label>
          <Textarea
            {...register("excluded_proof")}
            placeholder="Figma files, private preview links, local screenshots, and verbal claims do not count."
            rows={3}
            className="mt-1 border-p2p-border bg-p2p-surface text-sm"
          />
          {errors.excluded_proof && (
            <p className="mt-1 text-xs text-p2p-red">{errors.excluded_proof.message}</p>
          )}
        </div>

        {/* Edge case rules — gives P2PStake structured term coverage */}
        <div className="border-t border-p2p-border pt-4">
          <h3 className="text-sm font-semibold text-p2p-text-primary">Edge Case Rules</h3>
          <p className="mt-1 text-xs text-p2p-text-secondary">
            Define how conflicts, cancellations, and postponements are handled. These are locked into the pact.
          </p>
        </div>

        <div>
          <Label className="text-p2p-text-secondary">Conflict Rule (optional)</Label>
          <Textarea
            {...register("conflict_rule")}
            placeholder="If sources conflict, the primary source takes precedence unless the fallback has stronger timestamp evidence."
            rows={2}
            className="mt-1 border-p2p-border bg-p2p-surface text-sm"
          />
        </div>

        <div>
          <Label className="text-p2p-text-secondary">Cancellation Rule (optional)</Label>
          <Textarea
            {...register("cancellation_rule")}
            placeholder="If the event is cancelled before the deadline, both sides receive a refund."
            rows={2}
            className="mt-1 border-p2p-border bg-p2p-surface text-sm"
          />
        </div>

        <div>
          <Label className="text-p2p-text-secondary">Postponement Rule (optional)</Label>
          <Textarea
            {...register("postponement_rule")}
            placeholder="If the event is postponed, the deadline extends by the same duration. If postponed indefinitely, refund both sides."
            rows={2}
            className="mt-1 border-p2p-border bg-p2p-surface text-sm"
          />
        </div>

        <div>
          <Label className="text-p2p-text-secondary">Resolution Question (optional)</Label>
          <Textarea
            {...register("resolution_question")}
            placeholder="Auto-generated if left blank."
            rows={2}
            className="mt-1 border-p2p-border bg-p2p-surface text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-p2p-text-secondary">Evidence Window (hours)</Label>
            <Input
              {...register("evidence_window_hours")}
              type="number"
              min="1"
              placeholder="24"
              className="mt-1 border-p2p-border bg-p2p-surface text-sm"
            />
          </div>
          <div>
            <Label className="text-xs text-p2p-text-secondary">Appeal Window (hours)</Label>
            <Input
              {...register("appeal_window_hours")}
              type="number"
              min="1"
              placeholder="12"
              className="mt-1 border-p2p-border bg-p2p-surface text-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} className="border-p2p-border text-p2p-text-secondary">
          Back
        </Button>
        <Button onClick={handleNext} className="bg-p2p-blue text-white hover:bg-p2p-blue/90">
          Next: Review & Seal
        </Button>
      </div>
    </div>
  );
}
