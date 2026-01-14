"use client";

import type { ReactElement, FormEvent } from "react";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, Sparkles, Send, FolderOpen, ChevronRight, ChevronDown, FileText, Folder } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "text" | "loading" | "hierarchy";
  hierarchyData?: HierarchyNode[];
};

type HierarchyNode = {
  name: string;
  oldName: string;
  isDirectory: boolean;
  children?: HierarchyNode[];
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

export function AiChatPanel(): ReactElement {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [mockWorkflowActive, setMockWorkflowActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    <Card className="flex h-full flex-col rounded-2xl border-slate-200 shadow-xl shadow-slate-900/10">
      <CardHeader className="flex flex-row items-center gap-2 border-b bg-slate-50 px-6 py-4 rounded-t-2xl">
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
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-4 px-6 py-4 overflow-hidden">
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
              <Button
                variant="outline"
                className="text-sm border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                onClick={() => runMockWorkflow()}
                disabled={loading}
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                skontrolovať a usporiadať súbory podľa 60/2025
              </Button>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={
                msg.role === "user"
                  ? "ml-12 flex justify-end"
                  : "mr-4 flex justify-start"
              }
            >
              {msg.type === "hierarchy" && msg.hierarchyData ? (
                <div className="w-full max-w-md">
                  <FileHierarchyCard data={msg.hierarchyData} />
                </div>
              ) : (
                <div
                  className={
                    msg.role === "user"
                      ? "rounded-2xl bg-blue-600 px-4 py-3 text-sm text-white shadow-sm"
                      : msg.type === "loading"
                      ? "rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-500 shadow-sm animate-pulse"
                      : "rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-800 shadow-sm"
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
            className="h-9 w-9 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
