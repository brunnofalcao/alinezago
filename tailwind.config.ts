import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./content/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        creme: "#F6F2ED",
        marfim: "#F3EFE9",
        areia: "#E8E2D6",
        cinza: "#5A5A5A",
        taupe: { DEFAULT: "#BCAA99", deep: "#7A6A58", soft: "#E6DED3", line: "#D8CFC3" },
        grafite: { DEFAULT: "#2B2825", 800: "#3A3633" },
        pedra: { DEFAULT: "#8A8580", 700: "#5A5A5A", 600: "#524F4F", 300: "#D3D0CB" },
        ok: "#3F7D5C",
        aviso: "#B9822B",
        erro: "#B04A3C",
      },
      fontFamily: {
        display: ["Jost", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        "d-1": ["clamp(2.25rem, 4.6vw, 3.5rem)", { lineHeight: "1.06", letterSpacing: "-0.005em" }],
        "d-2": ["clamp(1.75rem, 3.6vw, 2.75rem)", { lineHeight: "1.12" }],
        "d-3": ["clamp(1.5rem, 2.4vw, 1.95rem)", { lineHeight: "1.2" }],
        lead: ["clamp(1.0625rem, 1.3vw, 1.25rem)", { lineHeight: "1.6" }],
      },
      maxWidth: { site: "1200px", prose: "68ch" },
      boxShadow: { app: "0 1px 2px rgba(43,40,37,0.06), 0 8px 24px -16px rgba(43,40,37,0.25)" },
    },
  },
  plugins: [],
} satisfies Config;
