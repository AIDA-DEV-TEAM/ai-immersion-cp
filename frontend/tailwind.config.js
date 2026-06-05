/** @type {import('tailwindcss').Config} */

// Resolve a semantic color from a CSS variable while preserving Tailwind's
// <alpha-value> support (e.g. bg-brand/10). Tokens are RGB triplets in index.css.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: token('bg'),
        surface: {
          DEFAULT: token('surface'),
          muted: token('surface-muted'),
          // Alias kept so pre-Stage-2 components still resolve; prefer `border-border`.
          border: token('border'),
        },
        border: token('border'),
        fg: {
          DEFAULT: token('fg'),
          muted: token('fg-muted'),
        },
        brand: {
          DEFAULT: token('brand'),
          strong: token('brand-strong'),
          // Alias for legacy `bg-brand-dark`; superseded by `brand-strong`.
          dark: token('brand-strong'),
          fg: token('brand-fg'),
        },
        accent: {
          DEFAULT: token('accent'),
          strong: token('accent-strong'),
          fg: token('accent-fg'),
        },
        danger: {
          DEFAULT: token('danger'),
          surface: token('danger-surface'),
          fg: token('danger-fg'),
        },
      },
      borderRadius: {
        lg: '0.625rem',
        xl: '0.875rem',
        '2xl': '1.125rem',
      },
      boxShadow: {
        card: '0 1px 2px rgb(0 0 0 / 0.04), 0 4px 16px rgb(0 0 0 / 0.06)',
        focus: '0 0 0 2px rgb(var(--brand) / 0.45)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'thinking-bounce': {
          '0%, 80%, 100%': { opacity: '0.25' },
          '40%': { opacity: '1' },
        },
        // Opacity-only (no transform) so streamed text eases in without shifting.
        'text-fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.22s ease-out both',
        'thinking-bounce': 'thinking-bounce 1.2s ease-in-out infinite',
        'text-fade-in': 'text-fade-in 0.14s ease-out both',
      },
    },
  },
  plugins: [],
}
