import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#0A0118",
        panel: "#150A2E",
        "panel-raised": "#1E1040",
        cyan: "#00F0FF",
        magenta: "#FF2E9A",
        amber: "#FFB627",
        mist: "#7A7195",
        fog: "#E9E4F0",
      },
      fontFamily: {
        display: ["var(--font-orbitron)", "sans-serif"],
        body: ["var(--font-rajdhani)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      boxShadow: {
        "glow-cyan": "0 0 12px rgba(0, 240, 255, 0.35)",
        "glow-magenta": "0 0 12px rgba(255, 46, 154, 0.35)",
      },
    },
  },
  plugins: [],
};
export default config;
