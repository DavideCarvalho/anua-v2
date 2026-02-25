import { usePage } from '@inertiajs/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { useEffect } from 'react'
import { authUserQueryKey, useAuthUserQueryOptions } from '../hooks/queries/use_auth_user'
import type { SharedProps } from '../lib/types'
import { useAuthStore } from '../stores/auth_store'

export function AuthUserProvider({ children }: PropsWithChildren) {
  const { props } = usePage<SharedProps>()
  const sharedUser = props.user
  const queryClient = useQueryClient()
  const setUser = useAuthStore((state) => state.setUser)
  const clearUser = useAuthStore((state) => state.clearUser)

  useEffect(() => {
    queryClient.setQueryData(authUserQueryKey, sharedUser)

    if (sharedUser) {
      setUser(sharedUser)
      return
    }

    clearUser()
  }, [sharedUser, queryClient, setUser, clearUser])

  const { data } = useQuery(useAuthUserQueryOptions(sharedUser))

  useEffect(() => {
    if (data) {
      setUser(data)
      return
    }

    clearUser()
  }, [data, setUser, clearUser])

  return <>{children}</>
}
