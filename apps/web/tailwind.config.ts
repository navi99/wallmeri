import type { Config } from "tailwindcss";

// The single accent red - the hero-banner red (Premium Red). Shared between
// the brand and premium ramps so the two can never drift apart.
const red600 = "#b32624"; // Premium Red - primary actions, kickers, price, drench bands
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
        // WallMeri palette:
        // Cotton #FAF9F6 · Premium Red #B32624 · Noir Black #1B1717
        brand: {
          50: "#f8f1ec",
          100: "#f0ded4",
          200: "#e2bfae",
          300: "#cd9379",
          400: "#b05c42",
          500: "#c9524a",
          600: red600, // Premium Red - primary actions
          700: red700, // pressed / hover, emphasis
          800: "#6d1413",
          900: "#4a0d0c",
        },
        // Premium Red tints for red-drenched surfaces (home/About hero bands).
        // 600/700 are the same red as brand-600/700 - one accent, two ramps.
        // Cotton text on premium-600 is 6.2:1; premium-600 on cream is 6.2:1.
        premium: {
          100: "#f7dedd",
          300: "#e08f8b",
          600: red600,
          700: red700,
        },
        // Neutral light system (2026-07-25). The old neutrals were warm - a
        // cream canvas with an even warmer card fill - which read as parchment
        // rather than gallery. They're now neutral, and `paper` has flipped
        // sides: it used to sit *brighter* than the canvas (raised cards), it
        // now sits *darker* (recessed bands), so alternating sections step
        // down instead of popping up.
        cream: "#fcfcfb", // Cotton - page canvas, neutral off-white
        paper: "#f5f5f4", // recessed band / field fill, one step below canvas
        ink: "#1b1717", // Noir Black - primary text & dark surfaces
        // Body/secondary copy. The reference sets this at #767676, but that is
        // 4.42:1 on the canvas above - under the 4.5:1 AA floor - so it can't
        // be copied verbatim. #6b6b6b is the same grey voice at 5.19:1.
        muted: "#6b6b6b",
        // Hairline. One token for every rule and border on a light surface,
        // replacing the ad-hoc ink/10 and ink/20 alphas.
        line: "#e4e4e2",
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
      // Shadows are neutral (2026-07-25). The soft layer used to be tinted
      // deep red so shadows read as "the brand's own light"; against neutral
      // neutrals that tint showed as a pink halo, so both layers are now ink.
      boxShadow: {
        // x stays 0 on both of the level shadows, so a square-hung surface
        // throws straight down (south) - lit from directly above.
        card: "0 6px 10px rgba(27, 23, 23, 0.08), 0 22px 45px rgba(27, 23, 23, 0.12)",
        lift: "0 2px 4px rgba(27, 23, 23, 0.05), 0 16px 40px rgba(27, 23, 23, 0.10)",
        // The storefront art tiles (see the Hung-Print Rule in DESIGN.md) are
        // the one exception: a print hung on the wall - rather than a plate cut
        // flush into it - catches the gallery light from its upper right, so
        // its shadow throws left and down instead of straight south. It keeps
        // that shadow through the hover tilt; only the print moves.
        frame: "-5px 8px 12px rgba(27, 23, 23, 0.10), -14px 26px 45px rgba(27, 23, 23, 0.14)",
      },
    },
  },
  plugins: [],
};

export default config;
