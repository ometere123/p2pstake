"use client";

import { useState, useEffect } from "react";
import { Clock, ShieldOff, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const EXCLUSION_KEY = "p2pstake_self_exclusion_until";
const COOLOFF_KEY = "p2pstake_cooling_off";
const SESSION_START_KEY = "p2pstake_session_start";

export function useSessionSafety() {
  const [sessionMinutes, setSessionMinutes] = useState(0);
  const [coolingOff, setCoolingOff] = useState(false);
  const [excluded, setExcluded] = useState(false);
  const [exclusionLabel, setExclusionLabel] = useState("");

  useEffect(() => {
    // Session timer
    let start = Number(sessionStorage.getItem(SESSION_START_KEY) || "0");
    if (!start) {
      start = Date.now();
      sessionStorage.setItem(SESSION_START_KEY, String(start));
    }
    const interval = setInterval(() => {
      setSessionMinutes(Math.floor((Date.now() - start) / 60000));
    }, 30000);

    // Cooling off
    setCoolingOff(localStorage.getItem(COOLOFF_KEY) === "true");

    // Self-exclusion
    const until = Number(localStorage.getItem(EXCLUSION_KEY) || "0");
    if (until > Date.now()) {
      setExcluded(true);
      const hoursLeft = Math.ceil((until - Date.now()) / 3600000);
      setExclusionLabel(hoursLeft > 24 ? `${Math.ceil(hoursLeft / 24)}d` : `${hoursLeft}h`);
    }

    return () => clearInterval(interval);
  }, []);

  const toggleCoolOff = () => {
    const next = !coolingOff;
    localStorage.setItem(COOLOFF_KEY, String(next));
    setCoolingOff(next);
  };

  const selfExclude = (hours: number) => {
    const until = Date.now() + hours * 3600000;
    localStorage.setItem(EXCLUSION_KEY, String(until));
    setExcluded(true);
    setExclusionLabel(hours > 24 ? `${Math.ceil(hours / 24)}d` : `${hours}h`);
  };

  const clearExclusion = () => {
    localStorage.removeItem(EXCLUSION_KEY);
    setExcluded(false);
    setExclusionLabel("");
  };

  return { sessionMinutes, coolingOff, toggleCoolOff, excluded, exclusionLabel, selfExclude, clearExclusion };
}

export function isCoolingOff(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(COOLOFF_KEY) === "true";
}

export function isExcluded(): boolean {
  if (typeof window === "undefined") return false;
  const until = Number(localStorage.getItem(EXCLUSION_KEY) || "0");
  return until > Date.now();
}

export function SessionSafetyPanel() {
  const { sessionMinutes, coolingOff, toggleCoolOff, excluded, exclusionLabel, selfExclude, clearExclusion } = useSessionSafety();

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-semibold">Session Safety</h2>

      {/* Session timer */}
      <div className="rounded-card border border-p2p-border bg-p2p-surface p-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-p2p-text-secondary" />
          <span className="text-sm text-p2p-text-secondary">Session active for</span>
          <span className={`font-mono text-sm font-semibold ${sessionMinutes >= 30 ? "text-p2p-gold" : "text-p2p-text-primary"}`}>
            {sessionMinutes}m
          </span>
        </div>
        {sessionMinutes >= 30 && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-p2p-gold">
            <AlertTriangle className="h-3 w-3" />
            You&apos;ve been active for a while. Consider taking a break.
          </p>
        )}
      </div>

      {/* Cooling off toggle */}
      <div className="rounded-card border border-p2p-border bg-p2p-surface p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {coolingOff ? (
              <ShieldCheck className="h-4 w-4 text-p2p-green" />
            ) : (
              <ShieldOff className="h-4 w-4 text-p2p-text-secondary" />
            )}
            <div>
              <div className="text-sm font-medium">Cooling-Off Mode</div>
              <div className="text-xs text-p2p-text-secondary">
                {coolingOff
                  ? "5-minute delay before creating wagers"
                  : "Adds a 5-minute wait before wager creation"}
              </div>
            </div>
          </div>
          <button
            onClick={toggleCoolOff}
            className={`relative h-6 w-11 rounded-full transition ${
              coolingOff ? "bg-p2p-green" : "bg-p2p-border"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                coolingOff ? "left-5.5" : "left-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Self-exclusion */}
      <div className="rounded-card border border-p2p-border bg-p2p-surface p-4">
        <div className="flex items-center gap-2">
          <ShieldOff className="h-4 w-4 text-p2p-red" />
          <div className="text-sm font-medium">Self-Exclusion</div>
        </div>
        <p className="mt-1 text-xs text-p2p-text-secondary">
          Block all wager creation for a set period. This is a personal safety tool.
        </p>
        {excluded ? (
          <div className="mt-3">
            <div className="flex items-center gap-2 text-sm text-p2p-red">
              <AlertTriangle className="h-3.5 w-3.5" />
              Self-excluded for {exclusionLabel}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearExclusion}
              className="mt-2 border-p2p-border text-xs text-p2p-text-secondary"
            >
              Remove exclusion
            </Button>
          </div>
        ) : (
          <div className="mt-3 flex gap-2">
            {[
              { label: "24h", hours: 24 },
              { label: "7 days", hours: 168 },
              { label: "30 days", hours: 720 },
            ].map(({ label, hours }) => (
              <Button
                key={hours}
                variant="outline"
                size="sm"
                onClick={() => selfExclude(hours)}
                className="border-p2p-red/30 text-xs text-p2p-red hover:bg-p2p-red/10"
              >
                {label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
