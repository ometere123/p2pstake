"use client";

import { useContractHealth } from "@/hooks/use-contract-health";
import { useWalletStore } from "@/stores/wallet-store";
import { useTxStore } from "@/stores/tx-store";
import { TxHashLink } from "@/components/brand/tx-hash-link";
import { addressUrl } from "@/lib/genlayer/explorer";
import { Check, X, Loader2, ExternalLink } from "lucide-react";

function StatusDot({ ok }: { ok: boolean | null }) {
  if (ok === null) return <Loader2 className="h-3.5 w-3.5 animate-spin text-p2p-text-secondary" />;
  return ok ? (
    <Check className="h-3.5 w-3.5 text-p2p-green" />
  ) : (
    <X className="h-3.5 w-3.5 text-p2p-red" />
  );
}

function EnvRow({
  label,
  env,
}: {
  label: string;
  env: { set: boolean; value: string };
}) {
  return (
    <div className="flex items-center justify-between border-b border-p2p-border py-2">
      <div className="flex items-center gap-2">
        <StatusDot ok={env.set} />
        <span className="text-sm text-p2p-text-primary">{label}</span>
      </div>
      <span className="max-w-[300px] truncate font-mono text-xs text-p2p-text-secondary">
        {env.set ? env.value : "not set"}
      </span>
    </div>
  );
}

export default function DebugPage() {
  const health = useContractHealth();
  const { address, chainId, isConnected } = useWalletStore();
  const latestHash = useTxStore((s) => s.getLatestHash());

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold">Debug Panel</h1>
      <p className="mt-1 text-sm text-p2p-text-secondary">
        Network, contract, and environment diagnostics.
      </p>

      {/* Env Vars */}
      <div className="mt-8 rounded-panel border border-p2p-border bg-p2p-panel p-5">
        <h2 className="text-sm font-semibold text-p2p-text-secondary uppercase tracking-wider">
          Environment Variables
        </h2>
        <div className="mt-3">
          <EnvRow label="Contract Address" env={health.envVars.contractAddress} />
          <EnvRow label="Chain ID" env={health.envVars.chainId} />
          <EnvRow label="RPC URL" env={health.envVars.rpcUrl} />
          <EnvRow label="Explorer URL" env={health.envVars.explorerUrl} />
        </div>
      </div>

      {/* Network Health */}
      <div className="mt-6 rounded-panel border border-p2p-border bg-p2p-panel p-5">
        <h2 className="text-sm font-semibold text-p2p-text-secondary uppercase tracking-wider">
          Network Health
        </h2>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusDot ok={health.rpcReachable} />
              <span className="text-sm">RPC Reachable</span>
            </div>
            <span className="font-mono text-xs text-p2p-text-secondary">
              {health.loading ? "checking..." : health.rpcReachable ? "ok" : "failed"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusDot ok={health.contractReachable} />
              <span className="text-sm">Contract Reachable</span>
            </div>
            <span className="font-mono text-xs text-p2p-text-secondary">
              {health.loading
                ? "checking..."
                : health.contractReachable
                ? "ok"
                : "failed"}
            </span>
          </div>
        </div>
      </div>

      {/* Wallet */}
      <div className="mt-6 rounded-panel border border-p2p-border bg-p2p-panel p-5">
        <h2 className="text-sm font-semibold text-p2p-text-secondary uppercase tracking-wider">
          Wallet
        </h2>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-p2p-text-secondary">Connected</span>
            <span className={isConnected ? "text-p2p-green" : "text-p2p-red"}>
              {isConnected ? "yes" : "no"}
            </span>
          </div>
          {address && (
            <div className="flex items-center justify-between">
              <span className="text-p2p-text-secondary">Address</span>
              <a
                href={addressUrl(address)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-mono text-xs text-p2p-blue hover:underline"
              >
                {address}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-p2p-text-secondary">Chain ID</span>
            <span className="font-mono text-xs">{chainId ?? "-"}</span>
          </div>
        </div>
      </div>

      {/* Contract */}
      <div className="mt-6 rounded-panel border border-p2p-border bg-p2p-panel p-5">
        <h2 className="text-sm font-semibold text-p2p-text-secondary uppercase tracking-wider">
          Contract
        </h2>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-p2p-text-secondary">Address</span>
            {health.envVars.contractAddress.set ? (
              <a
                href={addressUrl(health.envVars.contractAddress.value)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-mono text-xs text-p2p-violet hover:underline"
              >
                {health.envVars.contractAddress.value}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <span className="text-p2p-red">not set</span>
            )}
          </div>
          {latestHash && (
            <div className="flex items-center justify-between">
              <span className="text-p2p-text-secondary">Latest Tx</span>
              <TxHashLink hash={latestHash} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
