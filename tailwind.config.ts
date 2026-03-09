import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        text: "var(--text)",
        card: "var(--card)",
        accent: "var(--accent)",
        muted: "var(--muted)",
      },
      boxShadow: {
        soft: "0 20px 45px -25px rgba(15, 23, 42, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
