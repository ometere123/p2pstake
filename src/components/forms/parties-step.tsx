"use client";

import { useFormContext } from "react-hook-form";
import type { CreateWagerFormData } from "@/lib/wager/validation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useWalletStore } from "@/stores/wallet-store";

interface Props {
  onNext: () => void;
}

export function PartiesStep({ onNext }: Props) {
  const { register, formState: { errors }, trigger } = useFormContext<CreateWagerFormData>();
  const address = useWalletStore((s) => s.address);

  const handleNext = async () => {
    const valid = await trigger("opponent");
    if (valid) onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold">Step 1: Parties</h2>
        <p className="mt-1 text-sm text-p2p-text-secondary">
          Define who is making this wager.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-p2p-text-secondary">Creator (you)</Label>
          <Input
            value={address || "Not connected"}
            disabled
            className="mt-1 border-p2p-border bg-p2p-surface font-mono text-sm"
          />
        </div>

        <div>
          <Label className="text-p2p-text-secondary">Opponent Wallet Address</Label>
          <Input
            {...register("opponent")}
            placeholder="0x..."
            className="mt-1 border-p2p-border bg-p2p-surface font-mono text-sm"
          />
          {errors.opponent && (
            <p className="mt-1 text-xs text-p2p-red">{errors.opponent.message}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNext} className="bg-p2p-blue text-white hover:bg-p2p-blue/90">
          Next: Stake
        </Button>
      </div>
    </div>
  );
}
