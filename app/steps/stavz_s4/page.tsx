"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import {
  Loader2,
  Search,
  Play,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { BackButton } from "@/components/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { FileUpload } from "@/components/FileUpload";
import { ComplianceResults } from "@/components/ComplianceResults";
import { TechnicalResults } from "@/components/TechnicalResults";
import { DiscussionReportGenerator } from "@/components/DiscussionReportGenerator";

import {
  analyzeCompliance,
  analyzeTechnicalReport,
  generateDiscussionReport,
} from "@/components/services/geminiService";

import {
  MOCK_COMPLIANCE_RESULT,
  MOCK_TECHNICAL_RESULT,
  MOCK_DISCUSSION_REPORT,
} from "@/components/services/mockData";

import type {
  FileWithPreview,
  ProcessingError,
} from "@/types/stanoviska/stanoviska-state";
import { AppState_stavz_s4 } from "@/types/stanoviska/stanoviska-state";
import type {
  AnalysisResult,
  DiscussionReportData,
} from "@/types/stanoviska/environment-analysis";
import { useSteps } from "@/context/steps-provider";
import { GlossInlineLoader } from "@/components/GlossInlineLoader";

export default function StavPermitPage(): ReactElement {
  const [opinions, setOpinions] = useState<FileWithPreview[]>([]);
  const [discussionReport, setDiscussionReport] = useState<FileWithPreview[]>(
    []
  );
  const [technicalReport, setTechnicalReport] = useState<FileWithPreview[]>([]);
  const [appState, setAppState] = useState<AppState_stavz_s4>(
    AppState_stavz_s4.IDLE
  );
  const [generatedReportData, setGeneratedReportData] =
    useState<DiscussionReportData | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(
    null
  );
  const [error, setError] = useState<ProcessingError | null>(null);

  const stepId = "stavz_s4";
  const { state, setStepStatus } = useSteps();
  const current = state[stepId]?.status ?? "not_started";
  const isCompleted = current === "completed";

  function handleToggleCompleted(): void {
    setStepStatus(stepId, isCompleted ? "not_started" : "completed");
  }

  async function handleGenerateReport(): Promise<void> {
    if (opinions.length === 0) return;

    setAppState(AppState_stavz_s4.GENERATING_REPORT);
    setError(null);

    try {
      const data = await generateDiscussionReport(opinions);
      setGeneratedReportData(data);
      setAppState(AppState_stavz_s4.REPORT_GENERATED);
    } catch (err) {
      console.error(err);
      setAppState(AppState_stavz_s4.ERROR);
      setError({
        message: "Nastala chyba pri generovaní správy. Skúste to znova.",
      });
    }
  }

  function handleContinueToAnalysis(): void {
    if (!generatedReportData) return;

    const isDemoData =
      JSON.stringify(generatedReportData) ===
      JSON.stringify(MOCK_DISCUSSION_REPORT);

    const fileName = isDemoData
      ? "Demo_Sprava.json"
      : "Automaticky_vygenerovana_sprava.json";

    const blob = new Blob([JSON.stringify(generatedReportData, null, 2)], {
      type: "application/json",
    });
    const file = new File([blob], fileName, { type: "application/json" });
    const fileWithPreview = Object.assign(file, { preview: "" });

    setDiscussionReport([fileWithPreview]);
  }

  const canAnalyze =
    opinions.length > 0 &&
    discussionReport.length > 0 &&
    technicalReport.length > 0;

  async function handleAnalyze(): Promise<void> {
    if (!canAnalyze) return;

    setAppState(AppState_stavz_s4.ANALYZING);
    setError(null);

    const isDemoFlow =
      discussionReport[0]?.name === "Demo_Sprava.json" ||
      technicalReport[0]?.name === "Technicka_sprava.pdf";

    if (isDemoFlow) {
      setTimeout(() => {
        setAnalysisResults({
          compliance: MOCK_COMPLIANCE_RESULT,
          technical: MOCK_TECHNICAL_RESULT,
        });
        setAppState(AppState_stavz_s4.SUCCESS);
      }, 2000);
      return;
    }

    try {
      const [complianceResult, technicalResult] = await Promise.all([
        analyzeCompliance(opinions, discussionReport[0], technicalReport[0]),
        analyzeTechnicalReport(technicalReport[0]),
      ]);

      setAnalysisResults({
        compliance: complianceResult,
        technical: technicalResult,
      });
      setAppState(AppState_stavz_s4.SUCCESS);
    } catch (err) {
      console.error(err);
      setAppState(AppState_stavz_s4.ERROR);
      setError({ message: "Nastala chyba pri spracovaní dokumentov." });
    }
  }

  function runDemo(): void {
    setAnalysisResults(null);
    setDiscussionReport([]);
    setTechnicalReport([]);

    setOpinions([
      new File(["mock"], "Stanovisko_Hazz.pdf", {
        type: "application/pdf",
      }) as FileWithPreview,
    ]);
    setAppState(AppState_stavz_s4.GENERATING_REPORT);

    setTimeout(() => {
      setGeneratedReportData(MOCK_DISCUSSION_REPORT);
      setAppState(AppState_stavz_s4.REPORT_GENERATED);

      setTechnicalReport([
        new File(["mock"], "Technicka_sprava.pdf", {
          type: "application/pdf",
        }) as FileWithPreview,
      ]);
    }, 1500);
  }

  function reset(): void {
    setOpinions([]);
    setDiscussionReport([]);
    setTechnicalReport([]);
    setGeneratedReportData(null);
    setAnalysisResults(null);
    setAppState(AppState_stavz_s4.IDLE);
    setError(null);
    setStepStatus(stepId, "not_started");
  }

  const isStep1Active =
    appState === AppState_stavz_s4.IDLE ||
    appState === AppState_stavz_s4.GENERATING_REPORT ||
    appState === AppState_stavz_s4.REPORT_GENERATED;

  const isStep2Visible =
    (discussionReport.length > 0 &&
      appState === AppState_stavz_s4.REPORT_GENERATED) ||
    appState === AppState_stavz_s4.ANALYZING ||
    appState === AppState_stavz_s4.SUCCESS;

  const isBusy =
    appState === AppState_stavz_s4.GENERATING_REPORT ||
    appState === AppState_stavz_s4.ANALYZING;

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

      <div className="mx-auto flex h-[calc(100vh-5rem)] max-w-7xl flex-col px-4 pb-6">
        <div className="mt-4 flex-1 overflow-y-auto pr-2 pb-2 pt-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <Card className="border-slate-200 animate-fade-in">
            <CardHeader className="flex flex-col gap-3 border-b border-slate-100 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-lg">
                  Správa o prerokovaní a AI analýza súladu
                </CardTitle>
                <p className="mt-1 text-md text-slate-500">
                  Vygeneruj &quot;Správu o prerokovaní stavebného zámeru&quot; z
                  podkladov a následne skontroluj súlad s technickou správou.
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      isCompleted
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {isCompleted ? "VYPLNENÉ" : "ROZPRACOVANÉ"}
                  </span>
                  <span className="text-slate-400 uppercase tracking-wide">
                    Krok: STAVZ S4
                  </span>
                </span>
                {appState === AppState_stavz_s4.IDLE && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={runDemo}
                  >
                    <Play className="mr-1 h-3 w-3" fill="currentColor" />
                    Spustiť demo
                  </Button>
                )}
              </div>
            </CardHeader>

            <CardContent className="px-0 py-0">
              <div className="flex flex-col gap-8 px-4 pb-4 pt-4">
                <div className="flex items-center justify-center">
                  <div
                    className={`flex items-center gap-2 ${
                      isStep1Active && !isStep2Visible
                        ? "font-bold text-blue-600"
                        : "text-slate-500"
                    }`}
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border text-xs">
                      1
                    </span>
                    <span>Generovanie správy</span>
                  </div>

                  <div className="mx-4 h-px w-12 bg-slate-300" />

                  <div
                    className={`flex items-center gap-2 ${
                      appState === AppState_stavz_s4.SUCCESS || isStep2Visible
                        ? "font-bold text-blue-600"
                        : "text-slate-400"
                    }`}
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border text-xs">
                      2
                    </span>
                    <span>Analýza súladu</span>
                  </div>
                </div>

                <div className="space-y-8">
                  {appState !== AppState_stavz_s4.SUCCESS &&
                    !isStep2Visible && (
                      <section className="animate-fade-in transition-all duration-500">
                        <div className="rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
                          <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/50 px-6 py-4">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <div>
                              <h2 className="text-lg font-bold text-slate-800">
                                1. Vstupné stanoviská
                              </h2>
                              <p className="text-xs text-slate-500">
                                Nahrajte stanoviská pre vygenerovanie Správy o
                                prerokovaní
                              </p>
                            </div>
                          </div>

                          <div className="p-8">
                            <FileUpload
                              id="opinions-step1"
                              label="Stanoviská dotknutých orgánov"
                              subLabel="Všetky získané vyjadrenia (PDF, JPG)"
                              multiple
                              files={opinions}
                              onFilesChange={setOpinions}
                              required
                            />
                          </div>

                          <div className="flex items-center justify-between rounded-b-xl border-t border-slate-100 bg-slate-50 px-6 py-4">
                            <p className="text-xs text-slate-500">
                              Spracováva sa podľa vyhlášky č. 60/2025 Z. z.
                            </p>

                            <Button
                              type="button"
                              onClick={handleGenerateReport}
                              disabled={
                                opinions.length === 0 ||
                                appState === AppState_stavz_s4.GENERATING_REPORT
                              }
                              className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold shadow-md transition-all disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                            >
                              {appState ===
                              AppState_stavz_s4.GENERATING_REPORT ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <FileText className="h-4 w-4" />
                              )}
                              Vygenerovať správu o prerokovaní
                            </Button>
                          </div>
                        </div>
                      </section>
                    )}

                  {appState === AppState_stavz_s4.REPORT_GENERATED &&
                    generatedReportData &&
                    !isStep2Visible && (
                      <DiscussionReportGenerator
                        data={generatedReportData}
                        onContinue={handleContinueToAnalysis}
                      />
                    )}

                  {isStep2Visible && appState !== AppState_stavz_s4.SUCCESS && (
                    <section className="mt-2 animate-fade-in">
                      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
                        <div className="absolute left-0 top-0 h-full w-1 bg-blue-600" />

                        <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
                          <Search className="h-5 w-5 text-blue-600" />
                          <div>
                            <h2 className="text-lg font-bold text-slate-800">
                              2. Finálna kontrola súladu
                            </h2>
                            <p className="text-xs text-slate-500">
                              Doplňte Technickú spravu pre kompletnú analýzu
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-8 p-6 md:grid-cols-2">
                          <div className="opacity-80">
                            <FileUpload
                              id="discussion"
                              label="Správa o prerokovaní"
                              subLabel="Automaticky vygenerovaná"
                              files={discussionReport}
                              onFilesChange={setDiscussionReport}
                              disabled
                              required
                            />
                            <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-green-600">
                              <CheckCircle2 size={12} />
                              Úspešne vygenerované z kroku 1
                            </div>
                          </div>

                          <div>
                            <FileUpload
                              id="technical"
                              label="Technická správa projektu"
                              subLabel="Súhrnná technická správa"
                              files={technicalReport}
                              onFilesChange={setTechnicalReport}
                              required
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-4 rounded-b-xl border-t border-slate-100 bg-slate-50 px-6 py-4">
                          <Button
                            type="button"
                            onClick={handleAnalyze}
                            disabled={
                              !canAnalyze ||
                              appState === AppState_stavz_s4.ANALYZING
                            }
                            className="flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold shadow-md transition-all active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                          >
                            {appState === AppState_stavz_s4.ANALYZING ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Search className="h-4 w-4" />
                            )}
                            Spustiť hĺbkovú analýzu
                          </Button>
                        </div>
                      </div>
                    </section>
                  )}

                  {appState === AppState_stavz_s4.SUCCESS &&
                    analysisResults && (
                      <section className="space-y-6 animate-fade-in">
                        <div className="mb-2 flex items-center justify-between">
                          <h2 className="text-2xl font-bold text-slate-800">
                            Výsledky analýzy
                          </h2>
                          <div className="text-sm text-slate-500">
                            Generované: {new Date().toLocaleDateString("sk-SK")}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                          <div className="space-y-6 xl:col-span-2">
                            <ComplianceResults
                              data={analysisResults.compliance}
                            />
                          </div>
                          <div className="space-y-6 xl:col-span-1">
                            <TechnicalResults
                              data={analysisResults.technical}
                            />
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-full"
                            onClick={reset}
                          >
                            Začať nový projekt
                          </Button>
                        </div>
                      </section>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {isBusy && (
        <div className="pointer-events-auto fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="mx-4 flex w-full max-w-sm flex-col items-center rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-2xl">
            <div className="mb-4">
              <GlossInlineLoader />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-red-800 shadow-lg animate-fade-in">
          <AlertCircle className="h-5 w-5" />
          <span>{error.message}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-2 rounded-full p-1 hover:bg-red-100"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </AppShell>
  );
}
