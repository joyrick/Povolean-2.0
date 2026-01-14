"use client";

import type { ReactElement } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { BackButton } from "@/components/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSteps } from "@/context/steps-provider";

type TextHintSectionProps = {
  title: string;
  bullets: string[];
};

function TextHintSection({
  title,
  bullets,
}: TextHintSectionProps): ReactElement {
  return (
    <Card className="border-slate-200">
      <CardHeader className="flex flex-row items-center justify-between gap-4 border-b bg-slate-50 px-5 py-3">
        <CardTitle className="text-md font-semibold tracking-wide text-slate-700">
          {title}
        </CardTitle>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-full border-slate-200 bg-white text-[11px] font-medium text-slate-700"
        >
          Automaticky preformulovať
        </Button>
      </CardHeader>
      <CardContent className="grid gap-6 px-5 py-4 md:grid-cols-[1.4fr,1fr]">
        <div>
          <textarea
            className="h-40 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-md text-slate-800 shadow-inner outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Input container..."
          />
        </div>
        <div className="text-[11px] leading-relaxed text-slate-500">
          <div className="mb-1 font-semibold text-slate-600">
            má obsahovať (nápoveda)
          </div>
          <ul className="list-disc space-y-0.5 pl-4">
            {bullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

const sections: TextHintSectionProps[] = [
  {
    title: "Opis účelu stavby",
    bullets: [
      "podrobný účel stavby (bývanie, vybavenosť, administratíva…)",
      "charakter prevádzky (trvalé, občasné, nárazové)",
      "opis hlavnej funkcie stavby",
      "opis doplnkových funkcií (garáže, sklady, technické miestnosti)",
    ],
  },
  {
    title: "Prevádzkové požiadavky",
    bullets: [
      "režim užívania",
      "potreby zásobovania",
      "potreby odvádzania odpadu",
      "pohyb osôb v rámci stavby",
      "hygienické nároky (ak je to relevantné)",
      "požiadavky na bezbariérovosť",
    ],
  },
  {
    title: "Rámcové kapacity",
    bullets: [
      "plošné výmery (ZP, PP, ÚP)",
      "výškové výmery (počet NP, PP, výška stavby)",
      "objemové údaje",
      "kapacitné údaje podľa funkcie (počet bytov, osôb, prevádzok, parkovacích miest)",
    ],
  },
  {
    title: "Základná technická koncepcia stavby",
    bullets: [
      "predpokladaný konštrukčný systém (murovaný, železobetónový, oceľový…)",
      "rámcové riešenie základov",
      "stavebno–technické riešenie (energetický štandard, vetranie, vykurovanie)",
      "urbanistické a architektonické riešenie",
      "dispozičné a funkčné riešenie",
    ],
  },
  {
    title: "Požiadavky na dopravné napojenie",
    bullets: [
      "identifikácia prístupovej komunikácie",
      "koncepcia dopravného napojenia stavby",
      "rámcové požiadavky na zásobovanie",
      "dopravné väzby na okolie",
      "predpokladané nároky na statickú dopravu",
    ],
  },
  {
    title: "Požiadavky na napojenie na inžinierske siete",
    bullets: [
      "identifikácia existujúcich sietí (V, K, E, P, optika)",
      "rámcové odvody vody",
      "rámcové odbery elektriny a plynu",
      "možnosti odvádzania odpadových vôd",
      "obmedzenia vyplývajúce z kapacity sietí",
    ],
  },
];

export default function TechnicalBasisPage(): ReactElement {
  const stepId = "prep_s2";
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

      {/* scrollable main content, same pattern as previous page */}
      <div className="mx-auto flex h-[calc(100vh-5rem)] max-w-7xl flex-col px-4 pb-6">
        {/* status row pinned at top of this area */}
        <div className="mt-4 flex items-center justify-between text-md text-slate-500">
          <span className="inline-flex items-center gap-2">
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
              {current === "completed" ? "VYPLNENÉ" : "ROZPRACOVANÉ"}
            </span>
            <span className="text-slate-400">Podklady pre súhrnnú správu</span>
          </span>
        </div>

        {/* sections: scrollable */}
        <div className="mt-6 flex-1 space-y-6 overflow-y-auto pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {sections.map((cfg) => (
            <TextHintSection
              key={cfg.title}
              title={cfg.title}
              bullets={cfg.bullets}
            />
          ))}
        </div>

        {/* bottom actions, outside scroll area */}
        <div className="mt-6 flex justify-end gap-3">
          <BackButton variant="outline" label="Späť" />
          <Button type="button">Generovať správu</Button>
        </div>
      </div>
    </AppShell>
  );
}
