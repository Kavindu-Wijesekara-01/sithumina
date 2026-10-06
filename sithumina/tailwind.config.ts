import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: "var(--y)",
          soft: "var(--y2)",
          tint: "var(--y3)",
          ink: "var(--ink)",
          muted: "var(--mut)",
          border: "var(--line)",
          live: "var(--ok)",
          bg: "var(--bg)",
          card: "var(--card)",
        },
      },
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "var(--font-noto-sinhala)", "system-ui", "sans-serif"],
      },
      animation: {
        pulseDot: "pu 1.6s infinite",
        pulseRing: "pu2 2s infinite",
      },
      keyframes: {
        pu: {
          "50%": { boxShadow: "0 0 0 6px rgba(30,158,90,.25)" },
        },
        pu2: {
          "0%": { transform: "scale(0.6)", opacity: "0.7" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
