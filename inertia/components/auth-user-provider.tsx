import { router } from '@inertiajs/react'
import { useQuery } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { useEffect, useState } from 'react'
import { useAuthUserQueryOptions } from '../hooks/queries/use_auth_user'
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

  const { data } = useQuery(useAuthUserQueryOptions(sharedUser ?? null))

  useEffect(() => {
    if (data) {
      setUser(data)
      return
    }

    clearUser()
  }, [data, setUser, clearUser])

  return <>{children}</>
}
