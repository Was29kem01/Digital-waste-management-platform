import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        moss: {
          DEFAULT: 'var(--color-moss)',
          dark: 'var(--color-moss-dark)',
          light: 'var(--color-moss-light)',
        },
        clay: 'var(--color-clay)',
        sand: 'var(--color-sand)',
        paper: 'var(--color-paper)',
        line: 'var(--color-line)',
        ink: 'var(--color-ink)',
        muted: 'var(--color-muted)',
        amber: 'var(--color-amber)',
        ok: 'var(--color-ok)',
        red: 'var(--color-red)',
        deep: {
          success: 'var(--color-deep-success)',
          warning: 'var(--color-deep-warning)',
          error: 'var(--color-deep-error)',
        }
      },
      fontFamily: {
        fraunces: ['var(--font-fraunces)'],
        space: ['var(--font-space-grotesk)'],
      },
      keyframes: {
        'fade-slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 10px rgba(72,118,91,0.5))' },
          '50%': { opacity: '0.7', filter: 'drop-shadow(0 0 20px rgba(72,118,91,0.8))' },
        }
      },
      animation: {
        'fade-slide-up': 'fade-slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
export default config
