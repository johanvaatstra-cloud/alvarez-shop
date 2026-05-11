/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        body: '#252525',
        black: '#000000',
        white: '#ffffff',
        accent: '#ab1642',
        surface: '#fafafa',
        muted: '#888888',
        border: '#e0e0e0',
      },
      fontFamily: {
        display: ['Arapey', 'serif'],
        sans: ['Source Sans Pro', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['3rem', { lineHeight: '1.15' }],
        'display-md': ['2rem', { lineHeight: '1.2' }],
      },
    },
  },
  plugins: [],
}
