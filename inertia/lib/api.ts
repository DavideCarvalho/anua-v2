import { registry } from '@generated/registry/index'
import { createTuyau } from '@tuyau/core/client'
import { createTuyauReactQueryClient } from '@tuyau/react-query'
import { superjson } from '@tuyau/superjson/plugin'
import { QueryClient } from '@tanstack/react-query'

// Use "/" for relative URLs (same-origin requests)
// Treat "/" as empty string to avoid double slashes
const rawApiUrl = import.meta.env.VITE_API_URL
const apiUrl = rawApiUrl === '/' ? '' : rawApiUrl || ''

export const queryClient = new QueryClient()

export const tuyau = createTuyau({
  baseUrl: apiUrl,
  registry,
  plugins: [superjson()],
})

export const api = createTuyauReactQueryClient({ client: tuyau })
