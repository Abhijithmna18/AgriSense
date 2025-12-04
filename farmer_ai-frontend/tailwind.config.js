/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'primary-green': '#D6F9B9',
                'light-green': '#52B788',
                'accent-gold': '#D4AF37',
                'deep-forest': '#0B231E',
                'warm-ivory': '#F9F8F4',
                'dark-green-text': '#1B4332',
                'charcoal-black': '#1A1A1A',
            },
            fontFamily: {
                serif: ['Playfair Display', 'serif'],
                sans: ['Inter', 'sans-serif'],
            },
            backdropBlur: {
                xs: '2px',
            },
            boxShadow: {
                'gold': '0 20px 80px -10px rgba(212, 175, 55, 0.15)',
                'gold-lg': '0 20px 80px -10px rgba(212, 175, 55, 0.25)',
            },
        },
    },
    plugins: [],
}
