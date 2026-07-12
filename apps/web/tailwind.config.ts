import type { Config } from "tailwindcss";

// The single accent red — the hero-banner red (Premium Red). Shared between
// the brand and premium ramps so the two can never drift apart.
const red600 = "#b32624"; // Premium Red — primary actions, kickers, price, drench bands
const red700 = "#8f1b1a"; // pressed / hover, emphasis text

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Wallmeri palette:
        // Cotton #FAF9F6 · Premium Red #B32624 · Noir Black #1B1717
        brand: {
          50: "#f8f1ec",
          100: "#f0ded4",
          200: "#e2bfae",
          300: "#cd9379",
          400: "#b05c42",
          500: "#c9524a",
          600: red600, // Premium Red — primary actions
          700: red700, // pressed / hover, emphasis
          800: "#6d1413",
          900: "#4a0d0c",
        },
        // Premium Red tints for red-drenched surfaces (home/About hero bands).
        // 600/700 are the same red as brand-600/700 — one accent, two ramps.
        // Cotton text on premium-600 is 6.2:1; premium-600 on cream is 6.2:1.
        premium: {
          100: "#f7dedd",
          300: "#e08f8b",
          600: red600,
          700: red700,
        },
        cream: "#faf9f6", // Cotton — page canvas
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
        card: "0 1px 2px rgba(27, 23, 23, 0.05), 0 10px 30px rgba(143, 27, 26, 0.08)",
        lift: "0 2px 4px rgba(27, 23, 23, 0.06), 0 16px 40px rgba(143, 27, 26, 0.14)",
      },
    },
  },
  plugins: [],
};

export default config;
