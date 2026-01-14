"use client";

import type { ReactElement, FormEvent } from "react";
import { useState } from "react";
import { MessageCircle, Sparkles, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function AiChatWidget(): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  function handleToggle(): void {
    if (loading) return;
    setIsOpen((prev) => !prev);
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
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[60] w-80 max-w-[calc(100vw-2rem)] animate-in fade-in-0 zoom-in-95">
          <Card className="rounded-2xl border-slate-200 shadow-xl shadow-slate-900/10">
            <CardHeader className="flex flex-row items-center justify-between gap-2 border-b bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-slate-900">
                    AI asistent
                  </CardTitle>
                  <p className="text-[11px] text-slate-500">
                    Spýtaj sa na stavebné konanie
                  </p>
                </div>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded-full"
                onClick={handleToggle}
                disabled={loading}
              >
                <X className="h-4 w-4 text-slate-500" />
              </Button>
            </CardHeader>

            <CardContent className="flex flex-col gap-3 px-4 py-3">
              <div className="flex max-h-72 flex-col gap-2 overflow-y-auto pr-1 text-sm [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {messages.length === 0 && (
                  <p className="text-[11px] text-slate-400">
                    Začni otázkou, napríklad: „Čo všetko potrebujem pre stavebné
                    povolenie na rodinný dom?“
                  </p>
                )}

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={
                      msg.role === "user"
                        ? "ml-8 flex justify-end"
                        : "mr-8 flex justify-start"
                    }
                  >
                    <div
                      className={
                        msg.role === "user"
                          ? "rounded-2xl bg-blue-600 px-3 py-2 text-[13px] text-white shadow-sm"
                          : "rounded-2xl bg-slate-100 px-3 py-2 text-[13px] text-slate-800 shadow-sm"
                      }
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="mr-8 flex justify-start">
                    <div className="rounded-2xl bg-slate-100 px-3 py-2 text-[13px] text-slate-500 shadow-sm animate-pulse">
                      Zisťujeme…
                    </div>
                  </div>
                )}
              </div>

              <form
                onSubmit={handleSubmit}
                className="flex items-center gap-2 pt-1"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Napíš otázku…"
                  className="h-9 text-sm"
                  disabled={loading}
                />

                <Button
                  type="submit"
                  size="icon"
                  className="h-9 w-9 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  disabled={loading}
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <button
        type="button"
        onClick={handleToggle}
        className="fixed bottom-6 right-6 z-[55] flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/40 transition-transform duration-150 ease-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-50 disabled:opacity-50"
        disabled={loading}
      >
        <img src="/img/logo_3.png" alt="Stavebko" className="h-10 w-10" />
      </button>
    </>
  );
}
