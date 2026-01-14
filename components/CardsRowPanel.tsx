"use client";

import type { ReactElement } from "react";
import { useSession } from "next-auth/react";
import type { SectionWithSteps } from "@/types/ui/sections";
import { useSteps } from "@/context/steps-provider";
import { StepCard } from "./step-card";
import { getSectionsBoard } from "@/types/ui/sections-content";
import type { StepKey } from "@/types/ui/step-types";

type UserRole = "developer" | "admin" | "authority";

type CardsRowPanelProps = {
  onStepSelect?: (stepId: string) => void;
  selectedStepId?: string | null;
};

const colorDotClasses: Record<SectionWithSteps["color"], string> = {
  blue: "bg-blue-500",
  yellow: "bg-yellow-400",
  green: "bg-emerald-400",
  purple: "bg-purple-500",
};

const progressBarColors: Record<SectionWithSteps["color"], string> = {
  blue: "bg-blue-500",
  yellow: "bg-amber-400",
  green: "bg-emerald-400",
  purple: "bg-purple-500",
};

export function CardsRowPanel({ onStepSelect, selectedStepId }: CardsRowPanelProps): ReactElement {
  const { state } = useSteps();
  const { data: session } = useSession();
  const sections = getSectionsBoard();

  const role: UserRole =
    ((session?.user as any)?.role as UserRole | undefined) ?? "developer";

  function handleStepClick(stepId: string): void {
    if (onStepSelect) {
      onStepSelect(stepId);
    }
  }

  function isStepLockedByPrereq(prerequisiteId: string | undefined): boolean {
    if (prerequisiteId === undefined) {
      return false;
    }
    const prereqStatus = state[prerequisiteId as StepKey]?.status ?? "not_started";
    return prereqStatus !== "completed";
  }

  function isStepLocked(
    stepId: string,
    prerequisiteId: string | undefined
  ): boolean {
    if (role === "admin") {
      return false;
    }

    if (role === "authority") {
      if (!stepId.startsWith("prep_")) {
        return false;
      }
      return isStepLockedByPrereq(prerequisiteId);
    }

    return isStepLockedByPrereq(prerequisiteId);
  }

  return (
    <div className="h-full overflow-y-auto pr-2 space-y-6">
      {sections.map((section) => {
        const stepsWithState = section.steps.map((step) => {
          const ctxStatus = state[step.id as StepKey]?.status;
          const effectiveStatus = ctxStatus ?? "not_started";
          const locked = isStepLocked(step.id, step.prerequisiteId);

          return {
            ...step,
            status: effectiveStatus,
            locked,
          };
        });

        const totalSteps = stepsWithState.length;
        const completedSteps = stepsWithState.filter(
          (s) => s.status === "completed"
        ).length;
        const completionPercent =
          totalSteps === 0 ? 0 : Math.round((completedSteps / totalSteps) * 100);

        return (
          <div key={section.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            {/* Section Header */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-3 w-3 rounded-full ${colorDotClasses[section.color]}`}
                  />
                  <h2 className="text-lg font-semibold text-slate-800">
                    {section.title}
                  </h2>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-sm font-medium text-slate-600">
                    {section.steps.length}
                  </span>
                </div>
                <span className="text-sm font-medium text-slate-500">
                  {completedSteps}/{totalSteps} · {completionPercent}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${progressBarColors[section.color]}`}
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>

            {/* Cards in rows */}
            <div className="grid grid-cols-1 gap-3">
              {stepsWithState.map((step, index) => (
                <div 
                  key={step.id}
                  className={`rounded-2xl transition-all ${
                    selectedStepId === step.id 
                      ? "ring-2 ring-blue-500 ring-offset-2" 
                      : ""
                  }`}
                >
                  <StepCard
                    index={step.id === "file_hierarchy" ? 0 : index + 1}
                    title={step.title}
                    description={step.description}
                    status={step.status}
                    onOpen={() => handleStepClick(step.id)}
                    locked={step.locked}
                    color={section.color}
                    dueDate={step.dueDate}
                    participantsCount={step.participantsCount}
                    stepId={step.id}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
