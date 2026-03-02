/// <reference path="../../adonisrc.ts" />
/// <reference path="../../config/inertia.ts" />

import '../css/app.css'
import { hydrateRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import { resolvePageComponent } from '@adonisjs/inertia/helpers'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TuyauProvider } from '@adonisjs/inertia/react'
import { useEffect, useState } from 'react'
import { Toaster } from 'sonner'
import { tuyau } from '../lib/api'
import { ThemeProvider } from '../components/theme-provider'
import { NuqsAdapter } from '../lib/nuqs_inertia_adapter'
import { AuthUserProvider } from '../components/auth-user-provider'
import type { SharedProps } from '../lib/types'

const appName = import.meta.env.VITE_APP_NAME || 'Anua'

const queryClient = new QueryClient()

function ClientOnlyToaster() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return <Toaster richColors />
}

createInertiaApp({
  progress: { color: '#5468FF' },

  title: (title) => (title ? `${title} - ${appName}` : appName),

  resolve: (name) => {
    return resolvePageComponent(`../pages/${name}.tsx`, import.meta.glob('../pages/**/*.tsx'))
  },

  setup({ el, App, props }) {
    hydrateRoot(
      el,
      <ThemeProvider defaultTheme="system" storageKey="anua-theme">
        <TuyauProvider client={tuyau}>
          <QueryClientProvider client={queryClient}>
            <NuqsAdapter>
              <AuthUserProvider
                initialUser={(props.initialPage.props as unknown as SharedProps).user ?? null}
              >
                <App {...props} />
                <ClientOnlyToaster />
              </AuthUserProvider>
            </NuqsAdapter>
          </QueryClientProvider>
        </TuyauProvider>
      </ThemeProvider>
    )
  },
})
