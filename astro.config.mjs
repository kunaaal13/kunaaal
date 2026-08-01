// @ts-check
import { defineConfig } from 'astro/config'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import svelte from '@astrojs/svelte'
import vercel from '@astrojs/vercel'
import tailwindcss from '@tailwindcss/vite'

const SITE_URL = process.env.PUBLIC_SITE_URL ?? 'https://kunaaal.com'

export default defineConfig({
  site: SITE_URL,

  // Static by default: every content page is prerendered to HTML at build.
  // The adapter exists only so the two routes under /api can opt out with
  // `export const prerender = false` and run as serverless functions.
  output: 'static',
  adapter: vercel(),

  integrations: [mdx(), svelte(), sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },

  markdown: {
    // Sätteri is the default processor in Astro 7 — no remark/rehype install.
    // Shiki runs at build time, so highlighted code ships as plain HTML.
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: false,
    },
  },
})
