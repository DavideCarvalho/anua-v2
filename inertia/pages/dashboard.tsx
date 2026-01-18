import { Head } from '@inertiajs/react'
import { useEffect } from 'react'
import { router } from '@inertiajs/react'

interface DashboardProps {
  redirectTo: string
}

export default function Dashboard({ redirectTo }: DashboardProps) {
  useEffect(() => {
    router.visit(redirectTo, { replace: true })
  }, [redirectTo])

  return (
    <>
      <Head title="Redirecionando..." />
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Redirecionando...</p>
        </div>
      </div>
    </>
  )
}
