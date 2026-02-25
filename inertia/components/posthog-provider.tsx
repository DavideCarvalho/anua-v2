import type { PropsWithChildren } from 'react'
import { useEffect, useRef } from 'react'
import { router } from '@inertiajs/react'
import { posthog, initPostHog } from '~/lib/posthog'
import { useAuthUser } from '~/stores/auth_store'

export function PostHogProvider({ children }: PropsWithChildren) {
  const user = useAuthUser()
  const initialized = useRef(false)

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
    // Capture initial pageview
    posthog.capture('$pageview')

    const removeListener = router.on('navigate', () => {
      posthog.capture('$pageview')
    })

    return () => {
      removeListener()
    }
  }, [])

  return <>{children}</>
}
