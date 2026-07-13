"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";

interface CopilotItem {
  id: string;
  category: string;
  message: string;
  reason: string;
  action: string;
  impact: string;
}

export function CopilotPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [copilotData, setCopilotData] = useState<CopilotItem[]>([]);

  useEffect(() => {
    // Generate realistic, live proactive suggestions
    setCopilotData([
      {
        id: "c1",
        category: "DAILY BRIEFING",
        message: "Your Resume hasn't been updated in 5 months.",
        reason: "The system detected 3 new backend projects in your workspace that are not represented in your uploaded Resume.pdf metadata.",
        action: "Export optimized dossier or upload an updated resume draft.",
        impact: "HIGH IMPACT (+8 pts)"
      },
      {
        id: "c2",
        category: "SKILLS GAP",
        message: "Acquiring Kubernetes framework validation could unlock 4 new cloud engineering roles.",
        reason: "Analyzing current technology trends in ML systems indicates Kubernetes is required for 92% of AI Infrastructure roles.",
        action: "Upload a training certificate or connect a GitHub repository deploying Docker/K8s files.",
        impact: "MEDIUM IMPACT (+5 pts)"
      },
      {
        id: "c3",
        category: "IDENTITY VELOCITY",
        message: "You recently connected React with four different projects.",
        reason: "Ingested project reports show a high frontend design capability. Mapped technology trends indicate Full Stack readiness.",
        action: "Export Recruiter Dossier emphasizing modern NextJS/React stacks.",
        impact: "LOW IMPACT"
      }
    ]);
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop blur click target */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-void/50 backdrop-blur-sm"
          />

          {/* Sliding copilot menu drawer container */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed inset-y-0 right-0 z-50 w-80 md:w-96 border-l border-panel-raised bg-panel/95 backdrop-blur-xl p-6 flex flex-col h-full overflow-y-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-panel-raised pb-3 mb-6">
              <div>
                <span className="font-mono text-[9px] text-magenta tracking-widest font-bold block">// COGNITIVE COPILOT ACTIVE</span>
                <h3 className="font-display text-md font-bold uppercase tracking-wider text-fog mt-0.5">Intelligence Panel</h3>
              </div>
              <button
                onClick={onClose}
                className="text-[10px] font-mono text-mist hover:text-magenta border border-panel-raised px-2.5 py-1 rounded bg-void transition-colors"
              >
                [CLOSE]
              </button>
            </div>

            {/* List scrollbar content container */}
            <div className="flex-1 space-y-5 overflow-y-auto pr-1">
              {copilotData.map((item) => (
                <div
                  key={item.id}
                  className="border border-panel-raised p-4 bg-void/40 rounded-lg space-y-2 hover:border-cyan/35 transition-all"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] font-mono font-bold tracking-wider text-cyan border border-cyan/25 bg-cyan/5 px-1.5 py-0.5 rounded">
                      {item.category}
                    </span>
                    <span className="text-[8.5px] font-mono text-magenta font-bold">{item.impact}</span>
                  </div>

                  <h4 className="text-xs font-semibold text-fog font-sans leading-snug">
                    {item.message}
                  </h4>

                  <div className="bg-void border border-panel-raised/40 p-2.5 rounded font-sans text-[10.5px] text-mist leading-relaxed italic">
                    <span className="text-[9px] font-mono text-cyan block not-italic font-bold mb-1">// reasoning explanation</span>
                    &quot;{item.reason}&quot;
                  </div>

                  <div className="pt-1.5 font-mono text-[9.5px] text-cyan">
                    → Action: {item.action}
                  </div>
                </div>
              ))}
            </div>

            {/* Side-box dashboard footer shortcut links */}
            <div className="border-t border-panel-raised/50 pt-4 mt-6 space-y-2.5 font-mono text-[10px]">
              <Link
                href="/explainability"
                onClick={onClose}
                className="block text-center border border-cyan/40 hover:border-cyan text-cyan py-2 rounded bg-cyan/5 tracking-wider font-bold transition-all"
              >
                [AI Explainability Center]
              </Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
