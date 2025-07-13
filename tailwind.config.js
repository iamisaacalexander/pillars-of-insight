/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal: "#333333",
        offWhite: "#f7f2eb",
        paperCream: "#f7f2eb",
      },
    },
  },
  plugins: [
    // custom “sketchy” border filter
    function ({ addComponents }) {
      addComponents({
        ".sketch-border": {
          border: "2px solid #333333",
          borderRadius: "0.5rem",
          backgroundClip: "padding-box",
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.2)",
          filter: "url(#roughen)",
        },
      });
    },
  ],
};
