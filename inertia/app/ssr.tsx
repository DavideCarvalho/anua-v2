import ReactDOMServer from 'react-dom/server'
import { createInertiaApp } from '@inertiajs/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TuyauProvider } from '@tuyau/inertia/react'
import { tuyau } from '../lib/api'
import { NuqsAdapter } from '../lib/nuqs_inertia_adapter'
import { AuthUserProvider } from '../components/auth-user-provider'

export default function render(page: any) {
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
              <AuthUserProvider>
                <App {...props} />
              </AuthUserProvider>
            </NuqsAdapter>
          </QueryClientProvider>
        </TuyauProvider>
      )
    },
  })
}
