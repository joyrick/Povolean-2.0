"use client";

import type { ChangeEvent, ReactElement } from "react";
import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Sparkles, AlertCircle } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { BackButton } from "@/components/back-button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSteps } from "@/context/steps-provider";
import { GlossInlineLoader } from "@/components/GlossInlineLoader";

import type { ProjectFormB2B6B7CE } from "@/types/form";
import { EMPTY_PROJECT_FORM_B2B6B7CE } from "@/types/form";
import type { OrchestratorOutput } from "@/types/ai/ai";

type RawB2 = {
  nazov_stavby?: string;
  lokalita?: string;
  investor?: string;
  ucel_stavby?: string;
  charakter_prevadzky?: string;
  zakladne_rozmery?: {
    zastavana_plocha_ZP?: string;
    podlaznost?: string;
    vyska_stavby?: string;
    tvar_strechy?: string;
    objem?: string;
    materialove_riesenie?: string;
  };
  kapacity?: {
    pocet_apartmanov?: string;
    pocet_izbovosti?: string;
    počet_osob?: string;
    počet_parkovacich_miest?: string;
    uzitkova_plocha?: string;
  };
  popis_podlazi_a_dispozicie?: string;
  prevadzka_zariadenia_technicke_vybavenie?: string;
  liniove_stavby_a_napojenia?: string;
  ostatne_overovacie_udaje?: string;
};

type RawB6 = {
  plosne_udaje?: {
    zastavana_plocha_ZP?: string;
    uzitkova_plocha_UZP?: string;
    podlazna_plocha?: string;
    obostavany_priestor?: string;
  };
  funkcne_kapacity?: {
    pocet_bytov_apartmanov?: string;
    pocet_lozok?: string;
    kapacita_osob?: string;
    pocet_pracovisk_prevadzok?: string;
  };
  kapacity_medii?: {
    elektrina?: string;
    plyn?: string;
    voda?: string;
    teplo?: string;
    vzduchotechnika?: string;
  };
  potreba_vody_odpadove_vody_dazdove?: {
    potreba_vody?: string;
    odpadove_vody?: string;
    dazdove_vody?: string;
  };
  suroviny_materialy_mnozstva?: string;
};

type RawB7 = {
  urbanisticko_architektonicka_koncepcia?: string;
  technicke_a_energeticke_riesenie?: string;
  vnutorne_prostredie?: string;
  poziadavky_zakladnych_poziadavkov_stavieb?: string;
  existujuce_siete_objekty_napojenia?: string;
  zasobovanie_energiami_a_vodou_odvedenie?: string;
  technicka_infrastruktura_dopravne_napojenia?: string;
  hospodarenie_so_zrazkovou_vodou?: string;
  terenne_upravy_zeleň_udrzatelnost?: string;
  doprava_parkovanie_logistika?: string;
  harmonogram_vystavby_bozp_bezpecnostne_opatrenia?: string;
};

type RawC = {
  widerContext?: boolean;
  coordinationPlan?: boolean;
  cadastralBasePlan?: boolean;
  stakingOutPlan?: boolean;
  specialPlan?: boolean;
};

type RawE = {
  geodeticke_zameranie?: {
    prilozene?: boolean;
    popis?: string[] | string;
  };
  poziarnobezpecnostne_riesenie?: {
    prilozene?: boolean;
    poznamka?: string;
  };
  energeticka_hospodarnost_building?: {
    prilozene?: boolean;
    popis?: string;
  };
  externe_vplyvy?: {
    prilozene?: boolean;
  };
  dalsie_prieskumy?: {
    prilozene?: boolean;
    zoznam_prieskumov?: string[];
  };
  likvidacia_odpadov_plan?: {
    prilozene?: boolean;
    autor?: string;
  };
  poznamky?: string;
};

type RawProjectForm = {
  B2?: RawB2;
  B6?: RawB6;
  B7?: RawB7;
  C?: RawC;
  E?: RawE;
};

function joinNonEmpty(parts: unknown[]): string {
  return parts
    .filter((p): p is string => typeof p === "string" && p.trim() !== "")
    .join("\n");
}

