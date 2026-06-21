"use client";

import { useState, useEffect } from "react";
import { getContractAddress, isContractAddressSet } from "@/lib/genlayer/explorer";
import { getRpcUrl, getChainId } from "@/lib/genlayer/chain";
import { getAllWagerIds } from "@/lib/genlayer/contract";

interface EnvVar {
  set: boolean;
  value: string;
}

interface HealthCheck {
  envVars: {
    contractAddress: EnvVar;
    chainId: EnvVar;
    rpcUrl: EnvVar;
    explorerUrl: EnvVar;
  };
  rpcReachable: boolean | null;
  contractReachable: boolean | null;
  loading: boolean;
}

export function useContractHealth(): HealthCheck {
  const [health, setHealth] = useState<HealthCheck>({
    envVars: {
      contractAddress: { set: false, value: "" },
      chainId: { set: false, value: "" },
      rpcUrl: { set: false, value: "" },
      explorerUrl: { set: false, value: "" },
    },
    rpcReachable: null,
    contractReachable: null,
    loading: true,
  });

  useEffect(() => {
    async function check() {
      const contractAddr = getContractAddress();
      const chainId = String(getChainId());
      const rpcUrl = getRpcUrl();
      const explorerUrl =
        process.env.NEXT_PUBLIC_GENLAYER_EXPLORER_URL || "";

      const envVars = {
        contractAddress: { set: contractAddr.length > 0, value: contractAddr },
        chainId: { set: chainId.length > 0, value: chainId },
        rpcUrl: { set: rpcUrl.length > 0, value: rpcUrl },
        explorerUrl: { set: explorerUrl.length > 0, value: explorerUrl },
      };

      let rpcReachable = false;
      let contractReachable = false;

      try {
        const resp = await fetch(rpcUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_chainId",
            params: [],
            id: 1,
          }),
        });
        rpcReachable = resp.ok;
      } catch {
        rpcReachable = false;
      }

      if (isContractAddressSet() && rpcReachable) {
        try {
          await getAllWagerIds();
          contractReachable = true;
        } catch {
          contractReachable = false;
        }
      }

      setHealth({
        envVars,
        rpcReachable,
        contractReachable,
        loading: false,
      });
    }

    check();
  }, []);

  return health;
}
