"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { WalletGate } from "@/components/wallet/wallet-gate";
import { NetworkGuard } from "@/components/wallet/network-guard";
import { ContractAddressGuard } from "@/components/guards/contract-address-guard";

const PUBLIC_PATHS = ["/app/debug", "/app/guide", "/app/stats"];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  return (
    <AppShell>
      <NetworkGuard />
      <ContractAddressGuard />
      {isPublic ? children : <WalletGate>{children}</WalletGate>}
    </AppShell>
  );
}
