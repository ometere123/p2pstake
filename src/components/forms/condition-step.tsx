"use client";

import { useFormContext } from "react-hook-form";
import type { CreateWagerFormData } from "@/lib/wager/validation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { checkBlockedCategory } from "@/components/guards/responsible-use-gate";
import { AlertTriangle } from "lucide-react";

interface Props {
  onNext: () => void;
  onPrev: () => void;
}

export function ConditionStep({ onNext, onPrev }: Props) {
  const { register, formState: { errors }, trigger, watch } = useFormContext<CreateWagerFormData>();
  const title = watch("title") || "";
  const winCond = watch("win_condition") || "";
  const lossCond = watch("loss_condition") || "";
  const blockedWarning = checkBlockedCategory(`${title} ${winCond} ${lossCond}`);

  const handleNext = async () => {
    if (blockedWarning) return;
    const valid = await trigger([
      "title",
      "win_condition",
      "loss_condition",
      "deadline_date",
      "deadline_time",
    ]);
    if (valid) onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold">Step 3: Condition</h2>
        <p className="mt-1 text-sm text-p2p-text-secondary">
          Define the plain-English bet. Be specific: this is what GenLayer will judge.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-p2p-text-secondary">Bet Title</Label>
          <Input
            {...register("title")}
            placeholder="Landing page live before Sunday 9pm"
            className="mt-1 border-p2p-border bg-p2p-surface text-sm"
          />
          {errors.title && (
            <p className="mt-1 text-xs text-p2p-red">{errors.title.message}</p>
          )}
        </div>

        <div>
          <Label className="text-p2p-text-secondary">Win Condition</Label>
          <Textarea
            {...register("win_condition")}
            placeholder="The public URL loads the agreed landing page before the deadline."
            rows={3}
            className="mt-1 border-p2p-border bg-p2p-surface text-sm"
          />
          {errors.win_condition && (
            <p className="mt-1 text-xs text-p2p-red">{errors.win_condition.message}</p>
          )}
        </div>

        <div>
          <Label className="text-p2p-text-secondary">Loss Condition</Label>
          <Textarea
            {...register("loss_condition")}
            placeholder="The page is not live or does not display the agreed content before the deadline."
            rows={3}
            className="mt-1 border-p2p-border bg-p2p-surface text-sm"
          />
          {errors.loss_condition && (
            <p className="mt-1 text-xs text-p2p-red">{errors.loss_condition.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-p2p-text-secondary">Deadline Date</Label>
            <Input
              {...register("deadline_date")}
              type="date"
              className="mt-1 border-p2p-border bg-p2p-surface text-sm"
            />
            {errors.deadline_date && (
              <p className="mt-1 text-xs text-p2p-red">{errors.deadline_date.message}</p>
            )}
          </div>
          <div>
            <Label className="text-p2p-text-secondary">Deadline Time</Label>
            <Input
              {...register("deadline_time")}
              type="time"
              className="mt-1 border-p2p-border bg-p2p-surface text-sm"
            />
            {errors.deadline_time && (
              <p className="mt-1 text-xs text-p2p-red">{errors.deadline_time.message}</p>
            )}
          </div>
        </div>
        <p className="text-xs text-p2p-text-secondary">
          Displayed in your local timezone. The contract stores the deadline as unix timestamp.
        </p>
      </div>

      {blockedWarning && (
        <div className="flex items-start gap-2 rounded-card border border-p2p-red/30 bg-p2p-red/5 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-p2p-red" />
          <p className="text-xs text-p2p-red">{blockedWarning}</p>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} className="border-p2p-border text-p2p-text-secondary">
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!!blockedWarning}
          className="bg-p2p-blue text-white hover:bg-p2p-blue/90 disabled:opacity-50"
        >
          Next: Proof Sources
        </Button>
      </div>
    </div>
  );
}
