import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['"Noto Kufi Arabic"', 'var(--font-noto-kufi)', 'system-ui', 'sans-serif'],
        kufi: ['"Noto Kufi Arabic"', 'var(--font-noto-kufi)', 'system-ui', 'sans-serif'],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        gov: {
          navy: "#0F2942",
          "navy-hover": "#163859",
          "navy-dark": "#0A1D30",
          slate: "#F8FAFC",
          surface: "#FFFFFF",
          approved: "#065F46",
          "approved-bg": "#ECFDF5",
          "approved-border": "#A7F3D0",
          pending: "#92400E",
          "pending-bg": "#FFFBEB",
          "pending-border": "#FDE68A",
          rejected: "#991B1B",
          "rejected-bg": "#FEF2F2",
          "rejected-border": "#FECACA",
        },
        odoo: {
          purple: "#714B67",
          "purple-hover": "#5D3D55",
          "purple-dark": "#492E43",
          "purple-light": "#F3EDF2",
          teal: "#017E84",
          "teal-hover": "#00676C",
          "teal-light": "#E2F7F2",
          gray: "#F9F9FB",
          canvas: "#F1F2F6",
          border: "#DEE2E6",
          dark: "#212529",
          muted: "#6C757D",
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
        accent: {
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
    },
  },
  plugins: [],
};

export default config;
