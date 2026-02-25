import { create } from 'zustand'
import type { UserDto } from '../lib/types'

interface AuthState {
  user: UserDto | null
  isHydrated: boolean
  setUser: (user: UserDto | null) => void
  clearUser: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isHydrated: false,
  setUser: (user) => set({ user, isHydrated: true }),
  clearUser: () => set({ user: null, isHydrated: true }),
}))

export const useAuthUser = () => useAuthStore((state) => state.user)
export const useIsAuthenticated = () => Boolean(useAuthStore((state) => state.user?.id))
export const useAuthHydrated = () => useAuthStore((state) => state.isHydrated)
