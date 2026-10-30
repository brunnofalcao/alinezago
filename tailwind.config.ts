import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./content/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        creme: "#F6F2ED",
        marfim: "#FBF7F1",
        taupe: { DEFAULT: "#BCAA99", deep: "#7A6A58", soft: "#E6DED3", line: "#D8CFC3" },
        grafite: { DEFAULT: "#2B2825", 800: "#3A3633" },
        pedra: { DEFAULT: "#8A8580", 700: "#5A5A5A", 600: "#524F4F", 300: "#D3D0CB" },
        ok: "#3F7D5C",
        aviso: "#B9822B",
        erro: "#B04A3C",
      },
      fontFamily: {
        display: ["Raleway", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        "d-1": ["clamp(2.6rem, 5.2vw, 3.8rem)", { lineHeight: "1.05", letterSpacing: "-0.01em" }],
        "d-2": ["clamp(2rem, 3.6vw, 2.75rem)", { lineHeight: "1.12" }],
        "d-3": ["clamp(1.5rem, 2.4vw, 1.95rem)", { lineHeight: "1.2" }],
        lead: ["1.25rem", { lineHeight: "1.55" }],
      },
      maxWidth: { site: "1200px", prose: "68ch" },
      boxShadow: { app: "0 1px 2px rgba(43,40,37,0.06), 0 8px 24px -16px rgba(43,40,37,0.25)" },
    },
  },
  plugins: [],
} satisfies Config;
