"use client";

import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import type { SectionWithSteps } from "@/types/ui/sections";
import type { SectionColumnProps } from "@/types/ui/sections-ui";
import { useSteps } from "@/context/steps-provider";
import { StepCard } from "./step-card";

type UserRole = "developer" | "admin" | "authority";

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

export function SectionColumn({ section }: SectionColumnProps): ReactElement {
  const router = useRouter();
  const { state } = useSteps();
  const { data: session } = useSession();

  const role: UserRole =
    ((session?.user as any)?.role as UserRole | undefined) ?? "developer";

  function handleStepClick(stepId: string): void {
    router.push(`/steps/${stepId}`);
  }

  function isStepLockedByPrereq(prerequisiteId: string | undefined): boolean {
    if (prerequisiteId === undefined) {
      return false;
    }
    const prereqStatus = state[prerequisiteId]?.status ?? "not_started";
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

    // developer or any other default: only prerequisites matter
    return isStepLockedByPrereq(prerequisiteId);
  }

  // enrich steps with effective status + locked state
  const stepsWithState = section.steps.map((step) => {
    const ctxStatus = state[step.id]?.status;
    const effectiveStatus = ctxStatus ?? step.status;
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
    <section className="ml-10 flex h-full w-100 flex-col items-center border-r border-slate-200 py-6 pr-10 last:border-0">
      <div className="mb-3 w-full">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                colorDotClasses[section.color]
              }`}
            />
            <h2 className="text-xl font-semibold text-slate-800">
              {section.title}
            </h2>
          </div>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-md font-medium text-slate-600">
            {section.steps.length}
          </span>
        </div>

        {/* progress bar */}
        <div className="mt-2 w-full">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Postup
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              {completedSteps}/{totalSteps} · {completionPercent}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                progressBarColors[section.color]
              }`}
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex-1 w-full space-y-3 overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {stepsWithState.map((step, index) => (
          <div
            key={step.id}
            className="step-appear"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <StepCard
              index={index + 1}
              title={step.title}
              description={step.description}
              status={step.status}
              onOpen={() => handleStepClick(step.id)}
              locked={step.locked}
              color={section.color}
              dueDate={step.dueDate}
              participantsCount={step.participantsCount}
            />
          </div>
        ))}
      </div>

      <style jsx>{`
        .step-appear {
          opacity: 1;
          transform: translateY(1000px);
          animation: step-slide-up 400ms ease-out forwards;
        }

        @keyframes step-slide-up {
          0% {
            transform: translateY(1000px);
          }
          100% {
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
