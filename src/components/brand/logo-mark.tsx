"use client";

import Image from "next/image";

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <Image
      src="/logo.svg"
      alt="P2PStake"
      width={size}
      height={size}
      className="shrink-0"
    />
  );
}
