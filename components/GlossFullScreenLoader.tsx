"use client";

import type { ReactElement } from "react";
import GlossLogo from "./GlossLogo";

type GlossFullScreenLoaderProps = {
  label?: string;
};

export default function GlossFullScreenLoader({
  label = "Načítavam…",
}: GlossFullScreenLoaderProps): ReactElement {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/50 backdrop-blur-md">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-slate-900/70 shadow-2xl shadow-slate-950/70">
          <div className="absolute h-32 w-32 animate-ping rounded-full bg-blue-500/25" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-slate-950/90">
            <GlossLogo width={80} height={80} duration={1.2} />
          </div>
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-100">
          {label}
        </p>
      </div>
    </div>
  );
}
