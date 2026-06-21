"use client";

import { useFormContext, useFieldArray } from "react-hook-form";
import type { CreateWagerFormData } from "@/lib/wager/validation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { generateId } from "@/lib/ui/hashes";
import { Plus, Trash2, Lock } from "lucide-react";

const SOURCE_TYPES = [
  { value: "public_url", label: "Public URL" },
  { value: "github", label: "GitHub" },
  { value: "onchain_tx", label: "On-chain Transaction" },
  { value: "social_post", label: "Social Post" },
  { value: "document", label: "Document" },
  { value: "manual_witness", label: "Manual Witness" },
];

interface Props {
  onNext: () => void;
  onPrev: () => void;
}

export function ProofSourcesStep({ onNext, onPrev }: Props) {
  const { register, control, formState: { errors }, trigger, watch } =
    useFormContext<CreateWagerFormData>();
  const { fields, append, remove } = useFieldArray({ control, name: "sources" });
  const sources = watch("sources");

  const hasPrimary = sources?.some((s) => !s.is_fallback) ?? false;

  const addSource = (isFallback: boolean) => {
    if (fields.length >= 5) return;
    append({
      source_id: generateId(),
      source_type: "public_url",
      label: "",
      url: "",
      description: "",
      required: true,
      is_fallback: isFallback,
    });
  };

  const handleNext = async () => {
    const valid = await trigger("sources");
    if (!valid) return;
    if (!hasPrimary) return;
    onNext();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold">Step 4: Proof Sources</h2>
        <p className="mt-1 text-sm text-p2p-text-secondary">
          Lock the evidence sources before funding. At least one primary source is required.
        </p>
        <p className="mt-1 text-xs text-p2p-gold">
          <Lock className="mr-1 inline h-3 w-3" />
          No locked source, no serious bet.
        </p>
      </div>

      {fields.length === 0 && (
        <div className="rounded-card border border-dashed border-p2p-border bg-p2p-surface p-6 text-center">
          <p className="text-sm text-p2p-text-secondary">
            No sources added yet. Add at least one primary source to continue.
          </p>
        </div>
      )}

      {fields.map((field, index) => {
        const isFallback = sources?.[index]?.is_fallback ?? false;
        return (
          <div
            key={field.id}
            className="rounded-card border border-p2p-border bg-p2p-surface p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${
                  isFallback ? "text-p2p-text-secondary" : "text-p2p-blue"
                }`}
              >
                {isFallback ? "Fallback Source" : "Primary Source"}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                className="h-7 w-7 p-0 text-p2p-red hover:text-p2p-red/80"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-p2p-text-secondary">Label</Label>
                <Input
                  {...register(`sources.${index}.label`)}
                  placeholder="Vercel Deployment URL"
                  className="mt-1 border-p2p-border bg-p2p-bg text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-p2p-text-secondary">Source Type</Label>
                <select
                  {...register(`sources.${index}.source_type`)}
                  className="mt-1 w-full rounded-md border border-p2p-border bg-p2p-bg px-3 py-2 text-sm text-p2p-text-primary"
                >
                  {SOURCE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label className="text-xs text-p2p-text-secondary">URL / Reference</Label>
              <Input
                {...register(`sources.${index}.url`)}
                placeholder="https://..."
                className="mt-1 border-p2p-border bg-p2p-bg text-sm"
              />
            </div>

            <div>
              <Label className="text-xs text-p2p-text-secondary">Description</Label>
              <Textarea
                {...register(`sources.${index}.description`)}
                placeholder="What does this source prove?"
                rows={2}
                className="mt-1 border-p2p-border bg-p2p-bg text-sm"
              />
            </div>

            <input type="hidden" {...register(`sources.${index}.source_id`)} />
            <input type="hidden" {...register(`sources.${index}.required`)} />
            <input type="hidden" {...register(`sources.${index}.is_fallback`)} />
          </div>
        );
      })}

      {errors.sources && typeof errors.sources.message === "string" && (
        <p className="text-xs text-p2p-red">{errors.sources.message}</p>
      )}

      {!hasPrimary && fields.length > 0 && (
        <p className="text-xs text-p2p-red">
          At least one primary source is required. All current sources are marked as fallback.
        </p>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addSource(false)}
          disabled={fields.length >= 5}
          className="gap-1 border-p2p-blue text-p2p-blue hover:bg-p2p-blue/10"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Primary Source
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addSource(true)}
          disabled={fields.length >= 5}
          className="gap-1 border-p2p-border text-p2p-text-secondary"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Fallback Source
        </Button>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} className="border-p2p-border text-p2p-text-secondary">
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!hasPrimary || fields.length === 0}
          className="bg-p2p-blue text-white hover:bg-p2p-blue/90 disabled:opacity-50"
        >
          Next: Proof Rules
        </Button>
      </div>
    </div>
  );
}
