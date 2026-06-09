import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import netlify from '@astrojs/netlify';

export default defineConfig({
  site: 'https://shiiift.agency',
  adapter: netlify(),
  integrations: [
    react(),
    tailwind(),
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: 'he',
        locales: {
          he: 'he-IL',
          en: 'en-US',
          es: 'es-ES',
          ru: 'ru-RU',
        },
      },
    }),
  ],
  i18n: {
    defaultLocale: 'he',
    locales: ['he', 'en', 'es', 'ru'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
  vite: {
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
  },
});
