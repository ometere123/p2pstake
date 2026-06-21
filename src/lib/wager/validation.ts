import { z } from "zod/v4";

const genlayerAddressSchema = z
  .string()
  .regex(
    /^0x(?:[a-fA-F0-9]{40}|[a-fA-F0-9]{64})$/,
    "Enter a valid 0x wallet address"
  );

export const sourceSchema = z.object({
  source_id: z.string().min(1, "Source ID is required"),
  source_type: z.enum([
    "public_url",
    "github",
    "onchain_tx",
    "social_post",
    "document",
    "manual_witness",
  ]),
  label: z.string().min(1, "Label is required"),
  url: z.string(),
  description: z.string().min(1, "Description is required"),
  required: z.boolean(),
  is_fallback: z.boolean(),
});

export const createWagerSchema = z.object({
  wager_id: z.string().min(1),
  opponent: genlayerAddressSchema,
  title: z.string().min(1, "Title is required"),
  stake_amount: z
    .string()
    .min(1, "Stake amount is required")
    .refine((value) => Number(value) > 0, "Stake amount must be greater than 0"),
  deadline_date: z.string().min(1, "Deadline date is required"),
  deadline_time: z.string().min(1, "Deadline time is required"),
  win_condition: z.string().min(1, "Win condition is required"),
  loss_condition: z.string().min(1, "Loss condition is required"),
  accepted_proof: z.string().min(1, "Accepted proof rules are required"),
  excluded_proof: z.string().min(1, "Excluded proof rules are required"),
  resolution_question: z.string().optional(),
  appeal_standard: z.string().optional(),
  conflict_rule: z.string().optional(),
  cancellation_rule: z.string().optional(),
  postponement_rule: z.string().optional(),
  evidence_window_hours: z.string().optional(),
  appeal_window_hours: z.string().optional(),
  sources: z
    .array(sourceSchema)
    .min(1, "At least one evidence source is required")
    .max(5, "Maximum 5 sources"),
}).superRefine((data, ctx) => {
  const deadlineMs = new Date(`${data.deadline_date}T${data.deadline_time}`).getTime();

  if (Number.isNaN(deadlineMs) || deadlineMs <= Date.now()) {
    ctx.addIssue({
      code: "custom",
      path: ["deadline_date"],
      message: "Deadline must be in the future",
    });
  }

  if (!data.sources.some((source) => !source.is_fallback)) {
    ctx.addIssue({
      code: "custom",
      path: ["sources"],
      message: "At least one primary evidence source is required",
    });
  }

  data.sources.forEach((source, index) => {
    if (source.source_type !== "manual_witness" && source.url.trim() === "") {
      ctx.addIssue({
        code: "custom",
        path: ["sources", index, "url"],
        message: "URL is required for this source type",
      });
    }
  });
});

export const findingSchema = z.object({
  finding_id: z.string().min(1),
  source_id: z.string().min(1, "Select a locked source"),
  finding: z.string().min(1, "Finding text is required"),
  evidence_url: z.string(),
  supports_side: z.enum(["creator", "opponent", "refund", "invalid"]),
  captured_at_claim: z.string().optional(),
  confidence: z.enum(["high", "medium", "low"]),
});

export const appealSchema = z.object({
  appeal_id: z.string().min(1),
  appeal_category: z.enum([
    "new_evidence",
    "wrong_source_read",
    "deadline_misread",
    "fraudulent_evidence",
    "condition_misinterpreted",
  ]),
  appeal_reason: z.string().min(1, "Appeal reason is required"),
  finding_id: z.string().optional(),
  evidence_url: z.string().optional(),
});

export type CreateWagerFormData = z.infer<typeof createWagerSchema>;
export type FindingFormData = z.infer<typeof findingSchema>;
export type AppealFormData = z.infer<typeof appealSchema>;
