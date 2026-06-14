import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Red + white pastel palette. Brand red is readable on white (AA).
        brand: {
          50: "#fff1f1",
          100: "#ffe0e0",
          200: "#ffc7c7",
          300: "#ffa0a0",
          400: "#fa6b6b",
          500: "#ee4444",
          600: "#d92626", // primary actions — contrast >= 4.5 on white
          700: "#b51d1d",
          800: "#951a1a",
          900: "#7c1c1c",
        },
        cream: "#fffaf7",
        ink: "#2a1f1f", // primary text — high contrast on cream/white
        muted: "#6b5b5b", // secondary text — still AA on white
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.9rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(124, 28, 28, 0.06), 0 8px 24px rgba(124, 28, 28, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
