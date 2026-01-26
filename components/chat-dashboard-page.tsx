"use client";

import type { ReactElement } from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import { PageHeader } from "./page-header";
import { ResizablePanels } from "./ResizablePanels";
import { CardsRowPanel } from "./CardsRowPanel";
import { AiChatPanel } from "./AiChatPanel";
import { StepContentPanel } from "./StepContentPanel";

function InnerResizablePanels({
  leftPanel,
  rightPanel,
  defaultLeftWidth = 35,
  minLeftWidth = 25,
  maxLeftWidth = 60,
}: {
  leftPanel: ReactElement;
  rightPanel: ReactElement;
  defaultLeftWidth?: number;
  minLeftWidth?: number;
  maxLeftWidth?: number;
}): ReactElement {
  const [leftWidthPercent, setLeftWidthPercent] = useState(defaultLeftWidth);
  const containerRef = useRef<HTMLDivElement | null>(null);
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
      const rect = containerRef.current.getBoundingClientRect();
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
    <div ref={containerRef} className="flex h-full w-full min-h-0">
      <div
        className="h-full min-h-0 overflow-y-auto"
        style={{ width: `${leftWidthPercent}%` }}
      >
        {leftPanel}
      </div>

      <div
        className="group relative h-full w-2 cursor-col-resize flex-shrink-0 bg-transparent hover:bg-emerald-100 transition-colors"
        onMouseDown={handleMouseDown}
      >
        <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-slate-200 group-hover:bg-emerald-400 transition-colors" />
      </div>

      <div
        className="h-full min-h-0 overflow-y-auto"
        style={{ width: `${100 - leftWidthPercent}%` }}
      >
        {rightPanel}
      </div>
    </div>
  );
}

function ChatDashboardPage(): ReactElement {
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-slate-200">
        <PageHeader />
      </div>

      {/* Main area: flexible, fills remaining viewport height */}
      <div className="flex-1 min-h-0 px-6 py-4">
        <div className="h-full min-h-0">
          <ResizablePanels
            leftPanel={
              <div className="h-full min-h-0">
                {selectedStepId ? (
                  <InnerResizablePanels
                    leftPanel={
                      <div className="h-full min-h-0 overflow-y-auto p-0">
                        <CardsRowPanel
                          onStepSelect={setSelectedStepId}
                          selectedStepId={selectedStepId}
                        />
                      </div>
                    }
                    rightPanel={
                      <div className="h-full min-h-0 overflow-y-auto p-0">
                        <StepContentPanel
                          stepId={selectedStepId!}
                          onClose={() => setSelectedStepId(null)}
                        />
                      </div>
                    }
                    defaultLeftWidth={35}
                    minLeftWidth={25}
                    maxLeftWidth={60}
                  />
                ) : (
                  <div className="h-full min-h-0 overflow-y-auto">
                    <CardsRowPanel
                      onStepSelect={setSelectedStepId}
                      selectedStepId={selectedStepId}
                    />
                  </div>
                )}
              </div>
            }
            rightPanel={
              <div className="h-full min-h-0">
                <AiChatPanel />
              </div>
            }
            defaultLeftWidth={60}
            minLeftWidth={40}
            maxLeftWidth={75}
          />
        </div>
      </div>
    </div>
  );
}

export default ChatDashboardPage;
