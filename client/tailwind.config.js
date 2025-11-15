/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./css/**/*.css",

    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#6366f1',
                    dark: '#4f46e5',
                    light: '#818cf8',
                },
                success: '#10b981',
                danger: '#ef4444',
                warning: '#f59e0b',
                info: '#3b82f6',
                background: '#0f172a',
                surface: {
                    DEFAULT: '#1e293b',
                    light: '#334155',
                },
                text: {
                    primary: '#f1f5f9',
                    secondary: '#cbd5e1',
                    muted: '#94a3b8',
                },
                border: '#334155',
            },
            boxShadow: {
                custom: '0 10px 40px rgba(0, 0, 0, 0.3)',
                'custom-sm': '0 2px 10px rgba(0, 0, 0, 0.2)',
            },
        },
    },
    plugins: [],
}