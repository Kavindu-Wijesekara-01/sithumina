import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--y)",
        "primary-soft": "var(--y2)",
        "primary-tint": "var(--y3)",
        ink: "var(--ink)",
        muted: "var(--mut)",
        surface: "var(--bg)",
        card: "var(--card)",
        line: "var(--line)",
        success: "var(--ok)",
        "success-bg": "var(--okb)",
        brandred: "var(--red)",
        "brandred-bg": "var(--rb)",
        "input-bg": "var(--input-bg)",
        "input-border": "var(--input-border)",
      },
      borderRadius: {
        card: "18px",
        btn: "12px",
        pill: "999px",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0, 0, 0, 0.04)",
        dropdown: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
};

export default config;
