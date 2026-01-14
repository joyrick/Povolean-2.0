"use client";

import type { ReactElement, FormEvent } from "react";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, Sparkles, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function AiChatPanel(): ReactElement {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

    let current = "";
    const assistantId = `assistant-${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    for (let i = 0; i < fullText.length; i++) {
      current += fullText[i];
      await new Promise((r) => setTimeout(r, 12));
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, content: current } : m))
      );
    }

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
              <p className="text-slate-500 max-w-md">
                Začnite otázkou, alebo úlohou, napríklad: „Čo je najvhodnejší nasledovný krok?"
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={
                msg.role === "user"
                  ? "ml-12 flex justify-end"
                  : "mr-12 flex justify-start"
              }
            >
              <div
                className={
                  msg.role === "user"
                    ? "rounded-2xl bg-blue-600 px-4 py-3 text-sm text-white shadow-sm"
                    : "rounded-2xl bg-slate-100 px-4 py-3 text-sm text-slate-800 shadow-sm"
                }
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
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
