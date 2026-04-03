import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.jsx'],
            ssr: 'resources/js/ssr.jsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources/js').replace(/\\/g, '/'),
            '@Tenant': path.resolve(__dirname, './resources/js/Tenant').replace(/\\/g, '/'),
        },
    },
    server: {
        host: '127.0.0.1',
        port: 5173,
        cors: true,
        origin: 'http://127.0.0.1:5173',
        hmr: {
            host: '127.0.0.1',
        },
        watch: {
            ignored: ['**/storage/**'],
        },
    },
    optimizeDeps: {
        include: [
            '@inertiajs/react',
            'react',
            'react-dom/client',
            'axios',
            'lucide-react',
        ],
    },
});
