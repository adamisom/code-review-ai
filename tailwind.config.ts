import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border)",
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        accent: "var(--accent)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        "hover-bg": "var(--hover-bg)",
        "editor-bg": "var(--editor-bg)",
        thread: {
          blue: "#4a9eff",
          purple: "#a855f7",
          green: "#22c55e",
          orange: "#f59e0b",
          pink: "#ec4899",
          cyan: "#06b6d4",
          yellow: "#eab308",
          red: "#f87171",
        },
      },
    },
  },
  plugins: [],
};
export default config;
