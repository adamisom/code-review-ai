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
        background: "#1e1e1e",
        foreground: "#d4d4d4",
        border: "#3e3e3e",
        primary: "#4a9eff",
        secondary: "#6c757d",
        accent: "#7c3aed",
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
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
