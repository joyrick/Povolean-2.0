"use client";

import type { ReactElement } from "react";
import { useEffect, useState } from "react";
import type { ProjectFileNode } from "@/types/files/local-files";
import { AppShell } from "@/components/app-shell";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BackButton } from "@/components/back-button";
import { useSteps } from "@/context/steps-provider";
import { GlossInlineLoader } from "@/components/GlossInlineLoader";
import { ClipboardList } from "lucide-react";

type EditingState = {
  path: string;
  name: string;
} | null;

type FileForPrompt = {
  path: string;
  name: string;
};

type RenameRecommendation = {
  path?: string;
  originalName: string;
  suggestedName: string;
};

type AiResponse = {
  task?: string;
  message?: string;
  recommendations?: RenameRecommendation[];
};

type PreviewMode = "none" | "names" | "restructure";

type SectionLetter = "A" | "B" | "C" | "D" | "E" | "UNKNOWN";

type RightViewMode = "ai" | "correspondence";

async function fetchTree(rootPath: string): Promise<ProjectFileNode[]> {
  if (!rootPath || rootPath.trim() === "") {
    return [];
  }

  const url = `/api/project-files?fullPath=${encodeURIComponent(rootPath)}`;

  const res = await fetch(url);
  if (!res.ok) {
    return [];
  }
  const data = (await res.json()) as ProjectFileNode[];
  return data;
}

function collectFilesForPrompt(nodes: ProjectFileNode[]): FileForPrompt[] {
  const result: FileForPrompt[] = [];
  for (const node of nodes) {
    if (!node.isDirectory) {
      result.push({ path: node.path, name: node.name });
    }
    if (node.children !== undefined) {
      result.push(...collectFilesForPrompt(node.children));
    }
  }
  return result;
}

function sectionFromFilename(filename: string): SectionLetter {
  const withoutExt = filename.replace(/\.pdf$/i, "");
  const parts = withoutExt.split("_");
  if (parts.length < 5) return "UNKNOWN";

  const p5 = parts[4];

  if (p5 === "A00") return "A";
  if (p5 === "B00") return "B";
  if (p5 === "C00") return "C";
  if (p5 === "E00") return "E";
  if ((p5.startsWith("S") || p5.startsWith("P")) && /^\d+$/.test(p5.slice(1))) {
    return "D";
  }
  return "UNKNOWN";
}

function buildNamePreviewTree(
  tree: ProjectFileNode[],
  suggestions: Record<string, string>
): ProjectFileNode[] {
  return tree.map((node) => {
    if (node.isDirectory) {
      return {
        ...node,
        children:
          node.children !== undefined
            ? buildNamePreviewTree(node.children, suggestions)
            : undefined,
      };
    }

    const key =
      node.path in suggestions
        ? node.path
        : node.name in suggestions
        ? node.name
        : undefined;
    if (key === undefined) {
      return node;
    }

    return {
      ...node,
      name: suggestions[key],
    };
  });
}

function buildRestructurePreview(tree: ProjectFileNode[]): ProjectFileNode[] {
  const files = collectFilesForPrompt(tree);
  const bySection: Record<SectionLetter, FileForPrompt[]> = {
    A: [],
    B: [],
    C: [],
    D: [],
    E: [],
    UNKNOWN: [],
  };

  files.forEach((file) => {
    const section = sectionFromFilename(file.name);
    if (section === "UNKNOWN") {
      return;
    }
    bySection[section].push(file);
  });

  const sectionOrder: SectionLetter[] = ["A", "B", "C", "D", "E"];
  const children: ProjectFileNode[] = [];

  sectionOrder.forEach((section) => {
    const list = bySection[section];
    if (list.length === 0) {
      return;
    }
    children.push({
      path: `sorted/${section}`,
      name: section,
      isDirectory: true,
      children: list.map((file) => ({
        path: `sorted/${section}/${file.name}`,
        name: file.name,
        isDirectory: false,
      })),
    });
  });

  if (children.length === 0) {
    return [];
  }

  const sortedRoot: ProjectFileNode = {
    path: "sorted",
    name: "sorted",
    isDirectory: true,
    children,
  };

  return [sortedRoot];
}

