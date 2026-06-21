"use client";

import { useWalletStore } from "@/stores/wallet-store";
import { isContractAddressSet } from "@/lib/genlayer/explorer";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WriteActionGuardProps {
  children: React.ReactNode;
  action?: string;
}

export function WriteActionGuard({ children, action }: WriteActionGuardProps) {
  const { isConnected, isCorrectNetwork } = useWalletStore();
  const contractSet = isContractAddressSet();

  const canWrite = isConnected && isCorrectNetwork && contractSet;

  if (canWrite) return <>{children}</>;

  let reason = "Connect your wallet to continue.";
  if (isConnected && !isCorrectNetwork) {
    reason = "Switch to GenLayer StudioNet.";
  } else if (isConnected && !contractSet) {
    reason = "No contract address configured.";
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={<div className="cursor-not-allowed opacity-50">{children}</div>}
      />
      <TooltipContent>
        <p>
          {action ? `Cannot ${action}: ` : ""}
          {reason}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
