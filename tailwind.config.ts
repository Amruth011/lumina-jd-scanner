import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: "class",
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Outfit", "sans-serif"],
        serif: ["Instrument Serif", "serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        xs: ["0.875rem", { lineHeight: "1.25rem" }],
        sm: ["1rem", { lineHeight: "1.5rem" }],
      },
        colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        lumina: {
          teal: "#10B981",
          navy: "#1E2A3A",
          "navy-dark": "#0D1520",
          "teal-light": "#ECFDF5",
          "teal-dark": "#065f46",
          bg: "#F4F5F7",
        },
        accent: {
          blue: "hsl(var(--accent-blue))",
          emerald: "hsl(var(--accent-emerald))",
          violet: "hsl(var(--accent-violet))",
          amber: "hsl(var(--accent-amber))",
          red: "hsl(var(--accent-red))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent_alt: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "scan": {
          "0%": { top: "0%", opacity: "1" },
          "50%": { opacity: "0.5" },
          "100%": { top: "100%", opacity: "1" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(210 100% 55% / 0.3)" },
          "50%": { boxShadow: "0 0 40px hsl(210 100% 55% / 0.6)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        draw: {
          from: { strokeDasharray: "0, 1000" },
          to: { strokeDasharray: "1000, 1000" },
        },
        shimmer: {
          "0%": { left: "-100%" },
          "100%": { left: "200%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "scan": "scan 1.5s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        marquee: "marquee 30s linear infinite",
        draw: "draw 2s ease-out infinite",
        shimmer: "shimmer 3s infinite",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
