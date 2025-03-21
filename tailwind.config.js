/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}","./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors:{
        primary: "#ffffff",
        secondary: "#000000",
      },
      fontFamily:{
        'poppins': ['Poppins-Regular'],
        'poppins-bold': ['Poppins-Bold'],
        'poppins-medium': ['Poppins-Medium'],
        'poppins-semibold': ['Poppins-SemiBold'],
        'poppins-black': ['Poppins-Black'],
        'poppins-extralight': ['Poppins-ExtraLight'],
        'poppins-light': ['Poppins-Light'],
        'poppins-thin': ['Poppins-Thin'],
        'poppins-extrabold': ['Poppins-ExtraBold'],
      }
    },
  },
  plugins: [],
}

