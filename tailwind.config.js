/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: '#0a0000',
        surface:    '#110000',
        surfaceHover:'#1a0000',
        primary:    '#ff0000',
        textMain:   '#f5f0f0',
        textMuted:  '#6b5555',
        borderDark: '#2a0000',
        borderLight:'#3d0000',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
