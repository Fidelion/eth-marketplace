module.exports = {
  purge: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {      
      maxWidth: {
        "8xl": "1920px"
      },
      flex: {
        "2": "2 2 0%"
      }
    },
  },
  variants: {
    extend: {
      opacity: ["disabled"],
      cursor: ["disabled"]
    },
  },
  plugins: [],
}
