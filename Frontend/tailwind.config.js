import typography from '@tailwindcss/typography';

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            img: {
              margin: 'auto',
              borderRadius: theme('borderRadius.lg'),
              maxWidth: '100%',
              height: 'auto',
            },
          },
        },
      }),
    },
  },
  plugins: [
    typography,
    require('tailwind-scrollbar'),
  ],
};
