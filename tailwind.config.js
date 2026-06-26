/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          0: '#0a0a0f',
          1: '#12121a',
          2: '#1a1a25',
          3: '#222230',
        },
        accent: {
          DEFAULT: '#7c6bf5',
          hover: '#9584ff',
          dim: '#5a4dc4',
        },
        text: {
          primary: '#e8e6f0',
          secondary: '#9994b8',
          muted: '#6b6589',
        },
        border: {
          DEFAULT: '#2a2a3a',
          hover: '#3a3a50',
        },
        success: '#4ade80',
        warning: '#fbbf24',
      }
    }
  },
  plugins: []
}
