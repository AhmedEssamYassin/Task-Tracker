import { defineConfig } from 'vite';
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
    server: {
        proxy: {
            // All requests to /api will be forwarded to Express server
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
        },
    },
    plugins: [
        tailwindcss(),
    ],
});