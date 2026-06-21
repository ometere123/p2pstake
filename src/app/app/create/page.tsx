"use client";

import { PactBuilder } from "@/components/forms/pact-builder";

export default function CreatePage() {
  return (
    <div className="px-4 py-8">
      <div className="mx-auto max-w-3xl mb-6">
        <h1 className="font-display text-2xl font-bold">The Pact Builder</h1>
        <p className="mt-1 text-sm text-p2p-text-secondary">
          Create a source-locked wager in 6 steps. Lock the proof before the stake.
        </p>
      </div>
      <PactBuilder />
    </div>
  );
}
