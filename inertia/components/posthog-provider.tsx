import type { PropsWithChildren } from 'react'
import { useEffect, useRef } from 'react'
import { router } from '@inertiajs/react'
import { posthog, initPostHog } from '~/lib/posthog'
import { useAuthUser } from '~/stores/auth_store'
import { readEscolaDashboardViewMode } from '~/lib/escola-dashboard-view-mode'

export function PostHogProvider({ children }: PropsWithChildren) {
  const user = useAuthUser()
  const initialized = useRef(false)
  const userRef = useRef(user)
  userRef.current = user

  // Initialize PostHog once
  useEffect(() => {
    if (!initialized.current) {
      initPostHog()
      initialized.current = true
    }
  }, [])

  // Identify user when available
  useEffect(() => {
    if (!user) {
      posthog.reset()
      return
    }

    posthog.identify(user.id, {
      name: user.name,
      email: user.email,
      role: user.role?.name,
      schoolId: user.schoolId,
      schoolName: user.school?.name,
      schoolChainId: user.schoolChainId,
    })

    // Set group for school-level analytics
    if (user.schoolId) {
      posthog.group('school', user.schoolId, {
        name: user.school?.name,
      })
    }
  }, [user])

  // Track pageviews on Inertia navigation
  useEffect(() => {
    const capturePageview = () => {
      const currentUser = userRef.current
      const isEscolaPage = window.location.pathname.startsWith('/escola')
      const properties = isEscolaPage
        ? { simplifiedView: readEscolaDashboardViewMode(currentUser?.id) === 'simple' }
        : {}

      posthog.capture('$pageview', properties)
    }

    // Capture initial pageview
    capturePageview()

    const removeListener = router.on('navigate', () => {
      capturePageview()
    })

    return () => {
      removeListener()
    }
  }, [])

  return <>{children}</>
}
