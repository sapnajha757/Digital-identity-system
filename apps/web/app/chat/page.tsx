"use client";

import { FormEvent, useState } from "react";
import { apiClient, SearchResultItem } from "@/lib/api-client";
import { HudFrame } from "@/components/HudFrame";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: SearchResultItem[];
}

const SUGGESTED_PROMPTS = [
  "What are my strongest skills?",
  "Show my projects using FastAPI",
  "Explain my internship accomplishments",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMessage(query: string) {
    if (!query.trim() || sending) return;

    setMessages((prev) => [...prev, { role: "user", content: query }]);
    setSending(true);
    setError(null);

    try {
      const response = await apiClient.chat(query);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.answer, sources: response.sources },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const query = input.trim();
    setInput("");
    await sendMessage(query);
  }

  return (
    <div className="mx-auto flex h-screen max-w-4xl flex-col px-6 py-8 md:px-10 bg-void text-fog">
      {/* Header */}
      <div className="border-b border-panel-raised/40 pb-4">
        <p className="font-mono text-[10px] uppercase tracking-widest text-magenta">// 04 — COGNITIVE QUERY</p>
        <h1 className="mt-2 font-display text-2xl md:text-3xl font-black uppercase tracking-wider text-fog">
          Grounded Query AI.
        </h1>
        <p className="mt-1 text-xs text-mist leading-relaxed font-sans max-w-xl">
          Ask questions about your cataloged credentials. Every answer is grounded directly in document source embeddings to prevent hallucinations.
        </p>
      </div>

      {/* Messages Window */}
      <div className="flex-1 space-y-6 overflow-y-auto my-6 pr-2 scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center space-y-6">
            <div className="p-8 border border-panel-raised bg-panel/20 rounded w-full">
              <span className="font-mono text-[9px] text-cyan uppercase tracking-widest block mb-4">// CORE COGNITIVE GATE</span>
              <p className="font-display text-sm font-semibold tracking-wide text-fog">Awaiting prompt parameters.</p>
              <p className="mt-2 text-xs text-mist font-sans">
                Choose a suggested prompt below or type your custom query.
              </p>
            </div>

            {/* Suggested prompts list */}
            <div className="w-full space-y-2">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(prompt)}
                  className="w-full text-left font-mono text-[11px] text-cyan hover:text-magenta border border-panel-raised hover:border-cyan/30 bg-panel/30 hover:bg-panel/50 px-4 py-2.5 rounded transition-all duration-200"
                >
                  &gt; {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, i) => {
          const isUser = message.role === "user";
          return (
            <div key={i} className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-2`}>
              <div 
                className={`max-w-[80%] rounded p-4 font-sans text-sm leading-relaxed border ${
                  isUser 
                    ? "bg-magenta/5 border-magenta/25 text-fog shadow-sm" 
                    : "bg-panel/30 border-cyan/20 text-fog shadow-sm"
                }`}
              >
                {message.content}
              </div>

              {/* Citations / Sources layout */}
              {!isUser && message.sources && message.sources.length > 0 && (
                <div className="max-w-[80%] w-full">
                  <details className="group cursor-pointer select-none">
                    <summary className="font-mono text-[9px] text-mist/60 hover:text-cyan uppercase tracking-wider outline-none">
                      [VIEW GROUNDED SOURCES ({message.sources.length})]
                    </summary>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-fade-in">
                      {message.sources.map((source, j) => (
                        <div key={j} className="border border-panel-raised bg-void/50 p-2.5 rounded font-mono text-[10px] text-mist flex flex-col justify-between">
                          <span className="text-cyan truncate font-semibold block">{source.original_filename}</span>
                          <span className="text-[9px] text-mist/50 mt-1 block">Score: {Math.round(source.score * 100)}% Match</span>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}
            </div>
          );
        })}

        {sending && (
          <div className="flex items-center gap-2 font-mono text-xs text-amber animate-pulse">
            <span>&gt; scanning vector index chunks...</span>
          </div>
        )}
        {error && (
          <div className="p-3 border border-magenta/40 bg-magenta/10 rounded font-mono text-xs text-magenta">
            [SYS ERROR] Query evaluation failed: {error}
          </div>
        )}
      </div>

      {/* Input box form */}
      <form onSubmit={handleSubmit} className="flex gap-3 border-t border-panel-raised/40 pt-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="> query custom dossier params..."
          className="flex-1 rounded-sm border border-panel-raised bg-panel/30 focus:bg-panel/50 px-4 py-3 font-mono text-xs text-fog placeholder:text-mist/50 focus:border-cyan focus:outline-none transition-all"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="rounded-sm border border-cyan/40 hover:border-cyan bg-cyan/5 hover:bg-cyan/10 px-6 py-3 font-mono text-xs uppercase tracking-widest text-cyan shadow-sm transition-all disabled:opacity-50"
        >
          Evaluate
        </button>
      </form>
    </div>
  );
}
