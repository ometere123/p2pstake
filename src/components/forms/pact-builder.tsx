"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createWagerSchema, type CreateWagerFormData } from "@/lib/wager/validation";
import { PartiesStep } from "./parties-step";
import { StakeStep } from "./stake-step";
import { ConditionStep } from "./condition-step";
import { ProofSourcesStep } from "./proof-sources-step";
import { ProofRulesStep } from "./proof-rules-step";
import { ReviewAndSealStep } from "./review-and-seal-step";
import { generateId } from "@/lib/ui/hashes";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Parties", num: 1 },
  { label: "Stake", num: 2 },
  { label: "Condition", num: 3 },
  { label: "Proof Sources", num: 4 },
  { label: "Proof Rules", num: 5 },
  { label: "Review & Seal", num: 6 },
];

export function PactBuilder() {
  const [step, setStep] = useState(1);

  const methods = useForm<CreateWagerFormData>({
    resolver: zodResolver(createWagerSchema),
    defaultValues: {
      wager_id: generateId(),
      opponent: "",
      title: "",
      stake_amount: "",
      deadline_date: "",
      deadline_time: "",
      win_condition: "",
      loss_condition: "",
      accepted_proof: "",
      excluded_proof: "",
      resolution_question: "",
      appeal_standard: "",
      conflict_rule: "",
      cancellation_rule: "",
      postponement_rule: "",
      evidence_window_hours: "24",
      appeal_window_hours: "12",
      sources: [],
    },
    mode: "onBlur",
  });

  const next = () => setStep((s) => Math.min(s + 1, 6));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <FormProvider {...methods}>
      <div className="mx-auto max-w-3xl">
        {/* Stepper */}
        <div className="mb-8 flex items-center justify-between">
          {STEPS.map((s) => (
            <button
              key={s.num}
              onClick={() => s.num < step && setStep(s.num)}
              className={cn(
                "flex items-center gap-2 text-xs transition",
                s.num === step
                  ? "text-p2p-blue"
                  : s.num < step
                  ? "cursor-pointer text-p2p-green"
                  : "text-p2p-text-secondary"
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-semibold",
                  s.num === step
                    ? "border-p2p-blue bg-p2p-blue/10 text-p2p-blue"
                    : s.num < step
                    ? "border-p2p-green bg-p2p-green/10 text-p2p-green"
                    : "border-p2p-border text-p2p-text-secondary"
                )}
              >
                {s.num}
              </span>
              <span className="hidden md:inline">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Step content */}
        <div className="rounded-panel border border-p2p-border bg-p2p-panel p-6">
          {step === 1 && <PartiesStep onNext={next} />}
          {step === 2 && <StakeStep onNext={next} onPrev={prev} />}
          {step === 3 && <ConditionStep onNext={next} onPrev={prev} />}
          {step === 4 && <ProofSourcesStep onNext={next} onPrev={prev} />}
          {step === 5 && <ProofRulesStep onNext={next} onPrev={prev} />}
          {step === 6 && <ReviewAndSealStep onPrev={prev} />}
        </div>
      </div>
    </FormProvider>
  );
}
