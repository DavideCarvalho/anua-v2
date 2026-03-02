import { defineConfig } from 'vite'
import inertia from '@adonisjs/inertia/vite'
import react from '@vitejs/plugin-react'
import adonisjs from '@adonisjs/vite/client'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [
    inertia({ ssr: { enabled: true, entrypoint: 'inertia/app/ssr.tsx' } }),
    react(),
    tailwindcss(),
    adonisjs({
      entrypoints: ['inertia/app/app.tsx', 'inertia/css/app.css'],
      reload: ['resources/views/**/*.edge'],
    }),
  ],

  resolve: {
    alias: {
      '~': path.resolve(__dirname, 'inertia'),
      '~/': path.resolve(__dirname, 'inertia/'),
      '~registry': path.resolve(__dirname, '.adonisjs/client/registry/index.ts'),
    },
  },
})
