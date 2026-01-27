"use client";

import type { ReactElement, FormEvent } from "react";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, Sparkles, Send, FolderOpen, ChevronRight, ChevronDown, FileText, Folder, AlertTriangle, AlertCircle, CheckCircle2, ExternalLink, FileSearch, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlossInlineLoader } from "@/components/GlossInlineLoader";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "text" | "loading" | "hierarchy" | "problemTable";
  hierarchyData?: HierarchyNode[];
  problemData?: ProblemItem[];
};

type HierarchyNode = {
  name: string;
  oldName: string;
  isDirectory: boolean;
  children?: HierarchyNode[];
};

type ProblemItem = {
  id: string;
  severity: "error" | "warning" | "info";
  field: string;
  problem: string;
  document: string;
  documentPath: string;
};

const mockHierarchy: HierarchyNode[] = [
  {
    name: "2.1 Nuppu10 - SO215AB",
    oldName: "2.1_Nuppu10_SO215AB",
    isDirectory: true,
    children: [
      {
        name: "1_IC_Inzinierska_cinnost",
        oldName: "1_IC_Inzinierska_cinnost",
        isDirectory: true,
        children: [
          {
            name: "IC3_Stavebne_povolenie",
            oldName: "IC3_Stavebne_povolenie",
            isDirectory: true,
            children: [
              { name: "ZSPD", oldName: "ZSPD", isDirectory: true },
              { name: "EIA", oldName: "EIA", isDirectory: true }
            ]
          }
        ]
      },
      {
        name: "01_Oznamenie_SO215AB_final.pdf",
        oldName: "01_Oznamenie_SO215AB_final.pdf",
        isDirectory: false
      }
    ]
  }
];

const mockProblems: ProblemItem[] = [
  {
    id: "1",
    severity: "error",
    field: "Číslo parcely",
    problem: "Nesúlad medzi dokumentmi: v žiadosti uvedené 1234/5, v katastri 1234/6",
    document: "Žiadosť o stavebné povolenie",
    documentPath: "/documents/ziadost_sp.pdf"
  },
  {
    id: "2",
    severity: "error",
    field: "Meno vlastníka",
    problem: "Chýbajúci podpis spoluvlastníka Jána Nováka",
    document: "Súhlas vlastníkov",
    documentPath: "/documents/suhlas_vlastnikov.pdf"
  },
  {
    id: "3",
    severity: "warning",
    field: "Dátum vydania",
    problem: "Stanovisko EIA je staršie ako 2 roky (vydané 12.03.2023)",
    document: "Stanovisko EIA",
    documentPath: "/documents/eia_stanovisko.pdf"
  },
  {
    id: "4",
    severity: "warning",
    field: "Výmera pozemku",
    problem: "Rozdiel vo výmere: projekt uvádza 850 m², LV uvádza 847 m²",
    document: "Projektová dokumentácia",
    documentPath: "/documents/projekt.pdf"
  },
  {
    id: "5",
    severity: "info",
    field: "IČO dodávateľa",
    problem: "Odporúčame overiť aktuálnosť údajov v ORSR",
    document: "Zmluva o dielo",
    documentPath: "/documents/zmluva.pdf"
  }
];

