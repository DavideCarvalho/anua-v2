import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { useEffect, useState, type ReactNode } from 'react'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function ClientOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return <>{fallback}</>
  return <>{children}</>
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function formatCurrency(cents: number): string {
  return currencyFormatter.format(cents / 100)
}
