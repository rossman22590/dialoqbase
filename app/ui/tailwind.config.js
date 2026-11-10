/** @type {import('tailwindcss').Config} */
const token = (name) => `rgb(var(--c-${name}) / <alpha-value>)`;

export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Theme-aware tokens, defined in src/index.css (light + .dark).
        app: token('app'),
        canvas: token('canvas'),
        chrome: token('chrome'),
        sidebar: token('sidebar'),
        surface: {
          DEFAULT: token('surface'),
          2: token('surface-2'),
          3: token('surface-3'),
        },
        line: {
          DEFAULT: token('line'),
          strong: token('line-strong'),
        },
        fg: {
          DEFAULT: token('fg'),
          muted: token('fg-muted'),
          subtle: token('fg-subtle'),
        },
      },
      // Bare `border` / `divide-*` classes pick up the theme hairline.
      borderColor: {
        DEFAULT: token('line'),
      },
      boxShadow: {
        soft: '0 1px 2px rgb(16 16 24 / 0.04), 0 1px 3px rgb(16 16 24 / 0.04)',
        raised:
          '0 1px 2px rgb(16 16 24 / 0.05), 0 8px 24px -12px rgb(16 16 24 / 0.18)',
        float:
          '0 2px 4px rgb(16 16 24 / 0.04), 0 16px 40px -16px rgb(16 16 24 / 0.28)',
        brand: '0 1px 2px rgb(16 16 24 / 0.06)',
        focus: '0 0 0 4px rgb(79 70 229 / 0.14)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'none' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'none' },
        },
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to: { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.3s ease-out both',
        'scale-in': 'scale-in 0.25s cubic-bezier(0.22, 1, 0.36, 1) both',
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
