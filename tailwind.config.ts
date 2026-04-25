import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      colors: {
        macaron: {
          pink: "#FFB6C1",
          peach: "#FFD4B8",
          lemon: "#FFF1A8",
          mint: "#B8F0D6",
          sky: "#B8DCFF",
          lilac: "#D8C4FF",
          rose: "#FF8FA3",
          cream: "#FFF8F3",
        },
        glass: {
          DEFAULT: "rgba(255, 255, 255, 0.45)",
          light: "rgba(255, 255, 255, 0.65)",
          heavy: "rgba(255, 255, 255, 0.25)",
          dark: "rgba(20, 20, 30, 0.45)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        hand: ["var(--font-hand-en)"],
      },
      backgroundImage: {
        "macaron-gradient":
          "linear-gradient(135deg, #FFB6C1 0%, #FFD4B8 25%, #FFF1A8 50%, #B8F0D6 75%, #B8DCFF 100%)",
        "macaron-soft":
          "linear-gradient(135deg, rgba(255,182,193,0.4) 0%, rgba(216,196,255,0.4) 50%, rgba(184,220,255,0.4) 100%)",
        "macaron-warm":
          "linear-gradient(135deg, #FFE0E9 0%, #FFE9D6 50%, #FFF6D6 100%)",
        "macaron-cool":
          "linear-gradient(135deg, #D8E9FF 0%, #DDD0FF 50%, #FFD0F0 100%)",
        "shimmer":
          "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.6) 50%, transparent 70%)",
      },
      boxShadow: {
        glass:
          "0 8px 32px 0 rgba(31, 38, 135, 0.15), inset 0 1px 0 0 rgba(255,255,255,0.6)",
        "glass-lg":
          "0 12px 48px 0 rgba(31, 38, 135, 0.2), inset 0 1px 0 0 rgba(255,255,255,0.7), inset 0 -1px 0 0 rgba(255,255,255,0.2)",
        "glass-inner":
          "inset 0 2px 8px 0 rgba(255,255,255,0.6), inset 0 -2px 8px 0 rgba(0,0,0,0.05)",
        glow: "0 0 24px 0 rgba(255, 143, 163, 0.5)",
        "glow-mint": "0 0 24px 0 rgba(184, 240, 214, 0.7)",
      },
      backdropBlur: {
        xs: "2px",
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float 10s ease-in-out infinite",
        shimmer: "shimmer 2.5s linear infinite",
        "pulse-soft": "pulse-soft 3s ease-in-out infinite",
        "heart-beat": "heart-beat 1.4s ease-in-out infinite",
        "fade-up": "fade-up 0.6s ease-out forwards",
        "scale-in": "scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "spin-slow": "spin 12s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
          "50%": { transform: "translateY(-20px) translateX(10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "heart-beat": {
          "0%, 100%": { transform: "scale(1)" },
          "15%": { transform: "scale(1.15)" },
          "30%": { transform: "scale(1)" },
          "45%": { transform: "scale(1.1)" },
          "60%": { transform: "scale(1)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.9)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
