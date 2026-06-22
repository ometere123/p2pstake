"use client";

import { DEMO_TEMPLATES } from "@/lib/wager/templates";
import { Lock, FileCheck, Scale, Gavel, Shield } from "lucide-react";

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold">Demo Guide</h1>
      <p className="mt-1 text-sm text-p2p-text-secondary">
        Walk through P2PStake&apos;s source-locked evidence flow.
      </p>

      {/* Flow */}
      <div className="mt-8 rounded-panel border border-p2p-border bg-p2p-panel p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-p2p-text-secondary">
          Full Lifecycle
        </h2>
        <div className="mt-4 space-y-3">
          {[
            { icon: FileCheck, step: "1", label: "Create wager with locked sources" },
            { icon: Shield, step: "2", label: "Opponent accepts; sources lock" },
            { icon: Lock, step: "3", label: "Both sides fund; stake locks" },
            { icon: FileCheck, step: "4", label: "Submit source-tied findings" },
            { icon: Scale, step: "5", label: "Request GenLayer resolution" },
            { icon: Gavel, step: "6", label: "Appeal (optional) → Finalize → Claim" },
          ].map(({ icon: Icon, step, label }) => (
            <div key={step} className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-p2p-surface font-mono text-xs text-p2p-blue">
                {step}
              </span>
              <Icon className="h-4 w-4 text-p2p-text-secondary" />
              <span className="text-sm text-p2p-text-primary">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Templates */}
      <div className="mt-8">
        <h2 className="font-display text-lg font-semibold">Demo Templates</h2>
        <div className="mt-4 space-y-4">
          {DEMO_TEMPLATES.map((t) => (
            <div
              key={t.id}
              className="rounded-panel border border-p2p-border bg-p2p-panel p-5"
            >
              <h3 className="font-display font-semibold">{t.title}</h3>
              <div className="mt-3 space-y-2 text-xs text-p2p-text-secondary">
                <div>
                  <span className="text-p2p-green">Win:</span>{" "}
                  {t.win_condition}
                </div>
                <div>
                  <span className="text-p2p-red">Loss:</span>{" "}
                  {t.loss_condition}
                </div>
                <div>
                  <span className="text-p2p-blue">Accepted proof:</span>{" "}
                  {t.accepted_proof}
                </div>
                <div>
                  <span className="text-p2p-gold">Excluded proof:</span>{" "}
                  {t.excluded_proof}
                </div>
                <div className="mt-2 border-t border-p2p-border pt-2">
                  <span className="text-p2p-text-primary">Sources:</span>
                  {t.sources.map((s) => (
                    <div key={s.source_id} className="ml-4 mt-1">
                      <span className={s.is_fallback ? "text-p2p-text-secondary" : "text-p2p-blue"}>
                        {s.is_fallback ? "Fallback" : "Primary"}:
                      </span>{" "}
                      {s.label}: {s.url}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key rules */}
      <div className="mt-8 rounded-panel border border-p2p-border bg-p2p-panel p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-p2p-text-secondary">
          Key Rules
        </h2>
        <ul className="mt-3 space-y-2 text-sm text-p2p-text-secondary">
          <li>No locked source, no serious bet.</li>
          <li>Every finding must point to a locked source.</li>
          <li>GenLayer settles against the proof path, not against vibes.</li>
          <li>
            Timestamps submitted in findings are treated as evidence, not
            automatic truth.
          </li>
          <li>Appeals require evidence. Disagreement alone is not enough.</li>
        </ul>
      </div>
    </div>
  );
}
