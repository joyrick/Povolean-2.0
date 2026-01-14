"use client";

import type { ReactElement, ReactNode } from "react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Map, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { BackButton } from "@/components/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSteps } from "@/context/steps-provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GlossInlineLoader } from "@/components/GlossInlineLoader";

type TableRow = {
  label: string;
  control?: "input" | "file";
  placeholder?: string;
};

type TableSectionProps = {
  title: string;
  leftHeader: string;
  rightHeader: string;
  rows: TableRow[];
  headerActions?: ReactNode;
  values?: Record<string, string>;
  onChangeValue?: (label: string, value: string) => void;
  onAutoFill?: () => void;
};

function TableSection({
  title,
  leftHeader,
  rightHeader,
  rows,
  headerActions,
  values,
  onChangeValue,
  onAutoFill,
}: TableSectionProps): ReactElement {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-4 border-b bg-slate-50 px-5 py-3">
        <CardTitle className="text-md font-semibold tracking-wide text-slate-900">
          {title}
        </CardTitle>
        <div className="flex items-center gap-3">
          {headerActions}
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="flex items-center gap-2 rounded-full border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-sky-600 shadow-sm hover:bg-sky-50"
            onClick={onAutoFill}
          >
            <Sparkles className="h-4 w-4" />
            Automaticky vyplniť
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-0 py-0">
        <div className="grid grid-cols-[1.5fr,2fr] border-b border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          <div className="px-5 py-2">{leftHeader}</div>
          <div className="px-5 py-2">{rightHeader}</div>
        </div>
        {rows.map((row) => {
          const value = values?.[row.label];

          return (
            <div
              key={row.label}
              className="grid grid-cols-[1.5fr,2fr] border-b border-slate-100 text-md text-slate-700 last:border-b-0"
            >
              <div className="flex items-center px-5 py-2 text-slate-600">
                {row.label}
              </div>
              <div className="flex items-center px-5 py-2">
                {row.control === "input" && (
                  <Input
                    className="h-8 text-md"
                    placeholder={row.placeholder ?? ""}
                    value={onChangeValue ? value ?? "" : undefined}
                    onChange={
                      onChangeValue
                        ? (e) => onChangeValue(row.label, e.target.value)
                        : undefined
                    }
                  />
                )}
                {row.control === "file" && (
                  <div className="flex w-full items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="rounded-md border-slate-200 bg-white text-[11px]"
                    >
                      Vybrať súbor
                    </Button>
                    <span className="truncate text-[11px] text-slate-400">
                      {value ?? "nie je vybraný žiadny súbor"}
                    </span>
                  </div>
                )}
                {row.control === undefined && (
                  <span className="text-[11px] text-slate-500">
                    {value ?? "-"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

const landRows: TableRow[] = [
  {
    label: "Katastrálne územie",
    control: "input",
    placeholder: "Zadajte k.ú.",
  },
  { label: "Parcely", control: "input", placeholder: "Číslo parcely" },
  {
    label: "Druh pozemku",
    control: "input",
    placeholder: "Napr. Orná pôda",
  },
  { label: "Výmera parcely", control: "input", placeholder: "m2" },
  { label: "Listy vlastníctva", control: "input", placeholder: "Číslo LV" },
];

const planningRows: TableRow[] = [
  { label: "Záväzné časti obce" },
  { label: "Regulačný plán obce" },
  { label: "Územná štúdia" },
  { label: "Funkčné regulatívy" },
  { label: "Priestorové regulatívy" },
  { label: "Dopravné regulatívy" },
  { label: "Limity územia" },
];

const mapsRows: TableRow[] = [
  { label: "Katastrálna mapa" },
  { label: "Ortofoto mapa" },
  { label: "Mapa ochranných pásiem" },
];

const ownSurveyRows: TableRow[] = [
  { label: "Geodetické zameranie", control: "file" },
  { label: "Polohopis", control: "file" },
  { label: "Výškopis", control: "file" },
];

export default function IdentificationStepPage(): ReactElement {
  const stepId = "prep_s1";
  const { state, setStepStatus } = useSteps();
  const current = state[stepId]?.status ?? "not_started";
  const isCompleted = current === "completed";

  const [isMapDialogOpen, setIsMapDialogOpen] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(false);

  const [landValues, setLandValues] = useState<Record<string, string>>({});
  const [planningValues, setPlanningValues] = useState<Record<string, string>>(
    {}
  );
  const [mapsValues, setMapsValues] = useState<Record<string, string>>({});
  const [ownSurveyValues, setOwnSurveyValues] = useState<
    Record<string, string>
  >({});

  function handleToggleCompleted(): void {
    setStepStatus(stepId, isCompleted ? "not_started" : "completed");
  }

  function handleOpenMap(): void {
    setIsMapDialogOpen(true);
    setIsMapLoading(true);
  }

  useEffect(() => {
    if (!isMapDialogOpen) return;
    const t = setTimeout(() => setIsMapLoading(false), 600);
    return () => clearTimeout(t);
  }, [isMapDialogOpen]);

  function handleLandChange(label: string, value: string): void {
    setLandValues((prev) => ({ ...prev, [label]: value }));
  }

  function handleAutoFillLand(): void {
    setLandValues({
      "Katastrálne územie": "Bratislava – Mlynské nivy",
      Parcely: "1234/1, 1234/2, 1234/3",
      "Druh pozemku": "Zastavané plochy a nádvoria",
      "Výmera parcely": "8 450 m²",
      "Listy vlastníctva": "LV 5678, LV 9012",
    });
  }

  function handleAutoFillPlanning(): void {
    setPlanningValues({
      "Záväzné časti obce":
        "ÚPN hl. mesta SR Bratislavy – záväzné časti (VZN č. 5/2022).",
      "Regulačný plán obce":
        "Regulačný plán zóny Nivy, schválený uznesením č. 123/2020.",
      "Územná štúdia":
        "Územná štúdia Mlynské nivy – polyfunkčná zóna, spracovateľ XYZ s.r.o.",
      "Funkčné regulatívy":
        "Polyfunkčné územie – bývanie a občianska vybavenosť.",
      "Priestorové regulatívy":
        "Max. 8 NP, koeficient zastavania 0,45, min. zeleň 30 %.",
      "Dopravné regulatívy":
        "Prístup z miestnej komunikácie triedy C, jednosmerné napojenie, min. 1 PM/byt.",
      "Limity územia":
        "Ochranné pásmo inžinierskych sietí, odstupové vzdialenosti od susedných objektov.",
    });
  }

  function handleAutoFillMaps(): void {
    setMapsValues({
      "Katastrálna mapa": "kataster_mlynske_nivy.pdf",
      "Ortofoto mapa": "ortofoto_2024_mlynske_nivy.jpg",
      "Mapa ochranných pásiem": "ochranne_pasma_IS.mxd",
    });
  }

  function handleAutoFillOwnSurvey(): void {
    setOwnSurveyValues({
      "Geodetické zameranie": "geodeticke_zameranie_2024.dwg",
      Polohopis: "polohopis_2024.pdf",
      Výškopis: "vyskopis_2024.pdf",
    });
  }

  function handleConfirmFromMap(): void {
    handleAutoFillLand();
    setIsMapDialogOpen(false);
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

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div className="mx-auto flex h-[calc(100vh-5rem)] max-w-7xl flex-col px-4 pb-6">
          <div className="mt-4 flex items-center justify-between text-md text-slate-500">
            <span className="inline-flex items-center gap-2">
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                {current === "completed" ? "VYPLNENÉ" : "ROZPRACOVANÉ"}
              </span>
              <span className="text-slate-400">ID: 2024–SP–892</span>
            </span>
          </div>

          <div className="mt-6 flex-1 space-y-6 overflow-y-auto pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <TableSection
              title="Údaje o pozemkoch"
              leftHeader="Údaj"
              rightHeader="Hodnota / zdroj"
              rows={landRows}
              headerActions={
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2 rounded-full border-rose-100 bg-rose-50 px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm hover:bg-rose-100"
                  onClick={handleOpenMap}
                >
                  <Map className="h-4 w-4" />
                  Vybrať z katastrálnej mapy
                </Button>
              }
              values={landValues}
              onChangeValue={handleLandChange}
              onAutoFill={handleAutoFillLand}
            />

            <TableSection
              title="Územnoplánovacia dokumentácia"
              leftHeader="Dokumentácia"
              rightHeader="Stav / súbor"
              rows={planningRows}
              values={planningValues}
              onAutoFill={handleAutoFillPlanning}
            />

            <TableSection
              title="Mapové podklady"
              leftHeader="Druh mapy"
              rightHeader="Príloha"
              rows={mapsRows}
              values={mapsValues}
              onAutoFill={handleAutoFillMaps}
            />

            <TableSection
              title="Vlastné zameranie (povinné)"
              leftHeader="Druh podkladu"
              rightHeader="Príloha"
              rows={ownSurveyRows}
              values={ownSurveyValues}
              onAutoFill={handleAutoFillOwnSurvey}
            />
          </div>
        </div>

        <Dialog open={isMapDialogOpen} onOpenChange={setIsMapDialogOpen}>
          <DialogContent className="max-w-4xl border-none bg-transparent p-0 shadow-none">
            <div className="mx-auto w-full max-w-4xl rounded-xl bg-white p-6 shadow-2xl">
              <DialogHeader className="mb-3 text-center">
                <DialogTitle className="text-lg font-semibold text-slate-800">
                  Identifikačné údaje
                </DialogTitle>
              </DialogHeader>

              <div className="flex flex-col items-center gap-4">
                <div className="relative h-[380px] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                  {isMapLoading ? (
                    <GlossInlineLoader />
                  ) : (
                    <Image
                      src="/img/kataster.png"
                      alt="Katastrálna mapa"
                      fill
                      className="object-cover"
                    />
                  )}
                </div>

                <div className="mt-2 flex w-full justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full px-4 text-xs"
                  >
                    Resetovať výber
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="rounded-full px-4 text-xs"
                    onClick={handleConfirmFromMap}
                  >
                    Potvrdiť výber
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    </AppShell>
  );
}
