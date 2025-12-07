import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'logo192.png', 'logo512.png', 'apple-touch-icon.png'],
            manifest: {
                short_name: "Fairy Lights",
                name: "Local Fairy Lights Controller",
                icons: [
                    {
                        src: "favicon.ico",
                        sizes: "64x64 32x32 24x24 16x16",
                        type: "image/x-icon"
                    },
                    {
                        src: "logo192.png",
                        type: "image/png",
                        sizes: "192x192",
                        purpose: "any maskable"
                    },
                    {
                        src: "logo512.png",
                        type: "image/png",
                        sizes: "512x512",
                        purpose: "any maskable"
                    }
                ],
                start_url: ".",
                display: "standalone",
                theme_color: "#000000",
                background_color: "#ffffff"
            }
        })
    ],
    server: {
        port: 3000,
        open: true
    },
    build: {
        outDir: 'build'
    }
});
