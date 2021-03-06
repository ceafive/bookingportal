module.exports = {
  mode: "jit",
  purge: {
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  },
  darkMode: "class", // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        sans: ["Nunito Sans, sans-serif"],
      },
      colors: {
        brandBlue: "#21428F",
        brandGreen: "#eeefff",
        brandGreen2: "#4AB647",
      },
      screens: {
        print: { raw: "print" },
        // => @media print { ... }
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/forms")({
      strategy: "class",
    }),
  ],
};
