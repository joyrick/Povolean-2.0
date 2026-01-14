"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import {
  Activity,
  Search,
  FileText,
  Users,
  Building2,
  AlertTriangle,
  FileCheck,
  ExternalLink,
  MapPin,
  ChevronLeft,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/StatusBadge";
import { ParcelMap } from "@/components/ParcelMap";
import { BackButton } from "@/components/back-button";
import { Button } from "@/components/ui/button";
import { useSteps } from "@/context/steps-provider";

type ParcelOwner = {
  id: string;
  name: string;
  address: string;
  share: string;
};

type Parcel = {
  parcelNumber: string;
  landType: string;
  area: number;
  owners: ParcelOwner[];
  encumbrances: string[];
};

type Participant = {
  name: string;
  address: string;
  reason: string;
};

type CompanyCheck = {
  companyName: string;
  ico: string;
  isValid: boolean;
  status: string;
  details: string;
};

type AnalysisResult = {
  parcels: Parcel[];
  ownershipVerified: boolean;
  ownershipAnalysis: string;
  participants: Participant[];
  companyChecks: CompanyCheck[];
};

type AppView = "map" | "analysis";

type AppState = {
  view: AppView;
  isLoading: boolean;
  parcelInput: string;
  cadastralInput: string;
  applicantName: string;
  result: AnalysisResult | null;
  error: string | null;
};

// ---------- Mock helpers (would later be replaced by real services) ----------

async function fetchMockParcelData(
  parcelNumber: string,
  cadastral: string
): Promise<Parcel> {
  const baseArea = 300 + parcelNumber.length * 25;

  return {
    parcelNumber,
    landType:
      Number(parcelNumber.replace(/[^\d]/g, "")) % 2 === 0
        ? "Zastavané plochy a nádvoria"
        : "Záhrady",
    area: baseArea,
    owners: [
      {
        id: "1",
        name: "Ing. Ján Novák",
        address: "Kvetná 12, 821 01 " + cadastral,
        share: "1/2",
      },
      {
        id: "2",
        name: "Mgr. Petra Nováková",
        address: "Kvetná 12, 821 01 " + cadastral,
        share: "1/2",
      },
    ],
    encumbrances:
      parcelNumber.endsWith("1") || parcelNumber.endsWith("3")
        ? [
            "Vecné bremeno – právo prechodu a prejazdu v prospech susednej parcely",
          ]
        : [],
  };
}

async function analyzeConstructionCase(
  parcels: Parcel[],
  applicantName: string
): Promise<AnalysisResult> {
  const totalArea = parcels.reduce((acc, p) => acc + p.area, 0);
  const ownershipVerified = parcels.every((p) =>
    p.owners.some((o) =>
      o.name
        .toLowerCase()
        .includes(applicantName.toLowerCase().split(" ")[0] ?? "")
    )
  );

  const ownershipAnalysis = ownershipVerified
    ? `Žiadateľ ${applicantName} je identifikovaný ako vlastník alebo spoluvlastník všetkých analyzovaných parciel. Vlastnícke právo je možné považovať za preukázané, odporúča sa však doložiť aktuálne LV z katastra.`
    : `Žiadateľ ${applicantName} NIE JE evidovaný ako vlastník všetkých parciel. Je potrebné preukázať iné právo k pozemkom (napr. nájomná zmluva, súhlas vlastníkov, zmluva o budúcej kúpnej zmluve).`;

  const participants: Participant[] = [
    {
      name: applicantName || "Neznámy žiadateľ",
      address: "Adresa žiadateľa bude doplnená z návrhu",
      reason: "Stavebník / žiadateľ",
    },
    {
      name: "Mesto Bratislava – Mestská časť Ružinov",
      address: "Mierová 21, 827 05 Bratislava",
      reason: "Obec, v ktorej územnom obvode sa stavba nachádza",
    },
  ];

  const companyChecks: CompanyCheck[] =
    applicantName.toLowerCase().includes("s.r.o.") ||
    applicantName.toLowerCase().includes("a.s.")
      ? [
          {
            companyName: applicantName,
            ico: "35 123 456",
            isValid: true,
            status: "Subjekt je zapísaný v ORSR",
            details:
              "Spoločnosť je aktívna, bez zistených konkurzných alebo reštrukturalizačných konaní. Štatutárny zástupca je oprávnený konať samostatne.",
          },
        ]
      : [];

  return {
    parcels,
    ownershipVerified,
    ownershipAnalysis:
      ownershipAnalysis +
      ` Celková výmera analyzovaných parciel je približne ${totalArea} m².`,
    participants,
    companyChecks,
  };
}

