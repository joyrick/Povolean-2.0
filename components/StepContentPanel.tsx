"use client";

import type { ReactElement } from "react";
import { X, ExternalLink, FileText, Calendar, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getStepById } from "@/types/ui/sections-content";
import { useSteps } from "@/context/steps-provider";
import type { StepKey } from "@/types/ui/step-types";
import { FileHierarchyPanel } from "./FileHierarchyPanel";

type StepContentPanelProps = {
  stepId: string;
  onClose: () => void;
};

export function StepContentPanel({ stepId, onClose }: StepContentPanelProps): ReactElement {
  const router = useRouter();
  const step = getStepById(stepId);
  const { state, setStepStatus } = useSteps();
  
  const currentStatus = state[stepId as StepKey]?.status ?? "not_started";
  const isCompleted = currentStatus === "completed";

  function handleOpenFullPage(): void {
    router.push(`/steps/${stepId}`);
  }

  function handleToggleCompleted(): void {
    setStepStatus(stepId as StepKey, isCompleted ? "not_started" : "completed");
  }

  if (!step) {
    return (
      <Card className="flex h-full flex-col rounded-2xl border-slate-200 shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between gap-2 border-b bg-slate-50 px-6 py-4 rounded-t-2xl">
          <CardTitle className="text-lg font-semibold text-slate-900">
            Krok nenájdený
          </CardTitle>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full"
            onClick={onClose}
          >
            <X className="h-4 w-4 text-slate-500" />
          </Button>
        </CardHeader>
        <CardContent className="flex flex-1 items-center justify-center">
          <p className="text-slate-500">Krok s ID "{stepId}" nebol nájdený.</p>
        </CardContent>
      </Card>
    );
  }

  const isFileHierarchy = stepId === "file_hierarchy";
  const statusLabel = isFileHierarchy 
    ? "Pripojené" 
    : isCompleted 
    ? "Vyplnené" 
    : currentStatus === "in_progress" 
    ? "Rozpracované" 
    : "Nevyplnené";
  const statusClass = isFileHierarchy
    ? "bg-sky-50 text-sky-700 border-sky-100"
    : isCompleted 
    ? "bg-emerald-50 text-emerald-700 border-emerald-100"
    : currentStatus === "in_progress"
    ? "bg-amber-50 text-amber-700 border-amber-100"
    : "bg-rose-50 text-rose-700 border-rose-100";

  return (
    <Card className="flex h-full flex-col rounded-2xl border-slate-200 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between gap-2 border-b bg-slate-50 px-6 py-4 rounded-t-2xl">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg font-semibold text-slate-900 truncate">
              {step.title}
            </CardTitle>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold border ${statusClass}`}>
              {statusLabel}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1 truncate">{step.description}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full"
            onClick={onClose}
          >
            <X className="h-4 w-4 text-slate-500" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-6">
        {/* Special content for file hierarchy step */}
        {stepId === "file_hierarchy" ? (
          <FileHierarchyPanel />
        ) : (
          <>
            {/* Step metadata */}
            <div className="flex items-center gap-6 mb-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Termín: {step.dueDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Účastníci: {step.participantsCount ?? 0}</span>
              </div>
            </div>

            {/* Step content placeholder */}
            <div className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Obsah kroku</h3>
                    <p className="text-sm text-slate-500">Detaily a formuláre pre tento krok</p>
                  </div>
                </div>
                
                <p className="text-slate-600 mb-4">
                  Pre úplné zobrazenie obsahu a formulárov tohto kroku kliknite na tlačidlo nižšie.
                </p>

                <div className="flex flex-col gap-3">
                  <Button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleOpenFullPage}
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Otvoriť celú stránku kroku</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full rounded-full"
                    onClick={handleToggleCompleted}
                  >
                    {isCompleted ? "Odznačiť ako nesplnený" : "Označiť ako splnený"}
                  </Button>
                </div>
              </div>

              {/* Quick info cards */}
              <div className="grid grid-cols-1 gap-4">
                <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
                  <h4 className="font-medium text-slate-900 mb-2">Popis</h4>
                  <p className="text-sm text-slate-600">{step.description}</p>
                </div>
                
                {step.prerequisiteId && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <h4 className="font-medium text-amber-900 mb-2">Predpoklad</h4>
                    <p className="text-sm text-amber-700">
                      Tento krok vyžaduje dokončenie predchádzajúceho kroku (ID: {step.prerequisiteId})
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
