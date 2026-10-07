import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    // Ưu tiên lấy từ biến môi trường của GitHub Actions, nếu không có mới lấy từ file .env
    const apiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || '';

    return {
        // Dùng './' để tự động tương thích với mọi tên Repository trên GitHub Pages
        base: process.env.GITHUB_ACTIONS ? '/trang/' : './',
        server: {
            port: 3000,
            host: '0.0.0.0',
        },
        plugins: [react(), tailwindcss()],
        define: {
            'process.env.API_KEY': JSON.stringify(apiKey),
            'process.env.GEMINI_API_KEY': JSON.stringify(apiKey)
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
            }
        }
    };
});