function mapRawToProjectForm(raw: RawProjectForm): ProjectFormB2B6B7CE {
  const base = EMPTY_PROJECT_FORM_B2B6B7CE;

  const b2 = raw.B2 ?? {};
  const b6 = raw.B6 ?? {};
  const b7 = raw.B7 ?? {};
  const c = raw.C ?? {};
  const e = raw.E ?? {};

  const zakladne = b2.zakladne_rozmery ?? {};
  const kapacity = b2.kapacity ?? {};

  const purposeOfBuilding = joinNonEmpty([
    b2.nazov_stavby,
    b2.lokalita,
    b2.investor,
    b2.ucel_stavby,
    b2.charakter_prevadzky,
  ]);

  const basicDimensionsAndCapacities = joinNonEmpty([
    zakladne.zastavana_plocha_ZP
      ? `Zastavaná plocha: ${zakladne.zastavana_plocha_ZP}`
      : undefined,
    zakladne.podlaznost ? `Podlažnosť: ${zakladne.podlaznost}` : undefined,
    zakladne.vyska_stavby
      ? `Výška stavby: ${zakladne.vyska_stavby}`
      : undefined,
    zakladne.tvar_strechy
      ? `Tvar strechy: ${zakladne.tvar_strechy}`
      : undefined,
    zakladne.objem ? `Obostavaný priestor: ${zakladne.objem}` : undefined,
    zakladne.materialove_riesenie
      ? `Materiálové riešenie: ${zakladne.materialove_riesenie}`
      : undefined,
    kapacity.pocet_apartmanov
      ? `Počet apartmánov: ${kapacity.pocet_apartmanov}`
      : undefined,
    kapacity.pocet_izbovosti
      ? `Izbovosť: ${kapacity.pocet_izbovosti}`
      : undefined,
    kapacity.počet_osob ? `Počet osôb: ${kapacity.počet_osob}` : undefined,
    kapacity.počet_parkovacich_miest
      ? `Počet parkovacích miest: ${kapacity.počet_parkovacich_miest}`
      : undefined,
    kapacity.uzitkova_plocha
      ? `Úžitková plocha: ${kapacity.uzitkova_plocha}`
      : undefined,
  ]);

  const plosne = b6.plosne_udaje ?? {};
  const funkcne = b6.funkcne_kapacity ?? {};
  const media = b6.kapacity_medii ?? {};
  const vody = b6.potreba_vody_odpadove_vody_dazdove ?? {};

  const areaVolumeData = joinNonEmpty([
    plosne.zastavana_plocha_ZP
      ? `Zastavaná plocha: ${plosne.zastavana_plocha_ZP}`
      : undefined,
    plosne.uzitkova_plocha_UZP
      ? `Úžitková plocha: ${plosne.uzitkova_plocha_UZP}`
      : undefined,
    plosne.podlazna_plocha
      ? `Podlažná plocha: ${plosne.podlazna_plocha}`
      : undefined,
    plosne.obostavany_priestor
      ? `Obostavaný priestor: ${plosne.obostavany_priestor}`
      : undefined,
  ]);

  const functionalCapacities = joinNonEmpty([
    funkcne.pocet_bytov_apartmanov
      ? `Počet bytov/apartmánov: ${funkcne.pocet_bytov_apartmanov}`
      : undefined,
    funkcne.pocet_lozok ? `Počet lôžok: ${funkcne.pocet_lozok}` : undefined,
    funkcne.kapacita_osob
      ? `Kapacita osôb: ${funkcne.kapacita_osob}`
      : undefined,
    funkcne.pocet_pracovisk_prevadzok
      ? `Počet pracovísk/prevádzok: ${funkcne.pocet_pracovisk_prevadzok}`
      : undefined,
  ]);

  const energyAndMediaCapacities = joinNonEmpty([
    media.elektrina ? `Elektrina: ${media.elektrina}` : undefined,
    media.plyn ? `Plyn: ${media.plyn}` : undefined,
    media.voda ? `Voda: ${media.voda}` : undefined,
    media.teplo ? `Teplo: ${media.teplo}` : undefined,
    media.vzduchotechnika
      ? `Vzduchotechnika: ${media.vzduchotechnika}`
      : undefined,
  ]);

  const waterDemand = joinNonEmpty([
    vody.potreba_vody ? `Potřeba vody: ${vody.potreba_vody}` : undefined,
    vody.odpadove_vody ? `Odpadové vody: ${vody.odpadove_vody}` : undefined,
    vody.dazdove_vody ? `Dažďové vody: ${vody.dazdove_vody}` : undefined,
    b6.suroviny_materialy_mnozstva
      ? `Suroviny a materiály: ${b6.suroviny_materialy_mnozstva}`
      : undefined,
  ]);

  const purposeB7 = b7.urbanisticko_architektonicka_koncepcia ?? "";
  const techEnergy = joinNonEmpty([
    b7.technicke_a_energeticke_riesenie,
    b7.poziadavky_zakladnych_poziadavkov_stavieb,
  ]);
  const indoorEnv = b7.vnutorne_prostredie ?? "";
  const trafficParking = joinNonEmpty([
    b7.doprava_parkovanie_logistika,
    b7.technicka_infrastruktura_dopravne_napojenia,
  ]);

  const geodeticProvided = Boolean(e.geodeticke_zameranie?.prilozene);
  const fireSafetyProvided = Boolean(
    e.poziarnobezpecnostne_riesenie?.prilozene
  );
  const energyProvided = Boolean(
    e.energeticka_hospodarnost_building?.prilozene
  );
  const extraSurveysProvided = Boolean(e.dalsie_prieskumy?.prilozene);
  const extraSurveysDescription = Array.isArray(
    e.dalsie_prieskumy?.zoznam_prieskumov
  )
    ? e.dalsie_prieskumy?.zoznam_prieskumov.join("; ")
    : "";

  const mapped: ProjectFormB2B6B7CE = {
    ...base,
    summaryB2: {
      ...base.summaryB2,
      purposeOfBuilding,
      basicDimensionsAndCapacities,
      floorsDescription: b2.popis_podlazi_a_dispozicie ?? "",
      operationAndEquipmentDescription: joinNonEmpty([
        b2.prevadzka_zariadenia_technicke_vybavenie,
        b2.liniove_stavby_a_napojenia,
        b2.ostatne_overovacie_udaje,
      ]),
    },
    summaryB6: {
      ...base.summaryB6,
      data: {
        ...base.summaryB6.data,
        areaVolumeData,
        functionalCapacities,
        energyAndMediaCapacities,
        waterDemand,
      },
    },
    summaryB7: {
      ...base.summaryB7,
      urbanArchitecturalTechnicalConcept: purposeB7,
      operationTechnicalEnergyTechnologyDescription: techEnergy,
      indoorEnvironmentAssurance: indoorEnv,
      trafficConnectionAndParking: trafficParking,
    },
    situationalDrawingsC: {
      ...base.situationalDrawingsC,
      widerContext: {
        ...base.situationalDrawingsC.widerContext,
        required: Boolean(c.widerContext),
      },
      coordinationPlan: {
        ...base.situationalDrawingsC.coordinationPlan,
      },
    },
    attachmentsE: {
      ...base.attachmentsE,
      required: {
        ...base.attachmentsE.required,
        geodeticSurveyProvided: geodeticProvided,
        fireSafetySolutionProvided: fireSafetyProvided,
      },
      optional: {
        ...base.attachmentsE.optional,
        energyPerformanceAssessmentProvided: energyProvided,
        additionalSurveysAndReportsProvided: extraSurveysProvided,
        additionalSurveysAndReportsDescription: extraSurveysDescription,
      },
    },
  };

  return mapped;
}

