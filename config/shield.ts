import { defineConfig } from '@adonisjs/shield'

const shieldConfig = defineConfig({
  /**
   * Configure CSP policies for your app. Refer documentation
   * to learn more
   */
  csp: {
    enabled: true,
    directives: {
      // Only load resources from same origin by default
      defaultSrc: [`'self'`],

      // Scripts: same origin + Vite assets + nonce for inline scripts (Inertia)
      // '@nonce' is resolved per-request by @adonisjs/shield to 'nonce-{random}'
      // '@viteDevUrl' allows assets from the Vite dev server
      scriptSrc: [`'self'`, '@viteDevUrl', '@nonce'],

      // Styles: same origin + Vite dev server + nonce for inline styles + Fonts Bunny CDN
      styleSrc: [`'self'`, '@viteDevUrl', '@nonce', 'https://fonts.bunny.net'],

      // Fonts: same origin + Fonts Bunny CDN
      fontSrc: [`'self'`, 'https://fonts.bunny.net'],

      // Images: same origin + data URIs + GCS bucket (school logos/uploads)
      imgSrc: [`'self'`, 'data:', 'https://storage.googleapis.com'],

      // Connections: same origin + Vite HMR WebSocket + PostHog + BrasilAPI + ViaCEP
      // '@viteHmrUrl' resolves to the Vite WebSocket URL for hot module replacement
      connectSrc: [
        `'self'`,
        '@viteHmrUrl',
        'https://us.i.posthog.com',
        'https://brasilapi.com.br',
        'https://viacep.com.br',
      ],

      // Frames: block all (DocuSeal opens in a new tab, not an iframe)
      frameSrc: [`'none'`],

      // Frame embedding of this app: block all
      frameAncestors: [`'none'`],

      // Media: same origin only
      mediaSrc: [`'self'`],

      // Objects (Flash, etc.): block all
      objectSrc: [`'none'`],

      // Restrict base tag to same origin
      baseUri: [`'self'`],

      // Forms can only submit to same origin
      formAction: [`'self'`],

      // Collect violations without blocking — disable once policy is verified
      reportUri: ['/api/v1/csp-report'],
    },
    reportOnly: true,
  },

  /**
   * Configure CSRF protection options. Refer documentation
   * to learn more
   */
  csrf: {
    enabled: true,
    exceptRoutes: (ctx) => ctx.request.url().startsWith('/api/'),
    enableXsrfCookie: true,
    methods: ['POST', 'PUT', 'PATCH', 'DELETE'],
  },

  /**
   * Control how your website should be embedded inside
   * iFrames
   */
  xFrame: {
    enabled: true,
    action: 'DENY',
  },

  /**
   * Force browser to always use HTTPS
   */
  hsts: {
    enabled: true,
    maxAge: '365 days',
    includeSubDomains: true,
    preload: true,
  },

  /**
   * Disable browsers from sniffing the content type of a
   * response and always rely on the "content-type" header.
   */
  contentTypeSniffing: {
    enabled: true,
  },
})

export default shieldConfig
