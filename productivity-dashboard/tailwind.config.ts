import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0b0d12',
        panel: '#12151c',
        panel2: '#181c25',
        border: '#242938',
        accent: '#6366f1',
        accent2: '#22d3ee',
        muted: '#8a90a2',
      },
      borderRadius: {
        xl: '14px',
      },
    },
  },
  plugins: [],
};
export default config;
