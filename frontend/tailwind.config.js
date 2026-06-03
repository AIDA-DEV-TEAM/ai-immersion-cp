/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Branding placeholder palette — swap at build time per client.
        brand: {
          DEFAULT: '#4f46e5',
          dark: '#3730a3',
          fg: '#ffffff',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f5f5f7',
          border: '#e5e7eb',
        },
      },
    },
  },
  plugins: [],
}
