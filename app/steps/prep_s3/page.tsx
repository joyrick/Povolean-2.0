"use client";

import type { ReactElement } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { BackButton } from "@/components/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSteps } from "@/context/steps-provider";

type SurveyRowBase = {
  label: string;
};

type SurveyRowFormat = SurveyRowBase & {
  kind: "format";
  format: string;
};

type SurveyRowTextarea = SurveyRowBase & {
  kind: "textarea";
  placeholder?: string;
};

type SurveyRow = SurveyRowFormat | SurveyRowTextarea;

type SurveyTableProps = {
  title: string;
  rows: SurveyRow[];
  showAutoFill?: boolean;
};

function SurveyTable({
  title,
  rows,
  showAutoFill = false,
}: SurveyTableProps): ReactElement {
  return (
    <Card className="border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between gap-4 border-b bg-slate-50 px-5 py-3">
        <CardTitle className="text-md font-semibold tracking-wide text-slate-700">
          {title}
        </CardTitle>
        {showAutoFill && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-full border-slate-200 bg-white text-[11px] font-medium text-slate-700"
          >
            Automaticky vyplniť
          </Button>
        )}
      </CardHeader>
      <CardContent className="px-0 py-0">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-[1.7fr,1fr] border-b border-slate-100 text-md text-slate-700 last:border-b-0"
          >
            <div className="flex items-center px-5 py-2">{row.label}</div>
            <div className="flex items-center px-5 py-2">
              {row.kind === "format" && (
                <div className="inline-flex min-w-[5rem] items-center rounded-md border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-700">
                  {row.format}
                </div>
              )}
              {row.kind === "textarea" && (
                <textarea
                  className="h-24 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-md text-slate-800 shadow-inner outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder={row.placeholder ?? "Text..."}
                />
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

const geoRows: SurveyRow[] = [
  { label: "Polohopis", kind: "format", format: "DXF" },
  { label: "Výškopis", kind: "format", format: "DXF" },
  { label: "Hranice parciel", kind: "format", format: "DXF" },
  { label: "Existujúce stavby", kind: "format", format: "DXF" },
  { label: "Existujúce siete", kind: "format", format: "DXF" },
];

const geologyRows: SurveyRow[] = [
  {
    label: "Známe geologické charakteristiky územia",
    kind: "format",
    format: "PDF",
  },
  { label: "Geologická mapa", kind: "format", format: "PDF" },
  {
    label: "Orientačné informácie o únosnosti podložia",
    kind: "format",
    format: "PDF",
  },
];

const protectionRows: SurveyRow[] = [
  {
    label: "Ochranné pásma energetických vedení",
    kind: "format",
    format: "DXF",
  },
  {
    label: "Ochranné pásma vodovodov, kanalizácie",
    kind: "format",
    format: "DXF",
  },
  { label: "Ochranné pásma plynu", kind: "format", format: "DXF" },
  {
    label: "Ochranné pásma ciest, železníc",
    kind: "format",
    format: "DXF",
  },
  { label: "Pamiatkové územie", kind: "format", format: "DXF" },
  { label: "Územia s obmedzením", kind: "format", format: "DXF" },
];

const networksRows: SurveyRow[] = [
  { label: "Trasy sietí", kind: "format", format: "DXF" },
  { label: "Typ sietí", kind: "format", format: "DXF" },
  {
    label: "Predpokladaná kapacita",
    kind: "textarea",
    placeholder: "Input container...",
  },
  {
    label: "Technické obmedzenia",
    kind: "textarea",
    placeholder: "Text...",
  },
];

export default function VstupnePrieskumyPage(): ReactElement {
  const stepId = "prep_s3";
  const { state, setStepStatus } = useSteps();
  const current = state[stepId]?.status ?? "not_started";
  const isCompleted = current === "completed";

  function handleToggleCompleted(): void {
    setStepStatus(stepId, isCompleted ? "not_started" : "completed");
  }

  return (
    <AppShell>
      <PageHeader
        actions={
          <>
            <BackButton label="Späť na prehľad" />
            <Button
              type="button"
              variant="outline"
              onClick={handleToggleCompleted}
            >
              {isCompleted
                ? "Odznačiť krok ako nesplnený"
                : "Označiť krok ako splnený"}
            </Button>
          </>
        }
      />

      {/* scrollable main content */}
      <div className="mx-auto flex h-[calc(100vh-5rem)] max-w-7xl flex-col px-4 pb-6">
        {/* status row */}
        <div className="mt-4 flex items-center justify-between text-md text-slate-500">
          <span className="inline-flex items-center gap-2">
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
              {current === "completed" ? "VYPLNENÉ" : "ROZPRACOVANÉ"}
            </span>
            <span className="text-slate-400">
              Vstupné prieskumy a technické podklady
            </span>
          </span>
        </div>

        {/* survey tables – scrollable */}
        <div className="mt-6 flex-1 space-y-6 overflow-y-auto pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <SurveyTable title="Geodetické podklady" rows={geoRows} />
          <SurveyTable
            title="Základné informácie o geológii územia"
            rows={geologyRows}
            showAutoFill
          />
          <SurveyTable
            title="Existujúce ochranné pásma"
            rows={protectionRows}
            showAutoFill
          />
          <SurveyTable
            title="Existujúce inžinierske siete a kapacity"
            rows={networksRows}
            showAutoFill
          />
        </div>

        {/* bottom actions */}
        <div className="mt-6 flex justify-end gap-3">
          <BackButton variant="outline" label="Späť" />
          <Button type="button">Pokračovať</Button>
        </div>
      </div>
    </AppShell>
  );
}
