"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Shield, Lock, Scale, FileCheck, Gavel } from "lucide-react";

const STEPS = [
  {
    icon: FileCheck,
    title: "Any clear bet",
    desc: "Deployment deadlines, PR merges, tweet milestones, fitness goals — any plain-English condition.",
  },
  {
    icon: Lock,
    title: "Lock proof before stake",
    desc: "Define accepted sources, excluded proof, and evidence rules before any money moves.",
  },
  {
    icon: Shield,
    title: "Submit source findings",
    desc: "Every piece of evidence must reference a locked source. No vague claims.",
  },
  {
    icon: Scale,
    title: "GenLayer settles",
    desc: "Validators judge locked terms against source-tied findings. Not a popularity vote.",
  },
  {
    icon: Gavel,
    title: "Appeal with evidence",
    desc: "Disagree? Appeal with new evidence or proof of a specific error. Not just vibes.",
  },
];

const EXAMPLES = [
  "Landing page deployed before Sunday 9pm",
  "Pull request merged before demo day",
  "Tweet reaches 10K likes before Monday",
  "Gym 5 times this week — verified by app",
  "Bug still open tomorrow morning",
  "Payment received on-chain before Friday",
];

export default function LandingPage() {
  return (
    <AppShell>
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-24 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-p2p-blue)/8%,_transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-p2p-text-primary md:text-6xl">
            Lock the bet.{" "}
            <span className="text-p2p-blue">Lock the proof.</span>
            <br />
            Let GenLayer settle it.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-p2p-text-secondary">
            P2PStake lets two people stake GEN behind any clear plain-English
            condition. Every bet locks its evidence sources before funding, so
            settlement is based on proof, not vibes.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/app/create"
              className="rounded-full bg-p2p-blue px-8 py-3.5 font-display text-sm font-semibold text-white transition hover:bg-p2p-blue/90"
            >
              Create Source-Locked Bet
            </Link>
            <Link
              href="/app"
              className="rounded-full border border-p2p-border px-8 py-3.5 text-sm font-medium text-p2p-text-secondary transition hover:border-p2p-text-secondary hover:text-p2p-text-primary"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Mock bet card */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-2xl rounded-panel border border-p2p-border bg-p2p-panel p-6">
          <div className="flex items-center gap-2 text-xs text-p2p-text-secondary">
            <span className="h-1.5 w-1.5 rounded-full bg-p2p-violet" />
            DEMO WAGER
          </div>
          <h3 className="mt-3 font-display text-lg font-semibold">
            Landing page live before Sunday 9pm WAT
          </h3>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="rounded-card border border-p2p-border bg-p2p-surface p-3">
              <div className="text-[10px] uppercase tracking-wider text-p2p-text-secondary">
                Pact
              </div>
              <div className="mt-1 font-mono text-xs text-p2p-green">
                Sealed
              </div>
            </div>
            <div className="rounded-card border border-p2p-border bg-p2p-surface p-3">
              <div className="text-[10px] uppercase tracking-wider text-p2p-text-secondary">
                Sources
              </div>
              <div className="mt-1 font-mono text-xs text-p2p-blue">
                Locked
              </div>
            </div>
            <div className="rounded-card border border-p2p-border bg-p2p-surface p-3">
              <div className="text-[10px] uppercase tracking-wider text-p2p-text-secondary">
                Verdict
              </div>
              <div className="mt-1 font-mono text-xs text-p2p-gold">
                Pending
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-p2p-text-secondary">
              <Lock className="h-3 w-3 text-p2p-blue" />
              Primary: p2pstake.vercel.app
            </div>
            <div className="flex items-center gap-2 text-xs text-p2p-text-secondary">
              <Shield className="h-3 w-3 text-p2p-text-secondary" />
              Fallback: GitHub deployment URL
            </div>
            <div className="flex items-center gap-2 text-xs text-p2p-green">
              <FileCheck className="h-3 w-3" />
              Accepted: Public page live before deadline
            </div>
            <div className="flex items-center gap-2 text-xs text-p2p-red">
              <Gavel className="h-3 w-3" />
              Excluded: Local screenshots, Figma files
            </div>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="border-t border-p2p-border px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-display text-2xl font-bold">
            How P2PStake Works
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-5">
            {STEPS.map((step, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-p2p-surface">
                  <step.icon className="h-5 w-5 text-p2p-blue" />
                </div>
                <h3 className="mt-4 font-display text-sm font-semibold">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-p2p-text-secondary">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Examples */}
      <section className="border-t border-p2p-border px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center font-display text-2xl font-bold">
            What can you bet on?
          </h2>
          <p className="mt-3 text-center text-sm text-p2p-text-secondary">
            Builder bets. Productivity challenges. Social milestones. Anything
            with a clear condition and verifiable evidence.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {EXAMPLES.map((ex, i) => (
              <div
                key={i}
                className="rounded-card border border-p2p-border bg-p2p-panel px-4 py-3 text-sm text-p2p-text-primary"
              >
                &ldquo;{ex}&rdquo;
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-p2p-border px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-display text-lg font-semibold text-p2p-text-secondary">
            Not a sportsbook. Not a casino.
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-p2p-text-primary">
            A neutral referee for clear stakes.
          </p>
          <Link
            href="/app/create"
            className="mt-8 inline-block rounded-full bg-p2p-blue px-8 py-3.5 font-display text-sm font-semibold text-white transition hover:bg-p2p-blue/90"
          >
            Create Source-Locked Bet
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
