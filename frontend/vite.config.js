import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
    plugins: [react(), tailwindcss()],
    optimizeDeps: {
        exclude: ['nikium-wasm'],
    },
    server: {
        proxy: {
            '/run': 'http://localhost:8080',
        },
    },
});
