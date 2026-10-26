/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        swyft: {
          orange: '#FF5E00',
          orangeDark: '#E65100',
          orangeLight: '#FFF2EA',
          dark: '#18181B',
          gray: '#71717A',
          lightGray: '#F4F4F5',
          border: '#E4E4E7',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'swyft-card': '0 12px 36px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
        'swyft-button': '0 8px 24px -2px rgba(255, 94, 0, 0.35)',
        'swyft-icon': '0 4px 14px rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}
