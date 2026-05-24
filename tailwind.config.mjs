/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'shift-bg': '#0E1117',
        'shift-surface': '#151A23',
        'shift-surface-soft': '#1E2530',
        'shift-text': '#F4F1EA',
        'shift-muted': '#A7AFBA',
        'shift-accent': '#C7FF4A',
        'shift-accent-2': '#6EE7F9',
        'shift-warm': '#FF7A59',
        'shift-line': 'rgba(244, 241, 234, 0.14)',
      },
      fontFamily: {
        heading: ['"Inter Tight"', '"Space Grotesk"', 'Sora', 'system-ui', 'sans-serif'],
        body: ['Inter', '"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', '"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'shift-in': 'shiftIn 0.8s ease-out forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shiftIn: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
