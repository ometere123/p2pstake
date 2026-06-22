"use client";

import { useState } from "react";
import { PactBuilder } from "@/components/forms/pact-builder";
import { DEMO_TEMPLATES, type WagerTemplate } from "@/lib/wager/templates";
import { FileCheck } from "lucide-react";

export default function CreatePage() {
  const [selectedTemplate, setSelectedTemplate] = useState<WagerTemplate | null>(null);

  return (
    <div className="px-4 py-8">
      <div className="mx-auto max-w-3xl mb-6">
        <h1 className="font-display text-2xl font-bold">The Pact Builder</h1>
        <p className="mt-1 text-sm text-p2p-text-secondary">
          Create a source-locked wager in 6 steps. Lock the proof before the stake.
        </p>
      </div>

      {!selectedTemplate && (
        <div className="mx-auto max-w-3xl mb-8">
          <h2 className="text-sm font-semibold text-p2p-text-secondary uppercase tracking-wider">
            Quick Start: Use a Template
          </h2>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {DEMO_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t)}
                className="rounded-card border border-p2p-border bg-p2p-panel p-4 text-left transition hover:border-p2p-blue/40"
              >
                <div className="flex items-center gap-2">
                  <FileCheck className="h-4 w-4 text-p2p-blue" />
                  <span className="text-sm font-semibold text-p2p-text-primary">
                    {t.title}
                  </span>
                </div>
                <p className="mt-2 text-xs text-p2p-text-secondary line-clamp-2">
                  {t.win_condition}
                </p>
                <div className="mt-2 text-[10px] text-p2p-blue">
                  {t.sources.length} source{t.sources.length > 1 ? "s" : ""} pre-configured
                </div>
              </button>
            ))}
          </div>
          <div className="mt-3 text-center">
            <button
              onClick={() => setSelectedTemplate(null)}
              className="text-xs text-p2p-text-secondary hover:text-p2p-text-primary"
            >
              or start from scratch below ↓
            </button>
          </div>
        </div>
      )}

      <PactBuilder template={selectedTemplate} />
    </div>
  );
}
