/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        purple: {
          cmb: '#5B2C8D',
          dark: '#3D1A6B',
          light: '#7B4CB0',
          pale: '#EDE7F6',
        },
        brass: {
          cmb: '#B08D57',
          dark: '#8B6A35',
          light: '#D4AA70',
          pale: '#FDF5E6',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Times New Roman', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-cmb': 'linear-gradient(135deg, #3D1A6B 0%, #5B2C8D 50%, #3D1A6B 100%)',
      },
    },
  },
  plugins: [],
}
