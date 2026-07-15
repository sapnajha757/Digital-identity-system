"use client";

import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api-client";
import { fireUploadDiscoveries } from "@/lib/discovery-store";

interface UploadControlProps {
  onUploaded?: () => void;
}

const MAGIC_STEPS = [
  { id: "ocr", label: "OCR Scanning", icon: "🔍", desc: "Extracting text, tables, and symbols" },
  { id: "ai", label: "AI Understanding", icon: "🧠", desc: "Classifying entities and context" },
  { id: "skills", label: "Skill Extraction", icon: "⚡", desc: "Identifying competencies and expertise" },
  { id: "graph", label: "Knowledge Graph Grows", icon: "🕸️", desc: "Mapping relationships to existing nodes" },
  { id: "score", label: "Identity Score Updates", icon: "📈", desc: "Recalculating completeness index" },
  { id: "twin", label: "Career Twin Recalculates", icon: "👥", desc: "Updating professional narrative" },
  { id: "timeline", label: "Timeline Updated", icon: "⏳", desc: "Placing event in chronological journey" },
  { id: "done", label: "Analysis Complete", icon: "✓", desc: "All systems updated successfully" },
];

const AI_MESSAGES = [
  "I found 3 new React skills.",
  "I linked Docker to your Internship.",
  "I detected leadership experience.",
  "I increased your Recruiter Readiness by 6%.",
  "I discovered 12 new relationships.",
  "I updated your Career Twin narrative.",
];

export function UploadControl({ onUploaded }: UploadControlProps) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [magicStep, setMagicStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [filename, setFilename] = useState("");
  const [aiMessage, setAiMessage] = useState("");
  const [aiMessageIdx, setAiMessageIdx] = useState(0);
  const [done, setDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const runMagicSequence = async (file: File) => {
    setFilename(file.name);
    setMagicStep(0);
    setCompletedSteps(new Set());
    setDone(false);

    // Fire AI discovery toasts
    fireUploadDiscoveries(file.name);

    // Cycle through AI messages
    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % AI_MESSAGES.length;
      setAiMessage(AI_MESSAGES[msgIdx]);
      setAiMessageIdx(msgIdx);
    }, 600);

    // Step through magic pipeline
    for (let i = 0; i < MAGIC_STEPS.length; i++) {
      setMagicStep(i);
      await new Promise((r) => setTimeout(r, i === MAGIC_STEPS.length - 1 ? 400 : 520));
      setCompletedSteps((prev) => new Set([...prev, i]));
    }

    clearInterval(msgInterval);
    setAiMessage("All systems updated. IdentityOS is ready.");
    setDone(true);

    setTimeout(() => {
      setUploading(false);
      setMagicStep(-1);
      setCompletedSteps(new Set());
      setFilename("");
      setDone(false);
      setAiMessage("");
      onUploaded?.();
    }, 1200);
  };

  const handleFile = useCallback(
    async (file: File) => {
      if (!file) return;
      setUploading(true);
      try {
        await apiClient.uploadDocument(file);
        await runMagicSequence(file);
      } catch {
        setUploading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onUploaded]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <>
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && fileRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-300 select-none
          ${dragging ? "border-cyan bg-cyan/8 scale-[1.01]" : "border-panel-raised hover:border-cyan/40 hover:bg-cyan/3"}
          ${uploading ? "pointer-events-none opacity-50" : ""}
        `}
      >
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        <div className="space-y-2">
          <div className="w-10 h-10 mx-auto rounded-full border border-cyan/30 bg-cyan/5 flex items-center justify-center">
            <span className="text-cyan text-lg">📤</span>
          </div>
          <p className="font-mono text-[10px] text-mist">
            Drop PDF, DOC, or Image
          </p>
          <p className="font-mono text-[9px] text-mist/40">Click to browse files</p>
        </div>
        {dragging && (
          <motion.div
            className="absolute inset-0 rounded-xl border-2 border-cyan pointer-events-none"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </div>

      {/* MAGIC MOMENT Overlay */}
      <AnimatePresence>
        {uploading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#07090F]/85 backdrop-blur-lg"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 22, stiffness: 220 }}
              className="w-full max-w-md mx-4 rounded-2xl border border-cyan/20 overflow-hidden"
              style={{
                background: "rgba(11,17,30,0.95)",
                boxShadow: "0 0 60px rgba(79,140,255,0.12), 0 8px 40px rgba(0,0,0,0.5)",
              }}
            >
              {/* Header */}
              <div className="border-b border-white/5 px-6 py-4">
                <div className="flex items-center gap-2">
                  <motion.span
                    className="w-2 h-2 rounded-full bg-cyan"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  />
                  <span className="font-mono text-[9px] text-cyan uppercase tracking-widest font-bold">
                    AI MAGIC MOMENT
                  </span>
                </div>
                <h3 className="font-display font-black text-lg text-fog mt-1 uppercase">
                  Analyzing <span className="text-cyan">{filename}</span>
                </h3>
              </div>

              {/* Pipeline steps */}
              <div className="px-6 py-5 space-y-2.5">
                {MAGIC_STEPS.map((step, idx) => {
                  const isCompleted = completedSteps.has(idx);
                  const isActive = magicStep === idx && !isCompleted;
                  return (
                    <div
                      key={step.id}
                      className={`flex items-center gap-3 transition-all duration-300 ${
                        isCompleted ? "opacity-100" : isActive ? "opacity-100" : "opacity-25"
                      }`}
                    >
                      <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                        {isCompleted ? (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-cyan font-bold text-sm"
                          >
                            ✓
                          </motion.span>
                        ) : isActive ? (
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="text-sm"
                          >
                            {step.icon}
                          </motion.span>
                        ) : (
                          <span className="text-sm opacity-40">{step.icon}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <span
                          className={`font-mono text-[11px] font-bold block ${
                            isCompleted ? "text-fog" : isActive ? "text-cyan" : "text-mist/40"
                          }`}
                        >
                          {step.label}
                        </span>
                        {isActive && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="font-mono text-[9px] text-mist/60 block"
                          >
                            {step.desc}
                          </motion.span>
                        )}
                      </div>
                      {isCompleted && (
                        <span className="font-mono text-[9px] text-cyan/60">OK</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Progress bar */}
              <div className="px-6 pb-2">
                <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #4F8CFF, #00F0FF)", boxShadow: "0 0 8px #4F8CFF" }}
                    animate={{ width: `${done ? 100 : (completedSteps.size / MAGIC_STEPS.length) * 100}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* AI Copilot speech */}
              <AnimatePresence mode="wait">
                {aiMessage && (
                  <motion.div
                    key={aiMessage}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="mx-6 mb-5 mt-3 flex items-start gap-2 bg-cyan/5 border border-cyan/15 rounded-xl px-4 py-3"
                  >
                    <span className="text-sm shrink-0">🤖</span>
                    <div>
                      <span className="font-mono text-[9px] text-cyan/70 uppercase tracking-wider block mb-0.5">AI Copilot says:</span>
                      <span className="font-mono text-[11px] text-fog italic">&ldquo;{aiMessage}&rdquo;</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