function renderPreviewNode(node: ProjectFileNode, level: number): ReactElement {
  const paddingLeft = 12 + level * 16;

  return (
    <div key={node.path}>
      <div
        className="flex items-center gap-2 border-b border-slate-200 py-1 text-xs last:border-b-0"
        style={{ paddingLeft }}
      >
        <span
          className={`inline-flex h-5 w-8 items-center justify-center rounded-full text-[9px] font-semibold ${
            node.isDirectory
              ? "bg-slate-200 text-slate-700"
              : "bg-blue-50 text-blue-700"
          }`}
        >
          {node.isDirectory ? "DIR" : "FILE"}
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-[11px] font-medium text-slate-900">
            {node.name}
          </span>
          <span className="truncate text-[10px] text-slate-400">
            {node.path}
          </span>
        </div>
      </div>
      {node.children !== undefined &&
        node.children.map((child) => renderPreviewNode(child, level + 1))}
    </div>
  );
}

export default function ProjectFilesPage(): ReactElement {
  const [tree, setTree] = useState<ProjectFileNode[]>([]);
  const [editing, setEditing] = useState<EditingState>(null);
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [restructureLoading, setRestructureLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const { state, setStepStatus } = useSteps();
  const current = state.files_name_check?.status ?? "not_started";
  const isCompleted = current === "completed";

  const [aiRecommendations, setAiRecommendations] = useState<
    RenameRecommendation[] | null
  >(null);
  const [suggestionsByPath, setSuggestionsByPath] = useState<
    Record<string, string>
  >({});
  const [applyingPath, setApplyingPath] = useState<string | null>(null);
  const [applyingAll, setApplyingAll] = useState(false);
  const [rootPath, setRootPath] = useState<string>("");

  const [previewMode, setPreviewMode] = useState<PreviewMode>("none");
  const [previewTree, setPreviewTree] = useState<ProjectFileNode[] | null>(
    null
  );
  const [rightViewMode, setRightViewMode] = useState<RightViewMode>("ai");

  const isTreeBusy = aiLoading || restructureLoading;

  function handleToggleCompleted(): void {
    setStepStatus(
      "files_name_check",
      isCompleted ? "not_started" : "completed"
    );
  }

  useEffect(() => {
    if (!rootPath.trim()) {
      setTree([]);
      setPreviewTree(null);
      setPreviewMode("none");
      setRightViewMode("ai");
      return;
    }

    void (async () => {
      const data = await fetchTree(rootPath);
      setTree(data);
      setPreviewTree(null);
      setPreviewMode("none");
      setRightViewMode("ai");
    })();
  }, [rootPath]);

  async function handleRenameConfirm(): Promise<void> {
    if (editing === null) return;
    if (editing.name.trim() === "") return;
    if (!rootPath.trim()) return;

    setSaving(true);
    const res = await fetch("/api/project-files", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullPath: rootPath,
        path: editing.path,
        newName: editing.name.trim(),
      }),
    });
    setSaving(false);

    if (!res.ok) {
      return;
    }

    const data = (await res.json()) as ProjectFileNode[];
    setTree(data);
    setEditing(null);
  }

  async function handleCheckNames(): Promise<void> {
    const filesForPrompt = collectFilesForPrompt(tree);
    if (!rootPath.trim()) {
      setAiMessage("Najprv zadaj úplnú cestu k adresáru s dokumentmi.");
      return;
    }
    if (filesForPrompt.length === 0) {
      setAiMessage("V zadanom adresári nie sú žiadne súbory na kontrolu.");
      return;
    }

    setRightViewMode("ai");
    setAiLoading(true);
    setAiMessage(null);
    setSuggestionsByPath({});
    setAiRecommendations(null);
    setPreviewTree(null);
    setPreviewMode("none");

    const res = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        task: "check_document_names",
        files: filesForPrompt,
        fullPath: rootPath,
      }),
    });

    setAiLoading(false);

    if (!res.ok) {
      setAiMessage("Volanie AI endpointu zlyhalo.");
      return;
    }

    const data = (await res.json()) as AiResponse;

    setAiMessage(data.message ?? null);

    if (data.recommendations !== undefined) {
      setAiRecommendations(data.recommendations);

      const map: Record<string, string> = {};
      data.recommendations.forEach((rec) => {
        const key = rec.path ?? rec.originalName;
        map[key] = rec.suggestedName;
      });
      setSuggestionsByPath(map);

      const preview = buildNamePreviewTree(tree, map);
      setPreviewTree(preview);
      setPreviewMode("names");
    } else {
      setPreviewTree(null);
      setPreviewMode("none");
    }
  }

  async function handleRestructureTree(): Promise<void> {
    if (!rootPath.trim()) {
      setAiMessage("Najprv zadaj úplnú cestu k adresáru s dokumentmi.");
      return;
    }

    const preview = buildRestructurePreview(tree);
    if (preview.length === 0) {
      setAiMessage(
        "Nenašli sa žiadne PDF súbory, ktoré by bolo možné usporiadať."
      );
      setPreviewTree(null);
      setPreviewMode("none");
      return;
    }

    setRightViewMode("ai");
    setPreviewTree(preview);
    setPreviewMode("restructure");
    setAiMessage(
      "Náhľad usporiadania podľa častí A–E je pripravený. Pre aplikovanie klikni na „Aplikovať usporiadanie“."
    );
  }

  async function handleApplySingle(
    path: string,
    suggestedName: string
  ): Promise<void> {
    if (!rootPath.trim()) return;

    setApplyingPath(path);

    const res = await fetch("/api/project-files", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullPath: rootPath,
        path,
        newName: suggestedName,
      }),
    });

    setApplyingPath(null);

    if (!res.ok) {
      return;
    }

    const data = (await res.json()) as ProjectFileNode[];
    setTree(data);

    setSuggestionsByPath((prev) => {
      const next = { ...prev };
      delete next[path];
      return next;
    });

    setAiRecommendations((prev) => {
      if (prev === null) {
        return prev;
      }
      return prev.filter((rec) => rec.path !== path);
    });
  }

  async function handleApplyAll(): Promise<void> {
    if (!rootPath.trim()) return;
    if (aiRecommendations === null || aiRecommendations.length === 0) {
      return;
    }

    setApplyingAll(true);

    for (const rec of aiRecommendations) {
      const path = rec.path;
      if (path === undefined) continue;

      const res = await fetch("/api/project-files", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullPath: rootPath,
          path,
          newName: rec.suggestedName,
        }),
      });

      if (!res.ok) {
        continue;
      }
    }

    const data = await fetchTree(rootPath);
    setTree(data);
    setSuggestionsByPath({});
    setAiRecommendations(null);
    setApplyingAll(false);
    setPreviewTree(null);
    setPreviewMode("none");
  }

  async function handleApplyRestructure(): Promise<void> {
    if (!rootPath.trim()) return;

    setRestructureLoading(true);
    setAiMessage(null);

    const res = await fetch("/api/project-files", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullPath: rootPath,
        action: "auto_restructure",
      }),
    });

    setRestructureLoading(false);

    if (!res.ok) {
      setAiMessage("Usporiadanie štruktúry zlyhalo.");
      return;
    }

    const data = (await res.json()) as ProjectFileNode[];
    setTree(data);
    setAiMessage("Štruktúra bola usporiadaná podľa častí A–E.");
    setPreviewTree(null);
    setPreviewMode("none");
  }

  async function handleApplyPreview(): Promise<void> {
    if (previewMode === "names") {
      await handleApplyAll();
    } else if (previewMode === "restructure") {
      await handleApplyRestructure();
    }
  }

  function renderNode(node: ProjectFileNode, level: number): ReactElement {
    const isEditing = editing !== null && editing.path === node.path;
    const paddingLeft = 12 + level * 16;

    const suggestion =
      suggestionsByPath[node.path] ?? suggestionsByPath[node.name];

    const isApplyingThis = applyingPath === node.path;

    return (
      <div key={node.path}>
        <div
          className="flex items-center gap-3 border-b border-slate-100 py-1.5 text-lg last:border-b-0"
          style={{ paddingLeft }}
        >
          <span
            className={`inline-flex h-5 w-10 items-center justify-center rounded-full text-[10px] font-semibold ${
              node.isDirectory
                ? "bg-slate-200 text-slate-700"
                : "bg-blue-50 text-blue-700"
            }`}
          >
            {node.isDirectory ? "DIR" : "FILE"}
          </span>

          {isEditing ? (
            <>
              <Input
                className="h-8 w-64"
                value={editing.name}
                onChange={(event) =>
                  setEditing({
                    path: node.path,
                    name: event.target.value,
                  })
                }
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => void handleRenameConfirm()}
                disabled={saving}
              >
                Uložiť
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setEditing(null)}
                disabled={saving}
              >
                Zrušiť
              </Button>
            </>
          ) : (
            <>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-md font-medium text-slate-900">
                  {node.name}
                </span>
                <span className="truncate text-sm text-slate-400">
                  {node.path}
                </span>
              </div>

              {!node.isDirectory && suggestion !== undefined && (
                <div className="ml-2 flex max-w-xs items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-[11px] text-amber-800">
                  <span className="font-semibold">Návrh:</span>
                  <span className="font-mono truncate">{suggestion}</span>
                  <Button
                    size="xs"
                    variant="ghost"
                    className="px-2 text-[10px]"
                    disabled={isApplyingThis || applyingAll}
                    onClick={() =>
                      void handleApplySingle(node.path, suggestion)
                    }
                  >
                    {isApplyingThis ? "Aplikujem..." : "Aplikovať"}
                  </Button>
                </div>
              )}

              {!node.isDirectory && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-md text-slate-500 hover:text-slate-800"
                  onClick={() =>
                    setEditing({
                      path: node.path,
                      name: node.name,
                    })
                  }
                >
                  Premenovať
                </Button>
              )}
            </>
          )}
        </div>

        {node.children !== undefined &&
          node.children.map((child) => renderNode(child, level + 1))}
      </div>
    );
  }

  const disableCheckNames =
    !rootPath.trim() || aiLoading || applyingAll || restructureLoading;

  const disableRestructure =
    !rootPath.trim() || restructureLoading || applyingAll;

  const isApplyDisabled =
    previewMode === "none" ||
    previewTree === null ||
    (previewMode === "names" &&
      (aiRecommendations === null || aiRecommendations.length === 0)) ||
    (previewMode === "names" && applyingAll) ||
    (previewMode === "restructure" && restructureLoading);

  const correspondenceScore = 0.74;
  const correspondencePercent = Math.round(correspondenceScore * 100);

  const correspondenceGroups = [
    {
      topic: "Dopravné napojenie a parkovanie",
      summary:
        "Rozdielne počty parkovacích miest a iné riešenie vjazdov medzi STS a dopravným posúdením.",
      files: [
        {
          name: "NUPPU10_SO215AB_B00_STS_Doprava.pdf",
          path: "docs/B/B00/NUPPU10_SO215AB_B00_STS_Doprava.pdf",
          note: "Uvádza 32 parkovacích miest, 2 vjazdy z Hraničnej.",
        },
        {
          name: "NUPPU10_SO215AB_S12_Dopravne_posudenie.pdf",
          path: "docs/S/S12/NUPPU10_SO215AB_S12_Dopravne_posudenie.pdf",
          note: "Uvádza 28 parkovacích miest, 1 vjazd z Hraničnej.",
        },
      ],
    },
    {
      topic: "Kapacita apartmánov a osôb",
      summary:
        "V rôznych častiach dokumentácie sú odlišné počty apartmánov a maximálnych počtov osôb.",
      files: [
        {
          name: "NUPPU10_SO215AB_B00_STS_Kapacitne_udaje.pdf",
          path: "docs/B/B00/NUPPU10_SO215AB_B00_STS_Kapacitne_udaje.pdf",
          note: "Kapacita 96 apartmánov, 210 osôb.",
        },
        {
          name: "NUPPU10_SO215AB_A00_Architektonicka_studia.pdf",
          path: "docs/A/A00/NUPPU10_SO215AB_A00_Architektonicka_studia.pdf",
          note: "Kapacita 92 apartmánov, bez uvedenia počtu osôb.",
        },
      ],
    },
    {
      topic: "Energetický koncept a zdroj tepla",
      summary:
        "Nezrovnalosť v definícii zdroja tepla a predpokladanej energetickej triedy budovy.",
      files: [
        {
          name: "NUPPU10_SO215AB_B00_STS_Energetika.pdf",
          path: "docs/B/B00/NUPPU10_SO215AB_B00_STS_Energetika.pdf",
          note: "Deklaruje centrálny zdroj tepla a energetickú triedu A0.",
        },
        {
          name: "NUPPU10_SO215AB_S25_Energeticky_posudok.pdf",
          path: "docs/S/S25/NUPPU10_SO215AB_S25_Energeticky_posudok.pdf",
          note: "Počíta s lokálnymi zdrojmi tepla, energetická trieda A1.",
        },
      ],
    },
  ] as const;

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
      <div className="flex flex-1 flex-col items-center">
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pb-10 pt-4">
          <Card className="flex min-h-[calc(100vh-15rem)] flex-1 flex-col border-slate-200">
            <CardHeader className="flex flex-col gap-3 border-b border-slate-100 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-lg">
                  Strom súborov a výsledky AI kontroly
                </CardTitle>
                <p className="mt-1 text-md text-slate-500">
                  Vľavo sú názvy a cesty súborov, napravo výsledok AI kontroly a
                  náhľad zmien.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="whitespace-nowrap">
                  Úplná cesta k adresáru dokumentov:
                </span>
                <Input
                  className="h-8 w-72 rounded-full px-3 text-xs"
                  value={rootPath}
                  onChange={(e) =>
                    setRootPath(e.target.value.replace(/"/g, ""))
                  }
                  placeholder="napr. C:\\data\\project-docs alebo /data/project-docs"
                />
              </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <div className="mt-2 flex flex-1 flex-row gap-6">
                <div className="relative flex min-h-[20rem] max-h-[60vh] flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white">
                  {isTreeBusy && (
                    <div className="pointer-events-auto absolute inset-0 z-10 flex items-center justify-center bg-slate-50/80 backdrop-blur-sm">
                      <GlossInlineLoader />
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto px-4 py-3 text-lg text-slate-700">
                    {!rootPath.trim() && (
                      <p className="text-lg text-slate-500">
                        Zadaj úplnú cestu k adresáru s dokumentmi, ktoré chceš
                        skontrolovať.
                      </p>
                    )}
                    {rootPath.trim() && tree.length === 0 && (
                      <p className="text-lg text-slate-500">
                        V ceste{" "}
                        <span className="mx-1 rounded bg-slate-100 px-1 py-0.5 text-md font-mono">
                          {rootPath}
                        </span>{" "}
                        sa nenašli žiadne súbory alebo adresár neexistuje.
                        Skontroluj, prosím, cestu.
                      </p>
                    )}
                    {tree.map((node) => renderNode(node, 0))}
                  </div>
                </div>

                <div className="relative flex min-h-[20rem] max-h-[60vh] flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                  <div className="flex-1 overflow-y-auto px-4 py-3">
                    {rightViewMode === "ai" ? (
                      <>
                        <div className="mb-3">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <span className="text-sm font-semibold text-slate-700">
                              Výsledok kontroly názvov dokumentov
                            </span>
                            {aiRecommendations !== null &&
                              aiRecommendations.length > 0 && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => void handleApplyAll()}
                                  disabled={applyingAll}
                                >
                                  {applyingAll
                                    ? "Aplikujem všetky..."
                                    : "Aplikovať všetky návrhy"}
                                </Button>
                              )}
                          </div>

                          <div className="space-y-3 text-sm text-slate-700">
                            {aiMessage === null && (
                              <p className="text-sm text-slate-500">
                                Zatiaľ neprebehla žiadna kontrola. Zadaj cestu k
                                adresáru a spusti kontrolu tlačidlom
                                „Skontrolovať názvy dokumentov“ alebo náhľad
                                usporiadania.
                              </p>
                            )}
                            {aiMessage !== null && (
                              <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm leading-relaxed text-slate-800">
                                {aiMessage}
                              </div>
                            )}

                            {aiRecommendations !== null &&
                              aiRecommendations.length > 0 && (
                                <div className="mt-2 max-h-32 space-y-2 overflow-auto">
                                  <p className="text-[11px] font-medium text-slate-600">
                                    Návrhy na premenovanie (
                                    {aiRecommendations.length} súborov):
                                  </p>
                                  {aiRecommendations.map((rec) => (
                                    <div
                                      key={`${rec.path ?? rec.originalName}-${
                                        rec.suggestedName
                                      }`}
                                      className="rounded-md border border-slate-200 bg-white px-3 py-2 text-[11px]"
                                    >
                                      <div className="truncate font-mono text-slate-700">
                                        {rec.path ?? rec.originalName}
                                      </div>
                                      <div className="mt-1 flex flex-wrap items-center gap-1">
                                        <span className="text-[10px] text-slate-500">
                                          Pôvodný:
                                        </span>
                                        <span className="font-mono text-[10px] text-slate-700">
                                          {rec.originalName}
                                        </span>
                                      </div>
                                      <div className="mt-0.5 flex flex-wrap items-center gap-1">
                                        <span className="text-[10px] text-emerald-600">
                                          Návrh:
                                        </span>
                                        <span className="font-mono text-[10px] text-emerald-700">
                                          {rec.suggestedName}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                          </div>
                        </div>

                        <div className="flex-1 rounded-xl border border-dashed border-slate-300 bg-white px-3 py-2">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <span className="text-sm font-semibold text-slate-700">
                              Náhľad zmien
                            </span>
                            {previewMode !== "none" && previewTree !== null && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => void handleApplyPreview()}
                                disabled={isApplyDisabled}
                              >
                                {previewMode === "names"
                                  ? applyingAll
                                    ? "Aplikujem premenovania..."
                                    : "Aplikovať premenovania"
                                  : restructureLoading
                                  ? "Usporadúvam..."
                                  : "Aplikovať usporiadanie"}
                              </Button>
                            )}
                          </div>
                          {previewMode === "none" || previewTree === null ? (
                            <p className="text-[11px] text-slate-500">
                              Spusti kontrolu názvov alebo usporiadanie
                              štruktúry, aby sa zobrazil náhľad cieľového stromu
                              súborov.
                            </p>
                          ) : (
                            <div className="h-full max-h-full overflow-auto rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs">
                              {previewTree.map((node) =>
                                renderPreviewNode(node, 0)
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="flex h-full flex-col gap-4">
                        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold text-slate-800">
                                Korešpondencia dokumentov v projekte
                              </div>
                              <div className="text-[11px] text-slate-500">
                                Ako konzistentne sa zhodujú kľúčové údaje medzi
                                jednotlivými dokumentmi.
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-semibold text-slate-700">
                                Celková zhoda
                              </div>
                              <div className="text-lg font-bold text-blue-700">
                                {correspondencePercent}%
                              </div>
                            </div>
                          </div>
                          <div className="mt-1 h-2 w-full rounded-full bg-slate-200">
                            <div
                              className="h-2 rounded-full bg-emerald-500 transition-all"
                              style={{ width: `${correspondencePercent}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-white px-3 py-3">
                          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-700">
                            <ClipboardList className="h-4 w-4 text-blue-600" />
                            Oblasti s nižšou korešpondenciou medzi dokumentmi
                          </div>
                          <div className="space-y-3 text-[11px] text-slate-700">
                            {correspondenceGroups.map((group) => (
                              <div
                                key={group.topic}
                                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                              >
                                <div className="mb-1 flex items-center justify-between gap-3">
                                  <div className="text-[11px] font-semibold text-slate-800">
                                    {group.topic}
                                  </div>
                                  <div className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                                    Nekonzistentné údaje
                                  </div>
                                </div>
                                <p className="mb-2 text-[11px] text-slate-600">
                                  {group.summary}
                                </p>
                                <div className="space-y-1.5">
                                  {group.files.map((file) => (
                                    <div
                                      key={file.path}
                                      className="rounded-md border border-slate-200 bg-white px-2 py-1.5"
                                    >
                                      <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div className="min-w-0 flex-1">
                                          <div className="truncate font-mono text-[11px] text-slate-800">
                                            {file.name}
                                          </div>
                                          <div className="truncate text-[10px] text-slate-400">
                                            {file.path}
                                          </div>
                                        </div>
                                        <div className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-600">
                                          Dokument
                                        </div>
                                      </div>
                                      <div className="mt-1 text-[10px] text-slate-600">
                                        {file.note}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 pb-4">
            <Button
              type="button"
              onClick={() => void handleCheckNames()}
              disabled={disableCheckNames}
              className="flex min-w-[260px] items-center justify-center gap-2 rounded-full bg-gradient-to-r from-blue-500 via-sky-500 to-blue-700 px-8 py-3 text-base font-semibold text-white shadow-md shadow-blue-500/30 transition-transform duration-150 ease-out hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
            >
              {aiLoading
                ? "Kontrolujem názvy..."
                : "Skontrolovať názvy dokumentov"}
            </Button>

            <Button
              type="button"
              onClick={() => void handleRestructureTree()}
              disabled={disableRestructure}
              className="flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition-transform duration-150 ease-out hover:scale-[1.02] hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
            >
              <ClipboardList className="h-4 w-4" />
              {restructureLoading
                ? "Usporadúvam štruktúru..."
                : "Usporiadať štruktúru podľa 60/2025"}
            </Button>

            <Button
              type="button"
              onClick={() => setRightViewMode("correspondence")}
              disabled={disableCheckNames}
              className="flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-slate-500/30 transition-transform duration-150 ease-out hover:scale-[1.02] hover:bg-black hover:shadow-lg hover:shadow-slate-500/40 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
            >
              Kontrola korešpondencie
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