function FileTreeNode({ node, level = 0 }: { node: HierarchyNode; level?: number }): ReactElement {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.isDirectory && node.children && node.children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-slate-100 cursor-pointer text-sm ${level === 0 ? "font-medium" : ""}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
          )
        ) : (
          <span className="w-4" />
        )}
        {node.isDirectory ? (
          <Folder className="h-4 w-4 text-amber-500 flex-shrink-0" />
        ) : (
          <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
        )}
        <span className="text-slate-700 truncate">{node.name}</span>
        {node.name !== node.oldName && (
          <span className="text-xs text-slate-400 ml-1 truncate">← {node.oldName}</span>
        )}
      </div>
      {hasChildren && expanded && (
        <div>
          {node.children!.map((child, idx) => (
            <FileTreeNode key={`${child.name}-${idx}`} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function FileHierarchyCard({ data }: { data: HierarchyNode[] }): ReactElement {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-blue-600" />
          <span className="font-semibold text-slate-800">Usporiadaná hierarchia súborov</span>
        </div>
        <p className="text-xs text-slate-500 mt-1">Podľa zákona 60/2025 Z. z.</p>
      </div>
      <div className="p-3 max-h-64 overflow-y-auto">
        {data.map((node, idx) => (
          <FileTreeNode key={`${node.name}-${idx}`} node={node} />
        ))}
      </div>
    </div>
  );
}

function ProblemTableCard({ data }: { data: ProblemItem[] }): ReactElement {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "error":
        return <span className="inline-block rounded px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700">Chyba</span>;
      case "warning":
        return <span className="inline-block rounded px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800">Upozornenie</span>;
      case "info":
        return <span className="inline-block rounded px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700">Odporúčanie</span>;
      default:
        return null;
    }
  };

  return (
    <div className="w-full my-2 overflow-x-auto border border-slate-200 rounded-xl bg-white px-0">
      <table className="min-w-full text-sm text-slate-800">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th className="px-2 py-1.5 font-semibold text-left whitespace-nowrap w-1/5"><FileText className="inline h-4 w-4 mr-1 text-slate-400 align-text-bottom" />Dokument</th>
            <th className="px-2 py-1.5 font-semibold text-left whitespace-nowrap w-1/4">Pole</th>
            <th className="px-2 py-1.5 font-semibold text-left whitespace-nowrap w-1/3">Problém</th>
            <th className="px-2 py-1.5 font-semibold text-left whitespace-nowrap w-1/6">Stav</th>
            <th className="px-2 py-1.5 font-semibold text-left whitespace-nowrap w-12"></th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => [
            <tr
              key={item.id}
              className={`border-b border-slate-100 transition-colors ${hoveredRow === item.id ? "bg-slate-50" : "bg-white"}`}
              onMouseEnter={() => setHoveredRow(item.id)}
              onMouseLeave={() => setHoveredRow(null)}
              onClick={() => setExpandedRow(expandedRow === item.id ? null : item.id)}
              style={{ cursor: "pointer" }}
            >
              <td className="px-2 py-1 whitespace-nowrap flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span className="underline underline-offset-2 cursor-pointer hover:text-blue-700 transition-colors" title={item.document}>{item.document}</span>
              </td>
              <td className="px-2 py-1 whitespace-nowrap">{item.field}</td>
              <td className="px-2 py-1 whitespace-normal max-w-xs truncate">{item.problem}</td>
              <td className="px-2 py-1 whitespace-nowrap">{getSeverityBadge(item.severity)}</td>
              <td className="px-2 py-1 whitespace-nowrap">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-blue-600 hover:text-blue-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Mock: would open document
                    console.log("Opening document:", item.documentPath);
                  }}
                  title="Otvoriť dokument"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </td>
            </tr>,
            expandedRow === item.id && (
              <tr key={item.id + "-expanded"}>
                <td colSpan={5} className="px-6 pb-2 pt-0 text-slate-700 bg-slate-50 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Detail:</span>
                    <span>{item.problem}</span>
                  </div>
                </td>
              </tr>
            )
          ])}
        </tbody>
      </table>
    </div>
  );
}

