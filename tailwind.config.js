/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        blue: { 500: "#3B82F6" },
        indigo: { 500: "#6366F1" },
        purple: { 600: "#9333EA" },
        green: { 400: "#4ADE80" },
        emerald: { 500: "#10B981" },
        teal: { 600: "#0D9488" },
      },
      keyframes: {
        "fade-in-down": {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-scale": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        "gradient-x": {
          "0%, 100%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
        },
      },
      animation: {
        "fade-in-down": "fade-in-down 0.6s ease-out",
        "fade-in-up": "fade-in-up 0.6s ease-out",
        "pulse-scale": "pulse-scale 1.5s infinite",
        "gradient-x": "gradient-x 6s ease infinite",
      },
      backgroundSize: {
        "200%": "200% 200%",
      },
    },
  },
  plugins: [],
};
