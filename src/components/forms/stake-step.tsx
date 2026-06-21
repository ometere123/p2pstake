"use client";

import { useFormContext } from "react-hook-form";
import type { CreateWagerFormData } from "@/lib/wager/validation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Props {
  onNext: () => void;
  onPrev: () => void;
}

export function StakeStep({ onNext, onPrev }: Props) {
  const { register, formState: { errors }, trigger } = useFormContext<CreateWagerFormData>();

  const handleNext = async () => {
    const valid = await trigger("stake_amount");
    if (valid) onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold">Step 2: Stake</h2>
        <p className="mt-1 text-sm text-p2p-text-secondary">
          How much GEN each side will stake. Both sides stake the same amount.
        </p>
      </div>

      <div>
        <Label className="text-p2p-text-secondary">Stake Amount (GEN)</Label>
        <Input
          {...register("stake_amount")}
          type="number"
          step="0.001"
          min="0"
          placeholder="5"
          className="mt-1 border-p2p-border bg-p2p-surface text-sm"
        />
        {errors.stake_amount && (
          <p className="mt-1 text-xs text-p2p-red">{errors.stake_amount.message}</p>
        )}
        <p className="mt-1 text-xs text-p2p-text-secondary">
          Each side stakes this amount. Total pot = 2x this value. 1 GEN = 10¹⁸ wei.
        </p>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} className="border-p2p-border text-p2p-text-secondary">
          Back
        </Button>
        <Button onClick={handleNext} className="bg-p2p-blue text-white hover:bg-p2p-blue/90">
          Next: Condition
        </Button>
      </div>
    </div>
  );
}
