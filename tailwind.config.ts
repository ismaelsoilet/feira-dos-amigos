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
        background: '#faf8fd',
        'background-alt': '#f3effa',
        surface: '#ffffff',
        'surface-card': '#fbf9fe',
        'surface-hover': '#f5f0fb',
        'brand-purple': '#7e22ce',
        'brand-deep': '#581c87',
        'brand-light': '#f3e8ff',
        'neon-green': '#15803d',
        'neon-lime': '#16a34a',
        'cosmic-purple': '#6b21a8',
        'cosmic-violet': '#7e22ce',
        'vibrant-purple': '#9333ea',
        'vibrant-magenta': '#c026d3',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
