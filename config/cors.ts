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
    // Allow localhost in development/test
    if (origin?.startsWith('http://localhost:') || origin?.startsWith('https://localhost:')) {
      return true
    }
    // Production domain
    if (origin === 'https://anuaapp.com.br' || origin === 'https://www.anuaapp.com.br') {
      return true
    }
    return false
  },
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
  headers: true,
  exposeHeaders: [],
  credentials: true,
  maxAge: 90,
})

export default corsConfig
