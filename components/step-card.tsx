import type { ReactElement } from "react";
import type { StepCardProps, StepStatus } from "@/types/steps";
import { Calendar, Users, Cloud } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { SectionColor } from "@/types/ui/sections";

const statusLabel: Record<StepStatus, string> = {
  not_started: "Nevyplnené",
  in_progress: "Rozpracované",
  completed: "Vyplnené",
  connected: "Pripojené",
};

const statusClasses: Record<StepStatus, string> = {
  not_started: "bg-rose-50 text-rose-700 border border-rose-100",
  in_progress: "bg-amber-50 text-amber-700 border border-amber-100",
  completed: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  connected: "bg-sky-50 text-sky-700 border border-sky-100",
};

const borderColors: Record<SectionColor, string> = {
  blue: "border-blue-500",
  purple: "border-purple-500",
  green: "border-emerald-400",
  yellow: "border-amber-500",
};

const buttonGradientColors: Record<SectionColor, string> = {
  blue: "bg-gradient-to-r from-blue-500 to-blue-700",
  purple: "bg-gradient-to-r from-purple-500 to-purple-700",
  green: "bg-gradient-to-r from-emerald-400 to-emerald-600",
  yellow: "bg-gradient-to-r from-amber-500 to-amber-700",
};

// color used for glow
const glowColors: Record<SectionColor, string> = {
  blue: "rgba(59, 130, 246, 0.55)", // blue-500
  purple: "rgba(168, 85, 247, 0.55)", // purple-500
  green: "rgba(16, 185, 129, 0.55)", // emerald-500
  yellow: "rgba(245, 158, 11, 0.55)", // amber-500
};

export function StepCard({
  index,
  title,
  description,
  status,
  dueDate,
  participantsCount,
  onOpen,
  locked = false,
  color = "blue",
  stepId,
}: StepCardProps): ReactElement {
  const isFileHierarchy = stepId === "file_hierarchy";
  const effectiveStatus = isFileHierarchy ? "connected" : status;
  const label = statusLabel[effectiveStatus];
  const badgeClass = statusClasses[effectiveStatus];

  return (
    <Card
      className={`
        step-card group relative overflow-hidden rounded-2xl bg-white 
        shadow-lg
        border-l-8 ${borderColors[color]}
        transition
        ${locked ? " opacity-60 blur-[1.5px]" : ""}
      `}
      style={{ ["--step-glow-color" as string]: glowColors[color] }}
    >
      <CardContent className="flex flex-col gap-2 px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold leading-snug text-slate-900">
              {index}. {title}
            </h3>
            <p className="mt-1 text-sm leading-snug text-slate-500">
              {description}
            </p>
            {locked && (
              <p className="mt-1 text-sm font-medium text-slate-500">
                Najprv dokonči predchádzajúci krok.
              </p>
            )}
          </div>
          <span
            className={`rounded-full px-2 py-0.5 text-sm font-semibold flex items-center gap-1 ${badgeClass}`}
          >
            {isFileHierarchy && <Cloud className="h-3.5 w-3.5" />}
            {label}
          </span>
        </div>

        <div className="mt-1 flex justify-center">
          <Button
            type="button"
            size="sm"
            className={`
              step-card-button relative w-2/3 max-w-70 rounded-full 
              text-lg font-semibold text-white
              hover:scale-105 active:scale-95
              cursor-pointer
              transition-transform duration-150 ease-out
              disabled:opacity-60
              
              ${buttonGradientColors[color]}
            `}
            onClick={() => {
              if (!locked && onOpen !== undefined) {
                onOpen();
              }
            }}
            disabled={locked}
          >
            Otvoriť
          </Button>
        </div>

        {!isFileHierarchy && (
          <>
            <div className="mt-3 h-px w-full bg-slate-200" />

            <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
              <div className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{dueDate}</span>
              </div>
              <div className="inline-flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>Účastníci: {participantsCount ?? 0}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>

      <style jsx>{`
        .step-card {
          position: relative;
          box-shadow: 0 10px 22px rgba(15, 23, 42, 0.06);
          transform: translateY(0);
          transition: box-shadow 160ms ease-out, transform 160ms ease-out,
            border-color 160ms ease-out;
        }

        .step-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 0 1px var(--step-glow-color),
            0 0 32px var(--step-glow-color);
        }

        .step-card-button {
          transform-origin: center;
        }

        .step-card-button:hover:not(:disabled) {
          transform: scale(1.04);
        }

        .step-card-button:active:not(:disabled) {
          transform: scale(0.97);
        }
      `}</style>
    </Card>
  );
}
