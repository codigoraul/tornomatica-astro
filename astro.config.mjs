// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import process from 'node:process';

// https://astro.build/config
export default defineConfig({
  site: 'https://www.tornomatica.cl',
  // Permite publicar en una subcarpeta (ej. BASE_PATH=/prueba) sin tocar el código.
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
