import { createTuyau } from '@tuyau/client'
import { superjson } from '@tuyau/superjson/plugin'
import { api } from '../../.adonisjs/api'

export const tuyau = createTuyau<typeof api>({
  baseUrl: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3333',
  plugins: [superjson()],
  api,
  headers: {
    Accept: 'application/json',
  },
})
