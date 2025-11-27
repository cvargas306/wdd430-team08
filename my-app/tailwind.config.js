/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        isabelline: "var(--isabelline)",
        reseda: "var(--reseda)",
        chocolate: "var(--chocolate)",
        cafe: "var(--cafe)",
        ebony: "var(--ebony)",
      },
    },
  },
};