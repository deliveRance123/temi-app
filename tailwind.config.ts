import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: {
            DEFAULT: "#2563EB",
            50: "#EFF6FF",
            100: "#DBEAFE",
            400: "#60A5FA",
            500: "#3B82F6",
            600: "#2563EB",
            700: "#1D4ED8",
            900: "#1E3A8A",
          },
          gold: {
            DEFAULT: "#F59E0B",
            light: "#FEF3C7",
            mango: "#FBBF24",
            dark: "#D97706",
          },
          coral: {
            DEFAULT: "#FF4D6D",
            light: "#FFE4E8",
            bright: "#FF6584",
          },
          lavender: {
            DEFAULT: "#818CF8",
            light: "#EEF2FF",
            pastel: "#C7D2FE",
          },
        },
      },
      boxShadow: {
        "3d-btn": "0 6px 0 0 rgba(0, 0, 0, 0.2)",
        "3d-btn-active": "0 2px 0 0 rgba(0, 0, 0, 0.2)",
        "3d-gold": "0 6px 0 0 #B45309",
        "3d-blue": "0 6px 0 0 #1D4ED8",
        "3d-coral": "0 6px 0 0 #BE123C",
        "3d-card": "0 10px 25px -5px rgba(37, 99, 235, 0.1), 0 8px 10px -6px rgba(37, 99, 235, 0.1)",
        "glow-blue": "0 0 20px rgba(59, 130, 246, 0.4)",
        "glow-gold": "0 0 20px rgba(251, 191, 36, 0.4)",
      },
      borderRadius: {
        "3xl": "1.75rem",
        "4xl": "2.25rem",
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "BlinkMacSystemFont", "'Segoe UI'", "Roboto", "sans-serif"],
        reading: ["'Comic Neue'", "'Quicksand'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
