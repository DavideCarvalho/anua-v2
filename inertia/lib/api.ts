import { registry } from '@generated/registry/index.ts'
import { createTuyau } from '@tuyau/core/client'
import { createTuyauReactQueryClient } from '@tuyau/react-query'
import { superjson } from '@tuyau/superjson/plugin'
import { QueryClient } from '@tanstack/react-query'

const apiUrl = import.meta.env.VITE_API_URL

export const queryClient = new QueryClient()

export const tuyau = createTuyau({
  baseUrl: apiUrl,
  registry,
  plugins: [superjson()],
})

export const api = createTuyauReactQueryClient({ client: tuyau })
