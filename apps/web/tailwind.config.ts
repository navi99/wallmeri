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
        // Wallmeri palette (WallMeriColorTheme.jpeg):
        // Cotton #EDEBDD · Cherry Red #810100 · Maroon #630000 · Noir Black #1B1717
        brand: {
          50: "#f8f1ec",
          100: "#f0ded4",
          200: "#e2bfae",
          300: "#cd9379",
          400: "#b05c42",
          500: "#97291a",
          600: "#810100", // Cherry Red — primary actions
          700: "#630000", // Maroon — hover / emphasis
          800: "#4d0303",
          900: "#3a0606",
        },
        cream: "#edebdd", // Cotton — page canvas
        paper: "#fbfaf4", // warm near-white — card surfaces
        ink: "#1b1717", // Noir Black — primary text & dark surfaces
        muted: "#5f5852", // warm grey — secondary text, AA on cream/paper
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      // Steel-gallery design language: sharp edges everywhere except pills.
      borderRadius: {
        DEFAULT: "0",
        sm: "0",
        md: "0",
        lg: "0",
        xl: "0",
        "2xl": "0",
      },
      boxShadow: {
        card: "0 1px 2px rgba(27, 23, 23, 0.05), 0 10px 30px rgba(99, 0, 0, 0.08)",
        lift: "0 2px 4px rgba(27, 23, 23, 0.06), 0 16px 40px rgba(99, 0, 0, 0.14)",
      },
    },
  },
  plugins: [],
};

export default config;
