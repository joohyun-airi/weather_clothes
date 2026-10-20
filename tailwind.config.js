/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#eef3ff', 100: '#dbe5ff', 500: '#4c6ef5', 600: '#3b5bdb', 700: '#2f4ac0' },
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', '-apple-system', 'Apple SD Gothic Neo', 'Malgun Gothic', 'sans-serif'],
      },
      keyframes: { up: { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } } },
      animation: { up: 'up .22s ease-out' },
    },
  },
  plugins: [],
};
