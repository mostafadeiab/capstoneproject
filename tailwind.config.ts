import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#00A4CC',
        'primary-dark': '#008FBF',
        accent: '#00796B',
        'accent-dark': '#005B4F',
        background: '#F0F0F0',
      },
    },
  },
  plugins: [],
} satisfies Config;
