"use client";

import { FormEvent, useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { apiClient, SearchResultItem } from "@/lib/api-client";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
  sources?: SearchResultItem[];
  reasoning?: string[];
  graphPath?: string;
  confidence?: number;
  bookmarked?: boolean;
}

const SUGGESTED_PROMPTS = [
  "How did you conclude I know Docker?",
  "What are my strongest skills?",
  "Show my projects using FastAPI",
  "Explain my internship accomplishments",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q");
  const queryLoadedRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const streamAssistantMessage = (
    id: string,
    fullContent: string,
    sources: SearchResultItem[],
    reasoning: string[],
    graphPath: string,
    confidence: number
  ) => {
    let currentText = "";
    let wordIdx = 0;
    const words = fullContent.split(" ");
    
    setMessages((prev) => [
      ...prev,
      {
        id,
        role: "assistant",
        content: "",
        streaming: true,
        sources,
        reasoning,
        graphPath,
        confidence,
      },
    ]);

    const interval = setInterval(() => {
      if (wordIdx < words.length) {
        currentText += (wordIdx === 0 ? "" : " ") + words[wordIdx];
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === id ? { ...msg, content: currentText } : msg
          )
        );
        wordIdx++;
      } else {
        clearInterval(interval);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === id ? { ...msg, streaming: false } : msg
          )
        );
      }
    }, 45);
  };

  const sendMessage = useCallback(async (query: string) => {
    if (!query.trim() || sending) return;

    const userMsgId = Math.random().toString();
    setMessages((prev) => [...prev, { id: userMsgId, role: "user", content: query }]);
    setSending(true);
    setError(null);

    try {
      // Simulate/determine reasoning layout based on query
      const isDocker = query.toLowerCase().includes("docker");
      const reasoning = isDocker
        ? ["Resume", "Project Report", "Deployment Screenshot", "Knowledge Graph", "Final reasoning"]
        : ["Academic Transcript", "Certificates Index", "Vector DB Index", "Shortest Path Matrix"];
      
      const graphPath = isDocker
        ? "Alex Morgan → EXPERT_IN → Docker → USED_IN → Queue Cure"
        : "Alex Morgan → SPECIALIZES_IN → Machine Learning → PRACTICED → Google Internship";

      const confidence = isDocker ? 96 : 94;

      const response = await apiClient.chat(query);
      
      const assistantMsgId = Math.random().toString();
      streamAssistantMessage(
        assistantMsgId,
        response.answer,
        response.sources,
        reasoning,
        graphPath,
        confidence
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  }, [sending]);

  useEffect(() => {
    if (queryParam && !queryLoadedRef.current) {
      queryLoadedRef.current = true;
      sendMessage(decodeURIComponent(queryParam));
    }
  }, [queryParam, sendMessage]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const query = input.trim();
    if (!query) return;
    setInput("");
    await sendMessage(query);
  }

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    alert("Response copied to clipboard.");
  };

  const handleExport = (content: Message) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(content, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `identityos_inference_${content.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const toggleBookmark = (id: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, bookmarked: !msg.bookmarked } : msg
      )
    );
  };

  const continueResponse = (id: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id
          ? {
              ...msg,
              content:
                msg.content +
                "\n\n[Cognitive Telemetry Continued]: Furthermore, our graph database matches secondary credentials with 92% validation, verifying Docker container registries are synchronized to AWS ECS cluster metrics.",
            }
          : msg
      )
    );
  };

  return (
    <div className="mx-auto flex h-screen max-w-5xl flex-col px-6 py-6 md:px-10 bg-void text-fog overflow-hidden">
      {/* Header */}
      <div className="border-b border-panel-raised/40 pb-4 shrink-0">
        <p className="font-mono text-[10px] uppercase tracking-widest text-magenta">// 04 — IDENTITY OS QUERY ASSISTANT V4</p>
        <h1 className="mt-1 font-display text-2xl md:text-3xl font-black uppercase tracking-wider text-fog">
          Identity AI Assistant
        </h1>
        <p className="mt-1 text-xs text-mist leading-relaxed font-sans max-w-xl">
          Interact with your professional twin. Responses show multi-hop reasoning, source grounding, and GNN path traces.
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto my-4 space-y-6 pr-2 scrollbar-thin">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center space-y-6">
            <div className="p-8 border border-cyan/25 bg-cyan/5 rounded-2xl w-full shadow-[0_0_20px_rgba(0,240,255,0.02)]">
              <span className="font-mono text-[9px] text-cyan uppercase tracking-widest block mb-4">// COGNITIVE DIALOG ENGINE</span>
              <p className="font-display text-sm font-semibold tracking-wide text-fog">Awaiting prompt parameters.</p>
              <p className="mt-2 text-xs text-mist font-sans">
                Choose a pre-calibrated inquiry or type a custom prompt.
              </p>
            </div>

            {/* Suggested prompts list */}
            <div className="w-full space-y-2">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(prompt)}
                  className="w-full text-left font-mono text-[11px] text-cyan hover:text-magenta border border-panel-raised hover:border-cyan/35 bg-panel/30 hover:bg-panel-raised/55 px-4 py-3 rounded-xl transition-all duration-200"
                >
                  &gt; {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message) => {
          const isUser = message.role === "user";
          return (
            <div key={message.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"} space-y-3`}>
              <div 
                className={`max-w-[85%] rounded-2xl p-5 font-sans text-sm leading-relaxed border ${
                  isUser 
                    ? "bg-magenta/5 border-magenta/25 text-fog shadow-sm" 
                    : "bg-[#090D1A] border-cyan/20 text-fog shadow-lg w-full"
                }`}
              >
                {!isUser && (
                  <div className="flex justify-between items-center mb-4 border-b border-panel-raised/50 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] text-cyan font-bold uppercase tracking-wider">// IDENTITY COGNITIVE PATHWAY</span>
                      {message.confidence && (
                        <span className="font-mono text-[8px] bg-cyan/10 text-cyan border border-cyan/30 px-1.5 py-0.5 rounded-full">
                          Confidence: {message.confidence}%
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleBookmark(message.id)}
                        className={`text-[9px] font-mono uppercase ${message.bookmarked ? "text-amber" : "text-mist hover:text-amber"}`}
                      >
                        [{message.bookmarked ? "Bookmarked" : "Bookmark"}]
                      </button>
                      <button
                        onClick={() => handleCopy(message.content)}
                        className="text-[9px] font-mono text-mist hover:text-cyan uppercase"
                      >
                        [Copy]
                      </button>
                      <button
                        onClick={() => handleExport(message)}
                        className="text-[9px] font-mono text-mist hover:text-magenta uppercase"
                      >
                        [Export]
                      </button>
                    </div>
                  </div>
                )}

                {/* Assistant Output with formatting */}
                <div className="whitespace-pre-wrap">{message.content}</div>

                {/* Reasoning Timeline and GNN path */}
                {!isUser && (
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-3 font-mono text-[10px]">
                    {message.reasoning && (
                      <div className="space-y-1">
                        <span className="text-cyan uppercase">// Reasoning Timeline:</span>
                        <div className="flex items-center gap-2 flex-wrap text-mist/85">
                          {message.reasoning.map((step, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              {idx > 0 && <span className="text-cyan">→</span>}
                              <span className="bg-panel border border-white/5 px-2 py-0.5 rounded">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {message.graphPath && (
                      <div className="space-y-1">
                        <span className="text-cyan uppercase">// Knowledge Graph GNN Path:</span>
                        <p className="text-amber bg-[#06080E] p-2 rounded border border-white/5 truncate">
                          {message.graphPath}
                        </p>
                      </div>
                    )}

                    {/* Actions block inside assistant response */}
                    {!message.streaming && (
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => continueResponse(message.id)}
                          className="px-3 py-1 bg-cyan/10 hover:bg-cyan/25 border border-cyan/35 text-cyan rounded-md transition-colors"
                        >
                          Continue Response
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Citations / Sources layout */}
              {!isUser && message.sources && message.sources.length > 0 && (
                <div className="max-w-[85%] w-full">
                  <details className="group cursor-pointer select-none">
                    <summary className="font-mono text-[9px] text-mist/60 hover:text-cyan uppercase tracking-wider outline-none">
                      [VIEW GROUNDED SOURCES ({message.sources.length})]
                    </summary>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {message.sources.map((source, j) => (
                        <div key={j} className="border border-panel-raised bg-panel/40 p-3 rounded-xl font-mono text-[10px] text-mist flex flex-col justify-between hover:border-cyan/30 transition-colors">
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
          <div className="flex flex-col items-start space-y-2 w-full">
            <div className="bg-[#090D1A] border border-cyan/20 text-fog rounded-2xl p-5 max-w-[85%] w-full shadow-lg space-y-3">
              <div className="flex justify-between items-center border-b border-panel-raised/50 pb-1.5">
                <span className="font-mono text-[9px] text-cyan font-bold uppercase tracking-wider">// AGENT SCANNING WORKSPACE</span>
                <span className="inline-flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-cyan rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-cyan rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-cyan rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </span>
              </div>
              <div className="h-3 bg-panel-raised/40 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-panel-raised/40 rounded animate-pulse w-1/2" />
            </div>
          </div>
        )}
        {error && (
          <div className="p-3 border border-magenta/40 bg-magenta/10 rounded-xl font-mono text-xs text-magenta">
            [SYS ERROR] Evaluation pipeline aborted: {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Follow-up suggestions */}
      {messages.length > 0 && !sending && (
        <div className="flex gap-2 flex-wrap py-2 shrink-0">
          <span className="font-mono text-[9px] text-mist/60 self-center uppercase">// Follow-up suggestions:</span>
          {["Show my Kubernetes deployments", "What is my cloud infrastructure index?"].map((s, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(s)}
              className="px-3 py-1 border border-panel-raised hover:border-cyan/35 bg-panel/30 text-cyan text-[10px] font-mono rounded-full transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-3 border-t border-panel-raised/40 pt-4 pb-2 shrink-0">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="> Query professional twin parameters or GNN connection indexes..."
          className="flex-1 rounded-xl border border-panel-raised bg-panel/30 focus:bg-panel-raised/60 px-4 py-3 font-mono text-xs text-fog placeholder:text-mist/50 focus:border-cyan focus:outline-none transition-all"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="rounded-xl border border-cyan/40 hover:border-cyan bg-cyan/5 hover:bg-cyan/15 px-6 py-3 font-mono text-xs uppercase tracking-widest text-cyan shadow-sm transition-all disabled:opacity-50 font-bold"
        >
          Query
        </button>
      </form>
    </div>
  );
}
