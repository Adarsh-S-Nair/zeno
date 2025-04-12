/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // ✅ must include `pages/Accounts.jsx`
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
