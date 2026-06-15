import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        cards: '#111111',
        primary: '#3B82F6',
        glow: '#60A5FA',
        text: '#FFFFFF',
        muted: '#A1A1AA',
      },
      boxShadow: {
        glow: '0 0 15px rgba(96, 165, 250, 0.4), 0 0 30px rgba(59, 130, 246, 0.2)',
        'glow-lg': '0 0 25px rgba(96, 165, 250, 0.5), 0 0 50px rgba(59, 130, 246, 0.3), 0 0 75px rgba(59, 130, 246, 0.1)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
