/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        arena: {
          bg: "#0a0a0f",
          surface: "#12121a",
          border: "#1e1e2e",
          accent: "#8b5cf6", // Purple accent
          "accent-dim": "#6d28d9",
          success: "#22c55e",
          danger: "#ef4444",
          warning: "#f59e0b",
          iron: "#71717a",
          bronze: "#d97706",
          silver: "#94a3b8",
          gold: "#eab308",
          diamond: "#06b6d4",
        },
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};
