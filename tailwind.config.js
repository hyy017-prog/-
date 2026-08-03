/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // 品牌識別色：以 Bambu Lab 的工程綠為靈感，但更沉穩，避免落入常見的暖橘/米色套版
        brand: {
          50: "#eafbf4",
          100: "#cdf5e3",
          200: "#9de9c9",
          300: "#63d6a9",
          400: "#31bd8b",
          500: "#0fa374",
          600: "#08825c",
          700: "#08684c",
          800: "#0a533e",
          900: "#0a4534",
        },
        surface: {
          light: "#FAFAF9",
          card: "#FFFFFF",
          dark: "#131417",
          "dark-card": "#1C1D21",
        },
        ink: {
          900: "#14161A",
          700: "#3A3D44",
          500: "#6B6F78",
          300: "#A6AAB2",
          100: "#E4E6EA",
        },
      },
      fontFamily: {
        display: ["'Sora'", "system-ui", "sans-serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(20,22,26,0.04), 0 8px 24px -12px rgba(20,22,26,0.10)",
        "card-dark": "0 1px 2px rgba(0,0,0,0.3), 0 8px 24px -12px rgba(0,0,0,0.5)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: 0, transform: "translateY(4px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
      },
    },
  },
  plugins: [],
};