async function extractProjectFormFromFile(
  file: File
): Promise<ProjectFormB2B6B7CE> {
  const formData = new FormData();
  formData.append("files", file);

  const res = await fetch("/api/forms/b2b6b7ce", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    const message =
      errorBody &&
      typeof errorBody === "object" &&
      "message" in errorBody &&
      typeof (errorBody as { message?: unknown }).message === "string"
        ? (errorBody as { message: string }).message
        : "AI extrakcia zlyhala";
    throw new Error(message);
  }

  const json = (await res.json()) as OrchestratorOutput;

  if (json.task !== "extract_b2b6b7ce" || !json.projectFormB2B6B7CE) {
    throw new Error("Neplatná odpoveď AI orchestrátora");
  }

  const raw = json.projectFormB2B6B7CE as unknown as RawProjectForm;
  return mapRawToProjectForm(raw);
}

export default function SummaryB2B6B7CEPage(): ReactElement {
  const stepId = "summary_b2b6b7ce";
  const { state, setStepStatus } = useSteps();
  const current = state[stepId]?.status ?? "not_started";
  const isCompleted = current === "completed";

  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState<ProjectFormB2B6B7CE>(
    EMPTY_PROJECT_FORM_B2B6B7CE
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleToggleCompleted(): void {
    setStepStatus(stepId, isCompleted ? "not_started" : "completed");
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>): void {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
  }

  function updateForm(partial: Partial<ProjectFormB2B6B7CE>): void {
    setForm((prev) => ({ ...prev, ...partial }));
  }

  async function handleAutoFillFromFile(): Promise<void> {
    if (!file) {
      setErrorMsg("Najprv nahraj súbor so súhrnnou technickou správou.");
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const data = await extractProjectFormFromFile(file);
      setForm(data);
    } catch (error) {
      setErrorMsg(
        error instanceof Error
          ? error.message
          : "AI extrakcia zlyhala. Skús to znova."
      );
    } finally {
      setIsLoading(false);
    }
  }

  const fileLabel =
    file !== null
      ? file.name.length > 40
        ? `${file.name.slice(0, 37)}...`
        : file.name
      : "Vybrať PDF so súhrnnou technickou správou";

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
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
            <div className="flex flex-col gap-1 text-sm text-slate-500">
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
                <span className="text-xs uppercase tracking-wide text-slate-400">
                  Súhrnná technická správa – B2, B6, B7, C, E
                </span>
              </span>
              <p className="text-xs text-slate-500">
                Nahraj finálnu STS vo formáte PDF a nechaj AI predvyplniť
                kľúčové časti formulára.
              </p>
            </div>

            <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
              <label className="relative flex h-9 cursor-pointer items-center justify-between gap-3 rounded-full border border-slate-200 bg-white px-3 text-xs text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="max-w-[14rem] truncate font-medium">
                    {fileLabel}
                  </span>
                </div>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                  PDF / TXT
                </span>
                <Input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileChange}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </label>

              <Button
                type="button"
                size="sm"
                className="flex h-9 items-center gap-2 rounded-full bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                onClick={() => void handleAutoFillFromFile()}
                disabled={isLoading || !file}
              >
                <Sparkles className="h-4 w-4" />
                Automaticky vyplniť
              </Button>
            </div>
          </div>

          {errorMsg !== null && (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="mt-6 flex-1 space-y-6 overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between gap-4 border-b bg-slate-50/80 px-5 py-3">
                <div className="flex flex-col gap-1">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-900">
                    <FileText className="h-4 w-4 text-blue-600" />
                    B2) Základné údaje o zámere
                  </CardTitle>
                  <p className="text-xs text-slate-500">
                    Zhrnutie účelu stavby, hlavných parametrov a koncepcie
                    využitia.
                  </p>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 px-5 py-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">
                    Účel stavby a investor
                  </Label>
                  <Textarea
                    className="min-h-[90px] resize-none text-xs"
                    placeholder="Zhrni účel stavby, lokalitu a investora."
                    value={form.summaryB2.purposeOfBuilding}
                    onChange={(e) =>
                      updateForm({
                        summaryB2: {
                          ...form.summaryB2,
                          purposeOfBuilding: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">
                    Základné rozmery a kapacity
                  </Label>
                  <Textarea
                    className="min-h-[90px] resize-none text-xs"
                    placeholder="Zastavaná plocha, výška, podlažnosť, počty bytov/apartmánov, parkovanie."
                    value={form.summaryB2.basicDimensionsAndCapacities}
                    onChange={(e) =>
                      updateForm({
                        summaryB2: {
                          ...form.summaryB2,
                          basicDimensionsAndCapacities: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">
                    Dispozícia a podlažia
                  </Label>
                  <Textarea
                    className="min-h-[90px] resize-none text-xs"
                    placeholder="Stručne popíš riešenie jednotlivých podlaží a dispozíciu."
                    value={form.summaryB2.floorsDescription}
                    onChange={(e) =>
                      updateForm({
                        summaryB2: {
                          ...form.summaryB2,
                          floorsDescription: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">
                    Prevádzka a technické vybavenie
                  </Label>
                  <Textarea
                    className="min-h-[90px] resize-none text-xs"
                    placeholder="Prevádzka objektu, technické a technologické vybavenie, napojenie na siete."
                    value={form.summaryB2.operationAndEquipmentDescription}
                    onChange={(e) =>
                      updateForm({
                        summaryB2: {
                          ...form.summaryB2,
                          operationAndEquipmentDescription: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between gap-4 border-b bg-slate-50/80 px-5 py-3">
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-sm font-semibold tracking-wide text-slate-900">
                    B6) Kapacitné údaje
                  </CardTitle>
                  <p className="text-xs text-slate-500">
                    Plošné, objemové, prevádzkové a energetické kapacity
                    objektu.
                  </p>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 px-5 py-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">
                    Plošné a objemové údaje
                  </Label>
                  <Textarea
                    className="min-h-[80px] resize-none text-xs"
                    placeholder="Zastavaná, úžitková a podlažná plocha, obostavaný priestor."
                    value={form.summaryB6.data.areaVolumeData}
                    onChange={(e) =>
                      updateForm({
                        summaryB6: {
                          ...form.summaryB6,
                          data: {
                            ...form.summaryB6.data,
                            areaVolumeData: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">
                    Funkčné kapacity
                  </Label>
                  <Textarea
                    className="min-h-[80px] resize-none text-xs"
                    placeholder="Počet bytov/apartmánov, lôžok, osôb, pracovísk/prevádzok."
                    value={form.summaryB6.data.functionalCapacities}
                    onChange={(e) =>
                      updateForm({
                        summaryB6: {
                          ...form.summaryB6,
                          data: {
                            ...form.summaryB6.data,
                            functionalCapacities: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">
                    Kapacity médií
                  </Label>
                  <Textarea
                    className="min-h-[80px] resize-none text-xs"
                    placeholder="Elektrina, teplo, voda, plyn, vzduchotechnika a ich predpokladané odbery."
                    value={form.summaryB6.data.energyAndMediaCapacities}
                    onChange={(e) =>
                      updateForm({
                        summaryB6: {
                          ...form.summaryB6,
                          data: {
                            ...form.summaryB6.data,
                            energyAndMediaCapacities: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">
                    Voda, odpadové vody, suroviny
                  </Label>
                  <Textarea
                    className="min-h-[80px] resize-none text-xs"
                    placeholder="Potreba vody, odvedenie odpadových a zrážkových vôd, spotreba surovín."
                    value={form.summaryB6.data.waterDemand}
                    onChange={(e) =>
                      updateForm({
                        summaryB6: {
                          ...form.summaryB6,
                          data: {
                            ...form.summaryB6.data,
                            waterDemand: e.target.value,
                          },
                        },
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between gap-4 border-b bg-slate-50/80 px-5 py-3">
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-sm font-semibold tracking-wide text-slate-900">
                    B7) Koncepcia a technické riešenie
                  </CardTitle>
                  <p className="text-xs text-slate-500">
                    Urbanistické, architektonické a technické riešenie, doprava
                    a prostredie.
                  </p>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4 px-5 py-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">
                    Urbanisticko-architektonická koncepcia
                  </Label>
                  <Textarea
                    className="min-h-[80px] resize-none text-xs"
                    placeholder="Osadenie, hmotové riešenie, výškové vzťahy, výraz fasád."
                    value={form.summaryB7.urbanArchitecturalTechnicalConcept}
                    onChange={(e) =>
                      updateForm({
                        summaryB7: {
                          ...form.summaryB7,
                          urbanArchitecturalTechnicalConcept: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">
                    Technické a energetické riešenie
                  </Label>
                  <Textarea
                    className="min-h-[80px] resize-none text-xs"
                    placeholder="Nosný systém, vykurovanie, chladenie, technológie a energetická koncepcia."
                    value={
                      form.summaryB7
                        .operationTechnicalEnergyTechnologyDescription
                    }
                    onChange={(e) =>
                      updateForm({
                        summaryB7: {
                          ...form.summaryB7,
                          operationTechnicalEnergyTechnologyDescription:
                            e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">
                    Vnútorné prostredie
                  </Label>
                  <Textarea
                    className="min-h-[80px] resize-none text-xs"
                    placeholder="Osvetlenie, vetranie, tepelná pohoda, hluk a ostatné kvalitatívne požiadavky."
                    value={form.summaryB7.indoorEnvironmentAssurance}
                    onChange={(e) =>
                      updateForm({
                        summaryB7: {
                          ...form.summaryB7,
                          indoorEnvironmentAssurance: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-700">
                    Doprava, parkovanie a logistika
                  </Label>
                  <Textarea
                    className="min-h-[80px] resize-none text-xs"
                    placeholder="Napojenie na komunikácie, organizácia dopravy a parkovanie, zásobovanie."
                    value={form.summaryB7.trafficConnectionAndParking}
                    onChange={(e) =>
                      updateForm({
                        summaryB7: {
                          ...form.summaryB7,
                          trafficConnectionAndParking: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-[1.1fr,1.1fr]">
              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between gap-4 border-b bg-slate-50/80 px-5 py-3">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-sm font-semibold tracking-wide text-slate-900">
                      C) Situačné výkresy
                    </CardTitle>
                    <p className="text-xs text-slate-500">
                      Prehľad základných situačných podkladov k stavbe.
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 px-5 py-4 text-xs text-slate-700">
                  <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <div>
                      <div className="font-semibold">Širšie vzťahy</div>
                      <div className="text-[11px] text-slate-500">
                        Kód {form.situationalDrawingsC.widerContext.code}
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        form.situationalDrawingsC.widerContext.required
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {form.situationalDrawingsC.widerContext.required
                        ? "POVINNÉ"
                        : "NEPOVINNÉ"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <div>
                      <div className="font-semibold">Koordinačná situácia</div>
                      <div className="text-[11px] text-slate-500">
                        Kód {form.situationalDrawingsC.coordinationPlan.code}
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      ŠTANDARDNE PRILOŽENÉ
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between gap-4 border-b bg-slate-50/80 px-5 py-3">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-sm font-semibold tracking-wide text-slate-900">
                      E) Prílohy
                    </CardTitle>
                    <p className="text-xs text-slate-500">
                      Povinné a doplnkové prílohy k súhrnnej technickej správe.
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="grid gap-4 px-5 py-4 text-xs md:grid-cols-2">
                  <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <div className="text-xs font-semibold text-slate-800">
                      Povinné prílohy
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-700">
                      <span>Geodetické zameranie</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          form.attachmentsE.required.geodeticSurveyProvided
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {form.attachmentsE.required.geodeticSurveyProvided
                          ? "PRILOŽENÉ"
                          : "NEPRILOŽENÉ"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-700">
                      <span>Požiarnobezpečnostné riešenie</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          form.attachmentsE.required.fireSafetySolutionProvided
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {form.attachmentsE.required.fireSafetySolutionProvided
                          ? "PRILOŽENÉ"
                          : "NEPRILOŽENÉ"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <div className="text-xs font-semibold text-slate-800">
                      Voliteľné prílohy
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-700">
                      <span>Energetická náročnosť</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          form.attachmentsE.optional
                            .energyPerformanceAssessmentProvided
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {form.attachmentsE.optional
                          .energyPerformanceAssessmentProvided
                          ? "PRILOŽENÉ"
                          : "NEPRILOŽENÉ"}
                      </span>
                    </div>
                    <div className="space-y-1 text-[11px] text-slate-700">
                      <div className="flex items-center justify-between">
                        <span>Ďalšie podklady</span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            form.attachmentsE.optional
                              .additionalSurveysAndReportsProvided
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {form.attachmentsE.optional
                            .additionalSurveysAndReportsProvided
                            ? "UVEDENÉ"
                            : "NEUVEDENÉ"}
                        </span>
                      </div>
                      {form.attachmentsE.optional
                        .additionalSurveysAndReportsProvided &&
                        form.attachmentsE.optional
                          .additionalSurveysAndReportsDescription && (
                          <p className="mt-1 line-clamp-3 text-[11px] text-slate-500">
                            {
                              form.attachmentsE.optional
                                .additionalSurveysAndReportsDescription
                            }
                          </p>
                        )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="pointer-events-auto fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm">
            <div className="mx-4 flex w-full max-w-sm flex-col items-center rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-2xl">
              <GlossInlineLoader />
            </div>
          </div>
        )}
      </motion.div>
    </AppShell>
  );
}
