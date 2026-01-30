import { usePage } from '@inertiajs/react'
import { Link } from '@tuyau/inertia/react'
import type { PropsWithChildren } from 'react'
import { Button } from '../ui/button'
import type { SharedProps } from '../../lib/types'
import { PostHogProvider } from '../posthog-provider'

export function PublicLayout({ children }: PropsWithChildren) {
  const { props } = usePage<SharedProps>()
  const user = props.user

  return (
    <PostHogProvider>
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link route="web.home" className="mr-6 flex items-center space-x-2">
              <span className="font-bold text-xl">Anua</span>
            </Link>
          </div>

          <div className="flex flex-1 items-center justify-end space-x-2">
            {user ? (
              <Link route="web.dashboard">
                <Button>Meu Painel</Button>
              </Link>
            ) : (
              <Link route="web.auth.signIn">
                <Button>Entrar</Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Anua. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
    </PostHogProvider>
  )
}