export function AiChatPanel(): ReactElement {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [mockWorkflowActive, setMockWorkflowActive] = useState(false);
  const [fadeState, setFadeState] = useState<'in' | 'out'>('out');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Animate fade-in on mount (agent mode open)
  useEffect(() => {
    setTimeout(() => setFadeState('in'), 10);
  }, []);

  // New Conversation handler with animation
  async function handleNewConversation() {
    setFadeState('out');
    await new Promise((r) => setTimeout(r, 250));
    setMessages([]);
    setInput("");
    setFadeState('in');
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Helper: type text char by char
  async function typeText(
    messageId: string,
    text: string,
    msPerChar: number = 12
  ): Promise<void> {
    let current = "";
    for (let i = 0; i < text.length; i++) {
      current += text[i];
      await new Promise((r) => setTimeout(r, msPerChar));
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, content: current } : m))
      );
    }
  }

  // Helper: animate cycling dots
  async function animateDots(
    messageId: string,
    baseText: string,
    cycles: number = 6,
    intervalMs: number = 300
  ): Promise<void> {
    for (let i = 0; i < cycles; i++) {
      const dots = ".".repeat((i % 3) + 1);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, content: baseText + dots } : m
        )
      );
      await new Promise((r) => setTimeout(r, intervalMs));
    }
  }

  // Mock workflow for file organization
  async function runMockWorkflow(): Promise<void> {
    setMockWorkflowActive(true);
    setLoading(true);

    // Step 1: Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: "Skontrolovať a usporiadať súbory podľa 60/2025",
    };
    setMessages((prev) => [...prev, userMsg]);

    await new Promise((r) => setTimeout(r, 500));

    // Step 2: Assistant initial response with typing
    const assistantId1 = `assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: assistantId1, role: "assistant", content: "", type: "text" },
    ]);
    await typeText(
      assistantId1,
      "Samozrejme, Vaše súbory usporiadam podľa platnej legislatívy (60/2025 Z. z.). Môžete si ich potom aj manuálne editovať.",
      12
    );

    await new Promise((r) => setTimeout(r, 400));

    // Step 3: Show loading message "usporadúvam" with cycling dots
    const loadingId = `loading-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: loadingId, role: "assistant", content: "usporadúvam", type: "loading" },
    ]);
    await animateDots(loadingId, "usporadúvam", 6, 300);

    // Step 4: Replace with "Premenúvam súbory" typed char-by-char
    setMessages((prev) =>
      prev.map((m) => (m.id === loadingId ? { ...m, content: "" } : m))
    );
    await typeText(loadingId, "Premenúvam súbory", 40);

    // Step 5: Animate ellipsis after "Premenúvam súbory"
    await animateDots(loadingId, "Premenúvam súbory", 6, 300);

    // Step 6: Replace loading message with file hierarchy card
    setMessages((prev) =>
      prev.map((m) =>
        m.id === loadingId
          ? { ...m, content: "", type: "hierarchy", hierarchyData: mockHierarchy }
          : m
      )
    );

    // Step 7: Scroll to bottom
    await new Promise((r) => setTimeout(r, 100));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    setLoading(false);
    setMockWorkflowActive(false);
  }

  // Mock workflow for data verification
  async function runDataVerificationWorkflow(): Promise<void> {
    setMockWorkflowActive(true);
    setLoading(true);

    // Step 1: Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: "Skontrolovať správnosť údajov a korešpondenciu",
    };
    setMessages((prev) => [...prev, userMsg]);

    await new Promise((r) => setTimeout(r, 500));

    // Step 2: Assistant initial response with typing
    const assistantId1 = `assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: assistantId1, role: "assistant", content: "", type: "text" },
    ]);
    await typeText(
      assistantId1,
      "Rozumiem, skontrolujem všetky dokumenty a porovnám údaje medzi nimi.",
      12
    );

    await new Promise((r) => setTimeout(r, 400));

    // Step 3: Show loading message with cycling dots
    const loadingId = `loading-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: loadingId, role: "assistant", content: "Načítavam dokumenty", type: "loading" },
    ]);
    await animateDots(loadingId, "Načítavam dokumenty", 5, 300);

    // Step 4: Change to analyzing
    setMessages((prev) =>
      prev.map((m) => (m.id === loadingId ? { ...m, content: "" } : m))
    );
    await typeText(loadingId, "Analyzujem obsah", 40);
    await animateDots(loadingId, "Analyzujem obsah", 6, 300);

    // Step 5: Change to comparing
    setMessages((prev) =>
      prev.map((m) => (m.id === loadingId ? { ...m, content: "" } : m))
    );
    await typeText(loadingId, "Porovnávam údaje", 40);
    await animateDots(loadingId, "Porovnávam údaje", 5, 300);

    // Step 6: Replace loading message with summary text
    setMessages((prev) =>
      prev.map((m) => (m.id === loadingId ? { ...m, content: "", type: "text" } : m))
    );
    await typeText(
      loadingId,
      "Kontrola dokončená. Našiel som niekoľko nezrovnalostí, ktoré je potrebné opraviť pred podaním žiadosti:",
      12
    );

    await new Promise((r) => setTimeout(r, 300));

    // Step 7: Add problem table card
    const tableId = `table-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: tableId, role: "assistant", content: "", type: "problemTable", problemData: mockProblems },
    ]);

    // Step 8: Scroll to bottom
    await new Promise((r) => setTimeout(r, 100));
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    setLoading(false);
    setMockWorkflowActive(false);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ): Promise<void> {
    event.preventDefault();
    if (loading) return;

    const trimmed = input.trim();
    if (trimmed === "") return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    setLoading(true);
    const SYSTEM_CONTEXT =
      "Si AI asistent pre stavebné konanie na Slovensku. " +
      "Poznáš zákon 60/2025 Z. z., stavebný proces a legislatívne povinnosti. " +
      "Odpovedaj presne, odborne, krátko a vecne ale nápomocne.";

    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task: "chat",
        message: trimmed,
        context: SYSTEM_CONTEXT,
      }),
    });

    const data = (await res.json()) as { message?: string };
    const fullText = data.message ?? "";

    const assistantId = `assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    await typeText(assistantId, fullText, 12);

    setLoading(false);
  }

  return (
    <Card className={`flex h-full flex-col rounded-2xl border-slate-200 shadow-xl shadow-slate-900/10 transition-opacity duration-300 ${fadeState === 'out' ? 'opacity-0' : 'opacity-100'}`}>
      <CardHeader className="flex flex-row items-center gap-2 border-b bg-slate-50 px-6 py-4 rounded-t-2xl justify-between">
        <div className="flex flex-row items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 overflow-hidden">
            <img src="/img/logo_3.png" alt="Povolean AI" className="h-10 w-10 object-contain" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900">
              Povolean AI Agent
            </CardTitle>
            <p className="text-sm text-slate-500">
              Váš copilot pre celé stavebné konanie
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto text-xs border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer"
          onClick={handleNewConversation}
          disabled={loading}
        >
          + Nová konverzácia
        </Button>
      </CardHeader>
      <CardContent className={`flex flex-1 flex-col gap-4 px-6 py-4 overflow-hidden transition-opacity duration-300 ${fadeState === 'out' ? 'opacity-0' : 'opacity-100'}`}>
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto pr-2 text-sm">
          {messages.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-4">
                <Sparkles className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                Ako Vám môžem pomôcť?
              </h3>
              <p className="text-slate-500 max-w-md mb-4">
                Začnite otázkou, alebo úlohou, napríklad: „Čo je najvhodnejší nasledovný krok?"
              </p>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="text-sm border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 cursor-pointer"
                  onClick={() => runMockWorkflow()}
                  disabled={loading}
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Skontrolovať a usporiadať súbory podľa 60/2025
                </Button>
                <Button
                  variant="outline"
                  className="text-sm border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 cursor-pointer"
                  onClick={() => runDataVerificationWorkflow()}
                  disabled={loading}
                >
                  <FileSearch className="h-4 w-4 mr-2" />
                  Skontrolovať správnosť údajov a korešpondenciu
                </Button>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={
                msg.type === "loading"
                  ? "flex items-center gap-2 py-2 px-2 text-base"
                  : msg.role === "user"
                  ? "ml-12 flex justify-end text-base"
                  : "mr-4 flex justify-start text-base"
              }
            >
              {msg.type === "hierarchy" && msg.hierarchyData ? (
                <div className="w-full max-w-md">
                  <FileHierarchyCard data={msg.hierarchyData} />
                </div>
              ) : msg.type === "problemTable" && msg.problemData ? (
                <div className="w-full">
                  <ProblemTableCard data={msg.problemData} />
                </div>
              ) : msg.type === "loading" ? (
                <>
                  <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
                  <span className="text-base text-slate-700 font-medium">{msg.content}</span>
                </>
              ) : (
                <div
                  className={
                    (msg.role === "user"
                      ? "rounded-2xl bg-blue-600 px-4 py-3 text-white shadow-sm"
                      : "rounded-2xl bg-slate-100 px-4 py-3 text-slate-800 shadow-sm") +
                    " text-base"
                  }
                >
                  {msg.content}
                </div>
              )}
            </div>
          ))}

          {loading && !mockWorkflowActive && (
            <div className="mr-12 flex justify-start">
              <div className="rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500 shadow-sm animate-pulse">
                Zisťujeme…
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 pt-2 border-t border-slate-100"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Napíš otázku…"
            className="h-9 text-base flex-1"
            disabled={loading}
          />

          <Button
            type="submit"
            size="icon"
            className="h-9 w-9 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            disabled={loading}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
