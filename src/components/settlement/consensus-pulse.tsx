"use client";

export function ConsensusPulse() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-p2p-violet/30 bg-p2p-violet/5 p-6">
      <div className="relative flex items-center justify-center">
        <div className="absolute h-12 w-12 animate-ping rounded-full bg-p2p-violet/20" />
        <div className="absolute h-8 w-8 animate-pulse rounded-full bg-p2p-violet/30" />
        <div className="relative h-4 w-4 rounded-full bg-p2p-violet" />
      </div>
      <div className="text-center">
        <div className="text-sm font-semibold text-p2p-violet">
          Consensus in Progress
        </div>
        <p className="mt-1 text-xs text-p2p-text-secondary">
          Validators are checking the locked terms and submitted source
          findings. This is not a popularity vote.
        </p>
      </div>
    </div>
  );
}
