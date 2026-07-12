"use client";

import { FormEvent, useState } from "react";
import { apiClient, SearchResultItem } from "@/lib/api-client";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: SearchResultItem[];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const query = input.trim();
    if (!query || sending) return;

    setMessages((prev) => [...prev, { role: "user", content: query }]);
    setInput("");
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

  return (
    <div className="mx-auto flex h-screen max-w-3xl flex-col px-6 py-10 md:px-10">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-widest text-magenta">// 04 — ASK</p>
        <h1 className="mt-3 font-display text-3xl font-bold uppercase tracking-wide text-fog">
          <span className="gradient-text">Query terminal.</span>
        </h1>
        <p className="mt-3 max-w-xl text-mist">
          Grounded in your own uploaded documents — never a general-knowledge answer.
        </p>
      </div>

      <div className="my-8 h-px bg-panel-raised" />

      <div className="flex-1 space-y-6 overflow-y-auto pb-6">
        {messages.length === 0 && (
          <div className="rounded-sm border border-dashed border-panel-raised px-6 py-10 text-center">
            <p className="font-display text-sm uppercase tracking-wide text-fog">Awaiting input.</p>
            <p className="mt-1 text-sm text-mist">
              &quot;Show my Python certificates&quot; · &quot;What did I do in my last internship?&quot;
            </p>
          </div>
        )}

        {messages.map((message, i) => (
          <div key={i} className={message.role === "user" ? "text-right" : ""}>
            <div
              className={
                message.role === "user"
                  ? "inline-block max-w-[85%] rounded-sm border border-magenta/40 bg-magenta/10 px-4 py-3 text-left text-sm text-fog shadow-glow-magenta"
                  : "max-w-[85%] rounded-sm border border-cyan/30 bg-panel/60 px-4 py-3 text-sm text-fog"
              }
            >
              {message.content}
            </div>

            {message.sources && message.sources.length > 0 && (
              <div className="mt-2 max-w-[85%] space-y-1">
                <p className="font-mono text-[10px] uppercase tracking-widest text-mist">
                  // sources
                </p>
                {message.sources.map((source, j) => (
                  <p key={j} className="font-mono text-[11px] text-cyan/80">
                    {source.original_filename}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}

        {sending && <p className="font-mono text-xs text-mist">// reading your documents…</p>}
        {error && <p className="font-mono text-xs text-magenta">[ERROR] {error}</p>}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 border-t border-panel-raised pt-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="> ask about your documents…"
          className="flex-1 rounded-sm border border-panel-raised bg-panel/60 px-4 py-2.5 font-mono text-sm text-fog placeholder:text-mist focus:border-cyan focus:outline-none"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="rounded-sm border border-cyan/50 bg-cyan/10 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-cyan shadow-glow-cyan transition-all duration-200 hover:scale-[1.02] hover:bg-cyan/20 disabled:opacity-50 disabled:hover:scale-100"
        >
          Send
        </button>
      </form>
    </div>
  );
}
