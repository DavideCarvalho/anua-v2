import ReactDOMServer from 'react-dom/server'
import { createInertiaApp } from '@inertiajs/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TuyauProvider } from '@adonisjs/inertia/react'
import { tuyau } from '../lib/api'
import { NuqsAdapter } from '../lib/nuqs_inertia_adapter'
import { AuthUserProvider } from '../components/auth-user-provider'
import type { SharedProps } from '../lib/types'

type SsrPage = Parameters<typeof createInertiaApp>[0]['page']

export default function render(page: SsrPage) {
  return createInertiaApp({
    page,
    render: ReactDOMServer.renderToString,
    resolve: (name) => {
      const pages = import.meta.glob('../pages/**/*.tsx', { eager: true })
      return pages[`../pages/${name}.tsx`]
    },
    setup: ({ App, props }) => {
      const queryClient = new QueryClient()
      return (
        <TuyauProvider client={tuyau}>
          <QueryClientProvider client={queryClient}>
            <NuqsAdapter>
              <AuthUserProvider
                initialUser={(props.initialPage.props as unknown as SharedProps).user ?? null}
              >
                <App {...props} />
              </AuthUserProvider>
            </NuqsAdapter>
          </QueryClientProvider>
        </TuyauProvider>
      )
    },
  })
}