// ---------- Icon helper ----------

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

// ---------- Page component ----------

export default function ConstructionCasePage(): ReactElement {
  const [state, setState] = useState<AppState>({
    view: "map",
    isLoading: false,
    parcelInput: "",
    cadastralInput: "Bratislava - Ružinov",
    applicantName: "",
    result: null,
    error: null,
  });

  const stepId = "stavz_s5";
  const { state: stepsState, setStepStatus } = useSteps();
  const current = stepsState[stepId]?.status ?? "not_started";
  const isCompleted = current === "completed";

  function handleToggleCompleted(): void {
    setStepStatus(stepId, isCompleted ? "not_started" : "completed");
  }

  function handleMapSelection(selectedNumbers: string[]): void {
    setState((prev) => ({
      ...prev,
      parcelInput: selectedNumbers.join(", "),
      view: "analysis",
    }));
  }

  function handleBackToMap(): void {
    setState((prev) => ({
      ...prev,
      view: "map",
      result: null,
      error: null,
    }));
  }

  async function handleAnalyze(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!state.parcelInput || !state.applicantName) return;

    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      result: null,
    }));

    try {
      const parcelNumbers = state.parcelInput
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const parcelsData: Parcel[] = await Promise.all(
        parcelNumbers.map((num) =>
          fetchMockParcelData(num, state.cadastralInput)
        )
      );

      const analysis = await analyzeConstructionCase(
        parcelsData,
        state.applicantName
      );

      setState((prev) => ({
        ...prev,
        isLoading: false,
        result: analysis,
      }));
    } catch (err) {
      console.error(err);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: "Nastala chyba pri analýze dát. Skúste to prosím znova.",
      }));
    }
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

      <main className="mx-auto flex h-[calc(100vh-5rem)] max-w-7xl flex-col px-4 pb-10 pt-4">
        <div className="flex-1 overflow-y-auto space-y-6 pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {state.view === "map" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md shadow-black/5">
              <ParcelMap onConfirmSelection={handleMapSelection} />
            </div>
          )}

          {state.view === "analysis" && (
            <div className="space-y-6 animate-fade-in-up">
              {/* Back link */}
              <button
                onClick={handleBackToMap}
                className="inline-flex items-center text-sm text-slate-500 transition-colors hover:text-blue-600"
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Späť na výber z mapy
              </button>

              {/* Input card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md shadow-black/5">
                <h2 className="mb-4 flex items-center text-lg font-semibold text-slate-900">
                  <Search className="mr-2 h-5 w-5 text-blue-600" />
                  Vstupné údaje konania
                </h2>
                <form
                  onSubmit={handleAnalyze}
                  className="grid grid-cols-1 gap-6 md:grid-cols-4"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Číslo parcely (C-KN)
                    </label>
                    <input
                      type="text"
                      value={state.parcelInput}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          parcelInput: e.target.value,
                        }))
                      }
                      placeholder="napr. 1234/5, 1234/6"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                      required
                    />
                    <p className="text-xs text-slate-400">
                      Automaticky vyplnené z mapy – môžete manuálne upraviť.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Katastrálne územie
                    </label>
                    <input
                      type="text"
                      value={state.cadastralInput}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          cadastralInput: e.target.value,
                        }))
                      }
                      placeholder="napr. Bratislava – Ružinov"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                      Meno stavebníka / žiadateľa
                    </label>
                    <input
                      type="text"
                      value={state.applicantName}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          applicantName: e.target.value,
                        }))
                      }
                      placeholder="Meno a priezvisko / Názov firmy"
                      className="w-full rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
                      required
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={state.isLoading}
                      className="flex h-[42px] w-full items-center justify-center rounded-full bg-blue-600 px-4 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition-transform duration-150 ease-out hover:scale-[1.02] hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
                    >
                      {state.isLoading ? (
                        <>
                          <Activity className="mr-2 h-5 w-5 animate-spin" />
                          Analyzujem…
                        </>
                      ) : (
                        <>
                          <Activity className="mr-2 h-5 w-5" />
                          Spustiť analýzu
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {state.error && (
                <div className="flex items-center rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
                  <AlertTriangle className="mr-3 h-5 w-5" />
                  {state.error}
                </div>
              )}

              {state.result && (
                <div className="grid gap-8 animate-fade-in lg:grid-cols-3">
                  {/* Left: C1 + C2 */}
                  <div className="space-y-8 lg:col-span-2">
                    {/* C1 */}
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md shadow-black/5">
                      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
                        <h3 className="flex items-center font-semibold text-slate-800">
                          <FileText className="mr-2 h-5 w-5 text-blue-500" />
                          C1. Majetkové pomery a listy vlastníctva
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-800">
                            Počet parciel: {state.result.parcels.length}
                          </span>
                          <button className="inline-flex items-center text-[11px] font-medium text-blue-600 hover:underline">
                            <FileCheck className="mr-1 h-3 w-3" />
                            Stiahnuť všetky LV
                          </button>
                        </div>
                      </div>
                      <div>
                        {state.result.parcels.map((parcel, index) => (
                          <div
                            key={parcel.parcelNumber}
                            className={`px-6 py-5 ${
                              index !== state.result.parcels.length - 1
                                ? "border-b border-slate-100"
                                : ""
                            }`}
                          >
                            <div className="mb-4 flex items-start justify-between">
                              <div>
                                <h4 className="flex items-center text-lg font-bold text-slate-900">
                                  <span className="mr-2 text-sm text-slate-400">
                                    #{index + 1}
                                  </span>
                                  Parcela {parcel.parcelNumber}
                                </h4>
                                <span className="mt-1 inline-block rounded bg-slate-100 px-2 py-1 font-mono text-xs text-slate-600">
                                  {parcel.landType}
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="font-mono text-lg text-slate-900">
                                  {parcel.area} m²
                                </span>
                              </div>
                            </div>

                            <div className="mb-4">
                              <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Vlastníci
                              </h5>
                              <div className="space-y-2">
                                {parcel.owners.map((owner) => (
                                  <div
                                    key={owner.id}
                                    className="flex items-start justify-between rounded border border-slate-100 bg-slate-50 p-2 text-sm"
                                  >
                                    <div>
                                      <p className="font-medium text-slate-900">
                                        {owner.name}
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        {owner.address}
                                      </p>
                                    </div>
                                    <div className="ml-2 whitespace-nowrap text-right">
                                      <span className="font-mono text-xs text-slate-600">
                                        {owner.share}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h5 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Ťarchy
                              </h5>
                              {parcel.encumbrances.length > 0 ? (
                                <ul className="space-y-1 rounded-lg border border-amber-100 bg-amber-50 p-3 text-xs text-amber-800">
                                  {parcel.encumbrances.map((e, i) => (
                                    <li
                                      key={i}
                                      className="flex items-start leading-snug"
                                    >
                                      <AlertTriangle className="mr-1.5 mt-0.5 h-3 w-3 flex-shrink-0" />
                                      {e}
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <span className="flex items-center text-xs text-slate-500">
                                  <CheckCircleIcon className="mr-1.5 h-3 w-3 text-emerald-500" />
                                  Bez evidovaných ťarch
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* C2 */}
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md shadow-black/5">
                      <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
                        <h3 className="flex items-center font-semibold text-slate-800">
                          <Building2 className="mr-2 h-5 w-5 text-purple-500" />
                          C2. Preukázanie práva k stavbe
                        </h3>
                      </div>
                      <div className="px-6 py-5">
                        <div className="mb-4 flex items-center justify-between">
                          <span className="text-sm text-slate-600">
                            Status overenia pre žiadateľa:{" "}
                            <strong>{state.applicantName}</strong>
                          </span>
                          <StatusBadge
                            status={
                              state.result.ownershipVerified
                                ? "success"
                                : "warning"
                            }
                            text={
                              state.result.ownershipVerified
                                ? "Vlastnícke právo preukázané"
                                : "Potrebné doložiť iné právo"
                            }
                          />
                        </div>
                        <div className="rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                          <p className="mb-1 font-semibold text-slate-900">
                            AI analýza:
                          </p>
                          {state.result.ownershipAnalysis}
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* Right: C3 + C4 */}
                  <div className="space-y-8">
                    {/* C3 */}
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md shadow-black/5">
                      <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
                        <h3 className="flex items-center font-semibold text-slate-800">
                          <Users className="mr-2 h-5 w-5 text-indigo-500" />
                          C3. Účastníci konania
                        </h3>
                      </div>
                      <div>
                        <ul className="divide-y divide-slate-100">
                          {state.result.participants.map((p, i) => (
                            <li
                              key={i}
                              className="p-4 transition-colors hover:bg-slate-50"
                            >
                              <div className="flex items-start">
                                <div className="mr-3 mt-0.5 rounded-full bg-indigo-100 p-1.5">
                                  <MapPin className="h-3 w-3 text-indigo-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-900">
                                    {p.name}
                                  </p>
                                  <p className="mb-1 text-xs text-slate-500">
                                    {p.address}
                                  </p>
                                  <span className="inline-flex items-center rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">
                                    {p.reason}
                                  </span>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                        <div className="border-t border-slate-100 bg-slate-50 px-6 py-3">
                          <button className="inline-flex items-center text-[11px] font-medium text-blue-600 hover:text-blue-800">
                            <FileCheck className="mr-1 h-3 w-3" />
                            Generovať zoznam do PDF
                          </button>
                        </div>
                      </div>
                    </section>

                    {/* C4 */}
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md shadow-black/5">
                      <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
                        <h3 className="flex items-center font-semibold text-slate-800">
                          <Search className="mr-2 h-5 w-5 text-teal-500" />
                          C4. Kontrola ORSR
                        </h3>
                      </div>
                      <div className="px-6 py-5">
                        {state.result.companyChecks.length === 0 ? (
                          <p className="text-center text-sm italic text-slate-500">
                            Žiadne právnické osoby neboli identifikované pre
                            krížovú kontrolu.
                          </p>
                        ) : (
                          <div className="space-y-4">
                            {state.result.companyChecks.map((check, i) => (
                              <div
                                key={i}
                                className="rounded-lg border border-slate-200 p-3"
                              >
                                <div className="mb-2 flex items-start justify-between">
                                  <div>
                                    <h4 className="text-sm font-bold text-slate-900">
                                      {check.companyName}
                                    </h4>
                                    <p className="font-mono text-xs text-slate-500">
                                      IČO: {check.ico}
                                    </p>
                                  </div>
                                  <StatusBadge
                                    status={check.isValid ? "success" : "error"}
                                    text={check.status}
                                  />
                                </div>
                                <p className="mt-2 border-t border-slate-100 pt-2 text-xs text-slate-600">
                                  {check.details}
                                </p>
                                <div className="mt-2 flex items-center text-[10px] text-slate-400">
                                  <ExternalLink className="mr-1 h-3 w-3" />
                                  Overené voči Obchodnému registru (mock)
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </section>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </AppShell>
  );
}
