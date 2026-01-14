"use client";

import type { ReactElement, ReactNode } from "react";
import { useState, useRef, useCallback, useEffect } from "react";

type ResizablePanelsProps = {
  leftPanel: ReactNode;
  rightPanel: ReactNode;
  defaultLeftWidth?: number;
  minLeftWidth?: number;
  maxLeftWidth?: number;
};

export function ResizablePanels({
  leftPanel,
  rightPanel,
  defaultLeftWidth = 60,
  minLeftWidth = 30,
  maxLeftWidth = 80,
}: ResizablePanelsProps): ReactElement {
  const [leftWidthPercent, setLeftWidthPercent] = useState(defaultLeftWidth);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMouseDown = useCallback(() => {
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = (x / rect.width) * 100;

      const clampedPercent = Math.min(
        maxLeftWidth,
        Math.max(minLeftWidth, percent)
      );
      setLeftWidthPercent(clampedPercent);
    },
    [minLeftWidth, maxLeftWidth]
  );

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return (
    <div ref={containerRef} className="flex h-full w-full overflow-hidden">
      {/* Left Panel */}
      <div
        className="h-full overflow-hidden"
        style={{ width: `${leftWidthPercent}%` }}
      >
        {leftPanel}
      </div>

      {/* Resizer */}
      <div
        className="group relative h-full w-2 cursor-col-resize flex-shrink-0 bg-transparent hover:bg-blue-100 transition-colors"
        onMouseDown={handleMouseDown}
      >
        <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-slate-200 group-hover:bg-blue-400 transition-colors" />
        {/* Drag handle indicator */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="h-1 w-1 rounded-full bg-blue-400" />
          <div className="h-1 w-1 rounded-full bg-blue-400" />
          <div className="h-1 w-1 rounded-full bg-blue-400" />
        </div>
      </div>

      {/* Right Panel */}
      <div
        className="h-full overflow-hidden"
        style={{ width: `${100 - leftWidthPercent}%` }}
      >
        {rightPanel}
      </div>
    </div>
  );
}
