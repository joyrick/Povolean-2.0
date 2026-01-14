"use client";

import type { ChangeEvent, ReactElement } from "react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { BackButton } from "@/components/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSteps } from "@/context/steps-provider";
import { UploadCloud, X } from "lucide-react";
import { GlossInlineLoader } from "@/components/GlossInlineLoader";

const STEP_ID = "vegetation_check";

type Mode = "upload" | "result";

type UploadCardProps = {
  title: string;
  file: File | null;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
};

function UploadCard({
  title,
  file,
  onChange,
  onClear,
}: UploadCardProps): ReactElement {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  const hasPreview = file !== null && previewUrl !== null;

  return (
    <Card className="flex flex-col rounded-2xl border border-dashed border-slate-200 bg-white shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-4 border-b bg-slate-50 px-6 py-4">
        <CardTitle className="text-lg font-semibold tracking-wide text-slate-800">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 py-4">
        {!hasPreview && (
          <label className="flex min-h-[260px] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl bg-slate-50 py-8 text-center transition duration-700 hover:bg-slate-100">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
              <UploadCloud className="h-7 w-7 text-blue-500" />
            </div>
            <div className="text-base font-medium text-slate-800">
              Kliknite pre nahranie obrázka
            </div>
            <div className="text-xs text-slate-500">JPG, PNG</div>
            <input
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={onChange}
            />
          </label>
        )}

        {hasPreview && (
          <div className="relative flex w-full flex-col items-center justify-center rounded-2xl bg-slate-50 p-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="absolute right-4 top-4 h-7 w-7 rounded-full border-slate-300 bg-white/90"
              onClick={onClear}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
            <img
              src={previewUrl}
              alt={title}
              className="max-h-[420px] w-full rounded-xl object-contain"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type RightPanelPhase = "upload" | "loading" | "image";

type RightPanelProps = {
  mode: Mode;
  file: File | null;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
};

function RightPanel({
  mode,
  file,
  onChange,
  onClear,
}: RightPanelProps): ReactElement {
  const [phase, setPhase] = useState<RightPanelPhase>("upload");
  const [animateIn, setAnimateIn] = useState<boolean>(false);

  useEffect(() => {
    if (mode === "upload") {
      setPhase("upload");
      setAnimateIn(false);
      return;
    }
    setPhase("loading");
    setAnimateIn(false);
    const loadingTimer = window.setTimeout(() => {
      setPhase("image");
    }, 3000);
    return () => {
      window.clearTimeout(loadingTimer);
    };
  }, [mode]);

  useEffect(() => {
    if (phase !== "image") {
      return;
    }
    setAnimateIn(false);
    const t = window.setTimeout(() => {
      setAnimateIn(true);
    }, 10);
    return () => window.clearTimeout(t);
  }, [phase]);

  if (phase === "upload") {
    return (
      <UploadCard
        title="Satelitná ortofoto mapa"
        file={file}
        onChange={onChange}
        onClear={onClear}
      />
    );
  }

  if (phase === "loading") {
    return (
      <Card className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b bg-slate-50 px-6 py-4">
          <CardTitle className="text-lg font-semibold tracking-wide text-slate-800">
            Pripravujem porovnanie
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 py-4">
          <GlossInlineLoader label="Analyzujem vegetáciu…" />
        </CardContent>
      </Card>
    );
  }

  const imageClassName = animateIn
    ? "max-h-[420px] w-full rounded-xl object-contain opacity-100 blur-0 transition-all duration-700 ease-out"
    : "max-h-[420px] w-full rounded-xl object-contain opacity-0 blur-md transition-all duration-700 ease-out";

  return (
    <Card className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b bg-slate-50 px-6 py-4">
        <CardTitle className="text-lg font-semibold tracking-wide text-slate-800">
          Výsledok porovnania
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 py-4">
        <div className="flex min-h-[260px] w-full items-center justify-center rounded-2xl bg-slate-50 p-3">
          <img
            src="/img/comparison.png"
            alt="Porovnanie vegetácie"
            className={imageClassName}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default function VegetationCheckPage(): ReactElement {
  const { state, setStepStatus } = useSteps();
  const current = state[STEP_ID]?.status ?? "not_started";
  const isCompleted = current === "completed";

  const [coordFile, setCoordFile] = useState<File | null>(null);
  const [satFile, setSatFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>("upload");

  const canCompare = coordFile !== null && satFile !== null;

  function handleToggleCompleted(): void {
    setStepStatus(STEP_ID, isCompleted ? "not_started" : "completed");
  }

  function handleCoordChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0] ?? null;
    setCoordFile(file);
  }

  function handleSatChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0] ?? null;
    setSatFile(file);
  }

  function clearCoord(): void {
    setCoordFile(null);
  }

  function clearSat(): void {
    setSatFile(null);
  }

  function handleCompareClick(): void {
    if (mode === "upload") {
      if (!canCompare) return;
      setMode("result");
      return;
    }
    setCoordFile(null);
    setSatFile(null);
    setMode("upload");
  }

  const compareLabel =
    mode === "upload" ? "Porovnať súlad" : "Porovnať znova a resetovať";

  const compareDisabled = mode === "upload" && !canCompare;

  return (
    <AppShell>
      <PageHeader
        title="Kontrola súladu vegetácie"
        subtitle="Skontrolujte, či sú všetky stromy zo satelitnej snímky správne zakreslené v koordinačnej situácii."
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
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-0 pb-10">
        <div className="mt-4 flex items-center justify-between text-base text-slate-600">
          <span className="inline-flex items-center gap-2">
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-amber-800">
              {current === "completed" ? "VYPLNENÉ" : "ROZPRACOVANÉ"}
            </span>
            <span className="text-slate-400">ID: 2024–SP–895</span>
          </span>
        </div>

        <div className="mt-8 flex flex-1 flex-col gap-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <UploadCard
              title="Koordinačná situácia"
              file={coordFile}
              onChange={handleCoordChange}
              onClear={clearCoord}
            />
            <RightPanel
              mode={mode}
              file={satFile}
              onChange={handleSatChange}
              onClear={clearSat}
            />
          </div>

          <div className="flex justify-center">
            <Button
              type="button"
              className="flex w-64 items-center justify-center rounded-full bg-blue-600 text-base font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
              disabled={compareDisabled}
              onClick={handleCompareClick}
            >
              {compareLabel}
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
