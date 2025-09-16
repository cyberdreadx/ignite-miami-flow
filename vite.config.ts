import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', '/lovable-uploads/f40780ef-982b-41a4-99b9-49357cc44738.png'],
      manifest: {
        name: 'SkateBurn',
        short_name: 'SkateBurn',
        description: 'Where skating meets the ultimate vibe - Join the hottest skate events',
        theme_color: '#ef4444',
        background_color: '#0a0a0a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        display_override: ['window-controls-overlay', 'standalone'],
        categories: ['social', 'lifestyle', 'sports'],
        shortcuts: [
          {
            name: 'Get Tickets',
            short_name: 'Tickets',
            description: 'Get tickets for SkateBurn events',
            url: '/tickets',
            icons: [{ src: '/lovable-uploads/f40780ef-982b-41a4-99b9-49357cc44738.png', sizes: '192x192' }]
          },
          {
            name: 'My Tickets',
            short_name: 'My Tickets',
            description: 'View your tickets',
            url: '/my-tickets',
            icons: [{ src: '/lovable-uploads/f40780ef-982b-41a4-99b9-49357cc44738.png', sizes: '192x192' }]
          }
        ],
        icons: [
          {
            src: '/lovable-uploads/f40780ef-982b-41a4-99b9-49357cc44738.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/lovable-uploads/f40780ef-982b-41a4-99b9-49357cc44738.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: '/lovable-uploads/f40780ef-982b-41a4-99b9-49357cc44738.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024, // 3MB limit instead of default 2MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
