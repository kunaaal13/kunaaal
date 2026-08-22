// @ts-check
import { defineConfig, envField } from 'astro/config'
import cloudflare from '@astrojs/cloudflare'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import svelte from '@astrojs/svelte'
import tailwindcss from '@tailwindcss/vite'

const SITE_URL = process.env.PUBLIC_SITE_URL ?? 'https://kunaaal.dev'

export default defineConfig({
  site: SITE_URL,

  // Static by default: content pages stay on Cloudflare's asset CDN. API
  // routes and server islands opt into the Workers runtime.
  output: 'static',
  adapter: cloudflare({
    // OG generation reads local font files and uses native rasterisation.
    prerenderEnvironment: 'node',
    // Optimize imported images at build; no Cloudflare Images binding needed.
    imageService: 'compile',
  }),

  // No session API usage: avoid Worker runtime code and automatic KV setup.
  session: false,

  env: {
    schema: {
      SPOTIFY_CLIENT_ID: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      SPOTIFY_CLIENT_SECRET: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      SPOTIFY_REFRESH_TOKEN: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
    },
  },

  integrations: [mdx(), svelte(), sitemap()],

  // Reuse unchanged prerendered outputs between builds. Expensive dynamic
  // routes provide data-aware cache keys from getStaticPaths().
  experimental: {
    incrementalBuild: true,
  },

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
