"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle } from "lucide-react";

const STORAGE_KEY = "p2pstake_responsible_use_acknowledged";

const BLOCKED_PATTERNS = [
  /\b(kill|murder|death|die|suicide|self.?harm)\b/i,
  /\b(violence|assault|attack|fight|weapon)\b/i,
  /\b(terrorism|terrorist|bomb|explos)\b/i,
  /\b(harassment|stalk|bully|dox|doxx)\b/i,
  /\b(child|minor|underage)\b/i,
  /\b(illegal.?drug|narcotic)\b/i,
  /\b(insider.?trad|market.?manipulat)\b/i,
];

export function checkBlockedCategory(text: string): string | null {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(text)) {
      return "This wager may involve a blocked category. P2PStake does not allow wagers involving violence, harm, harassment, illegal activity, or manipulation.";
    }
  }
  return null;
}

export function ResponsibleUseGate({ children }: { children: React.ReactNode }) {
  const [acknowledged, setAcknowledged] = useState<boolean | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  if (acknowledged === null) return null;

  if (acknowledged) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-p2p-bg/95 backdrop-blur-sm">
      <div className="mx-4 max-w-lg rounded-panel border border-p2p-border bg-p2p-panel p-8">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-p2p-blue" />
          <h2 className="font-display text-xl font-bold">Before You Continue</h2>
        </div>

        <div className="mt-6 space-y-4 text-sm text-p2p-text-secondary">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-p2p-gold" />
            <p>
              <strong className="text-p2p-text-primary">Testnet only.</strong> P2PStake
              uses GenLayer StudioNet with test GEN tokens. No real money is involved.
              This is not a licensed gambling or betting service.
            </p>
          </div>

          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-p2p-gold" />
            <p>
              <strong className="text-p2p-text-primary">Age requirement.</strong> You
              must be 18 years or older to use this application, even on testnet.
            </p>
          </div>

          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-p2p-gold" />
            <p>
              <strong className="text-p2p-text-primary">Blocked categories.</strong> Wagers
              involving violence, self-harm, harassment, illegal activity, minors,
              insider trading, market manipulation, or exploitative content are
              prohibited and will be flagged.
            </p>
          </div>

          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-p2p-red" />
            <p>
              <strong className="text-p2p-text-primary">Not financial advice.</strong> P2PStake
              is a technology demo. Do not treat outcomes as legal rulings.
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-card border border-p2p-border bg-p2p-surface p-4 text-xs text-p2p-text-secondary">
          P2PStake is for clear, evidence-resolvable wagers between consenting
          adults on testnet. Harmful, illegal, exploitative, or unverifiable bets
          are not allowed.
        </div>

        <Button
          onClick={() => {
            localStorage.setItem(STORAGE_KEY, "true");
            setAcknowledged(true);
          }}
          className="mt-6 w-full bg-p2p-blue text-white hover:bg-p2p-blue/90"
        >
          I understand: I am 18+ and this is testnet only
        </Button>
      </div>
    </div>
  );
}
