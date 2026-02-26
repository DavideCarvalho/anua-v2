import { router } from '@inertiajs/react'
import type { PropsWithChildren } from 'react'
import { useEffect, useState } from 'react'
import type { SharedProps } from '../lib/types'
import { useAuthStore } from '../stores/auth_store'

interface AuthUserProviderProps extends PropsWithChildren {
  initialUser: SharedProps['user']
}

export function AuthUserProvider({ children, initialUser }: AuthUserProviderProps) {
  const [sharedUser, setSharedUser] = useState<SharedProps['user']>(initialUser)
  const setUser = useAuthStore((state) => state.setUser)
  const clearUser = useAuthStore((state) => state.clearUser)

  useEffect(() => {
    const removeNavigateListener = router.on('navigate', (event) => {
      const nextUser = (event.detail.page.props.user as SharedProps['user'] | undefined) ?? null
      setSharedUser(nextUser)
    })

    return () => {
      removeNavigateListener()
    }
  }, [])

  useEffect(() => {
    if (sharedUser) {
      setUser(sharedUser)
      return
    }

    clearUser()
  }, [sharedUser, setUser, clearUser])

  return <>{children}</>
}
