"use client";

import type { WagerDetail } from "@/lib/genlayer/types";
import { SourceLane } from "./source-lane";
import { FindingSubmitModal } from "./finding-submit-modal";
import { VerdictCard } from "@/components/settlement/verdict-card";
import { EMPTY_STATE_COPY } from "@/lib/wager/copy";
import { FileSearch } from "lucide-react";

interface Props {
  data: WagerDetail;
  onFindingSubmitted: () => void;
}

export function EvidenceTheater({ data, onFindingSubmitted }: Props) {
  const { sources, findings, wager } = data;
  const canSubmit =
    data.position?.is_participant &&
    ["LOCKED", "EVIDENCE_OPEN"].includes(wager.state);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Evidence Theater</h2>
        {canSubmit && (
          <FindingSubmitModal
            wagerId={sources[0]?.wager_id || ""}
            sources={sources}
            onSubmitted={onFindingSubmitted}
          />
        )}
      </div>

      {sources.length === 0 ? (
        <div className="rounded-card border border-dashed border-p2p-border bg-p2p-surface p-8 text-center">
          <FileSearch className="mx-auto h-8 w-8 text-p2p-text-secondary" />
          <p className="mt-2 text-sm text-p2p-text-secondary">{EMPTY_STATE_COPY.no_sources}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sources.map((source) => {
            const sourceFindings = findings.filter(
              (f) => f.source_id === source.source_id
            );
            return (
              <SourceLane
                key={source.source_id}
                source={source}
                findings={sourceFindings}
                creatorAddress={wager.creator}
              />
            );
          })}
        </div>
      )}

      {/* Verdict */}
      {data.resolution && (
        <VerdictCard resolution={data.resolution} />
      )}

      {findings.length === 0 && sources.length > 0 && (
        <div className="rounded-card border border-dashed border-p2p-border bg-p2p-surface p-6 text-center">
          <p className="text-sm text-p2p-text-secondary">
            {EMPTY_STATE_COPY.no_findings}
          </p>
        </div>
      )}
    </div>
  );
}
