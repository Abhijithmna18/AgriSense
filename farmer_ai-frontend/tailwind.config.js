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
                // New Palette
                'fresh-green': '#10B981', // Keep for accents
                'muted-green': '#3B8C6E', // Primary muted green
                'mint-leaf': '#E6F4EA',   // Very light green background
                'sky-blue': '#E0F2FE',
                'slate-text': '#334155',
                'soft-gray': '#F8FAFC',   // Slate 50

                // Vibrant Auth Theme
                'deep-forest-green': '#124D35',
                'fresh-lime-green': '#A5E887',
                'pale-green-bg': '#F7FCF8',

                // Split-Screen Auth Theme
                'auth-dark': '#0F3D2E',
                'auth-mid': '#126A49',
                'auth-light-bg': '#F7F5F0',
                'auth-error-bg': '#FFE6E6',
                'auth-error-text': '#D93025',

                // Premium Green Theme
                'premium-green': '#0FA36B',
                'gradient-green': '#37D99E',
                'dark-accent-green': '#0C8A58',
                'soft-light-bg': '#F8FCF9',
                'deep-charcoal': '#0F2421',
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
