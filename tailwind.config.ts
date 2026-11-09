import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f071b',
        surface: '#1b0e31',
        'surface-card': '#251343',
        'neon-green': '#39FF14',
        'neon-lime': '#22c55e',
        'cosmic-purple': '#6b21a8',
        'cosmic-violet': '#7e22ce',
        'vibrant-purple': '#9333ea',
        'vibrant-magenta': '#d946ef',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
