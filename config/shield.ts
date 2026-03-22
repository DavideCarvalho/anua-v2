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

      // Scripts: same origin + nonce for inline scripts (Inertia/theme toggle)
      // '@nonce' is resolved per-request by @adonisjs/shield to 'nonce-{random}'
      // Note: @viteDevUrl / @viteHmrUrl are NOT supported by this shield version
      scriptSrc: [`'self'`, '@nonce'],

      // Styles: same origin + nonce for inline styles + Fonts Bunny CDN + Google Fonts
      // 'unsafe-inline' needed because @adonisjs/vite does not inject nonces into
      // the <style> tags it generates (no nonce support in the installed version)
      styleSrc: [
        `'self'`,
        `'unsafe-inline'`,
        'https://fonts.bunny.net',
        'https://fonts.googleapis.com',
      ],

      // Fonts: same origin + Fonts Bunny CDN + Google Fonts
      fontSrc: [
        `'self'`,
        'https://fonts.bunny.net',
        'https://fonts.gstatic.com',
        'https://fonts.googleapis.com',
      ],

      // Images: same origin + data URIs + GCS bucket (school logos/uploads)
      imgSrc: [`'self'`, 'data:', 'https://storage.googleapis.com'],

      // Connections: same origin + PostHog + BrasilAPI + ViaCEP + Vite HMR
      // '@viteHmrUrl' is NOT supported by this shield version — removed
      connectSrc: [
        `'self'`,
        'https://us.i.posthog.com',
        'https://brasilapi.com.br',
        'https://viacep.com.br',
        'ws://localhost:*',
        'http://localhost:*',
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
