import { defineConfig } from '@adonisjs/cors'

/**
 * Configuration options to tweak the CORS policy. The following
 * options are documented on the official documentation website.
 *
 * https://docs.adonisjs.com/guides/security/cors
 */
const corsConfig = defineConfig({
  enabled: true,
  origin: (origin) => {
    // Allow all localhost origins for testing
    if (origin?.startsWith('http://localhost:') || origin?.startsWith('https://localhost:')) {
      return true
    }
    // In production, you might want to be more restrictive
    return false
  },
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
  headers: true,
  exposeHeaders: [],
  credentials: true,
  maxAge: 90,
})

export default corsConfig
