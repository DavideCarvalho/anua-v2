import posthog from 'posthog-js'

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined
const POSTHOG_HOST = (import.meta.env.VITE_POSTHOG_HOST as string) || 'https://us.i.posthog.com'

export function initPostHog() {
  if (!POSTHOG_KEY || typeof window === 'undefined') return

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    // Session replay
    session_recording: {
      recordCrossOriginIframes: true,
    },
    // Autocapture clicks, inputs, etc.
    autocapture: true,
    // Capture pageviews manually via Inertia router
    capture_pageview: false,
    capture_pageleave: true,
    // Feature flags
    advanced_disable_feature_flags: false,
    // Error tracking
    capture_exceptions: true,
    // Disable in development
    loaded: (ph) => {
      if (import.meta.env.DEV) {
        ph.opt_out_capturing()
      }
    },
  })
}

export { posthog }
