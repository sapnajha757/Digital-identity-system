import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#07090F",
        panel: "#11151C",
        "panel-raised": "#191F2A",
        cyan: "#4F8CFF",
        magenta: "#7B61FF",
        amber: "#F59E0B",
        mist: "#94A3B8",
        fog: "#F8FAFC",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      boxShadow: {
        "glow-cyan": "0 0 16px rgba(79, 140, 255, 0.25)",
        "glow-magenta": "0 0 16px rgba(123, 97, 255, 0.25)",
      },
    },
  },
  plugins: [],
};
export default config;
