/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Light, warm, calm palette
        'shift-bg':           '#FAFAF8',
        'shift-surface':      '#F2F1EF',
        'shift-surface-soft': '#ECEAE6',
        'shift-text':         '#1A1A18',
        'shift-muted':        '#525250',      // darker gray for high contrast
        'shift-accent':       '#2A6F4E',      // richer forest green (AAA contrast compliant)
        'shift-accent-2':     '#3B7E9F',      // richer slate blue
        'shift-warm':         '#B0652F',      // richer warm amber
        'shift-line':         'rgba(26, 26, 24, 0.10)',
        'shift-yellow':       '#FFE600',
      },
      fontFamily: {
        heading: ['"Inter Tight"', '"Space Grotesk"', 'Sora', 'system-ui', 'sans-serif'],
        body: ['Inter', '"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', '"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'shift-in': 'shiftIn 0.6s ease-out forwards',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shiftIn: {
          '0%':   { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
