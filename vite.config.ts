import { defineConfig } from 'vite'
import { getDirname } from '@adonisjs/core/helpers'
import inertia from '@adonisjs/inertia/client'
import react from '@vitejs/plugin-react'
import adonisjs from '@adonisjs/vite/client'
import tailwindcss from '@tailwindcss/vite'

const appPort = Number(process.env.PORT)
const fallbackHmrPort = 24900 + (process.pid % 500)
const hmrPort = Number(
  process.env.HMR_PORT ?? (Number.isFinite(appPort) ? appPort + 1 : fallbackHmrPort)
)

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

  /**
   * Define aliases for importing modules from
   * your frontend code
   */
  resolve: {
    alias: {
      '~/': `${getDirname(import.meta.url)}/inertia/`,
    },
  },

  server: Number.isFinite(hmrPort)
    ? {
        hmr: {
          host: '127.0.0.1',
          port: hmrPort,
          clientPort: hmrPort,
        },
      }
    : undefined,
})
