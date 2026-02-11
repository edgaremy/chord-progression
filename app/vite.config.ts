import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';

// Add svelte plugin for Svelte 5 support

export default defineConfig({
	base: '/',
	publicDir: 'static',
	build: {
		outDir: 'docs',
		emptyOutDir: true,
	},
	resolve: {
		alias: {
			$lib: resolve('./src/lib'),
		},
	},
	plugins: [
		svelte(),
		VitePWA({
			registerType: 'autoUpdate',
			includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'progressions.txt', 'icon.png'],
			manifest: {
				name: 'Chord Progressions',
				short_name: 'Chords',
				description: 'Generate random chord progressions for music composition',
				theme_color: '#49d59d',
				background_color: '#121212',
				display: 'standalone',
				start_url: '/',
				scope: '/',
				icons: [
					{
						src: 'icon.png',
						sizes: '192x192',
						type: 'image/png',
						purpose: 'any maskable'
					},
					{
						src: 'icon.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any maskable'
					}
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,svg,png,ico,txt,woff2,otf,ttf}'],
				globDirectory: 'docs',
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'google-fonts-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
							},
							cacheableResponse: {
								statuses: [0, 200]
							}
						}
					},
					{
						urlPattern: /\.(png|jpg|jpeg)$/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'image-cache',
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
							}
						}
					},
					{
						urlPattern: /\.(otf|ttf|woff|woff2)$/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'font-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
							}
						}
					}
				]
			}
		})
	]
});