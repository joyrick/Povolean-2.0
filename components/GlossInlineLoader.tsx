"use client";

import type { ReactElement } from "react";
import GlossLogo from "./GlossLogo";

type GlossInlineLoaderProps = {
  label?: string;
};

export function GlossInlineLoader({
  label = "Načítavam...",
}: GlossInlineLoaderProps): ReactElement {
  return (
    <div className="flex min-h-[260px] w-full flex-col items-center justify-center rounded-2xl ">
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-white">
        <div className="absolute h-20 w-20 animate-ping rounded-full bg-blue-400/25" />
        <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-lg shadow-slate-900/40">
          <GlossLogo width={40} height={40} duration={0.9} />
        </div>
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>
    </div>
  );
}
