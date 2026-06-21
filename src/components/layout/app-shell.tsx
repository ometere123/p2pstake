"use client";

import { useEffect } from "react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useWalletStore } from "@/stores/wallet-store";
import { ResponsibleUseGate } from "@/components/guards/responsible-use-gate";

export function AppShell({ children }: { children: React.ReactNode }) {
  const reconnect = useWalletStore((s) => s.reconnect);

  useEffect(() => {
    reconnect();
  }, [reconnect]);

  return (
    <TooltipProvider delay={200}>
      <ResponsibleUseGate>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </ResponsibleUseGate>
    </TooltipProvider>
  );
}
