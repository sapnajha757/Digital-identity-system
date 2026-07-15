export interface DiscoveryToast {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  accentColor?: "cyan" | "magenta" | "amber";
}

type Listener = (toast: DiscoveryToast) => void;
const listeners = new Set<Listener>();

let idCounter = 0;

export const discoveryStore = {
  subscribe(fn: Listener): () => void {
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  },
  fire(toast: Omit<DiscoveryToast, "id">) {
    const full: DiscoveryToast = { ...toast, id: `toast-${++idCounter}-${Date.now()}` };
    listeners.forEach((fn) => fn(full));
  },
};

// Preset fires for the AI Magic Moment
export function fireUploadDiscoveries(filename: string) {
  const fires: Array<Omit<DiscoveryToast, "id">> = [
    { icon: "🔍", title: "OCR Complete", subtitle: `Extracted 3,240 symbols from ${filename}`, accentColor: "cyan" },
    { icon: "✨", title: "New Skills Found", subtitle: "React, Docker, FastAPI detected", accentColor: "cyan" },
    { icon: "🕸️", title: "Graph Updated", subtitle: "12 new relationships mapped", accentColor: "magenta" },
    { icon: "📈", title: "Identity Score +6%", subtitle: "Now at 94% completeness", accentColor: "amber" },
    { icon: "🧠", title: "AI Insight", subtitle: "Leadership detected across 3 projects", accentColor: "cyan" },
    { icon: "🎯", title: "Career Twin Updated", subtitle: "Recruiter Readiness increased to 91%", accentColor: "magenta" },
  ];
  fires.forEach((f, i) => {
    setTimeout(() => discoveryStore.fire(f), i * 700 + 400);
  });
}
