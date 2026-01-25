import { useMemo } from 'react'
import { router, usePage } from '@inertiajs/react'

type Params = Record<string, string>

export function useSearchParams() {
  const { url } = usePage()

  const params = useMemo(() => {
    const qs = url.includes('?') ? url.split('?')[1] : ''
    const sp = new URLSearchParams(qs)
    const obj: Params = {}
    sp.forEach((value, key) => {
      obj[key] = value
    })
    return obj
  }, [url])

  function setParam(key: string, value: string) {
    const qs = url.includes('?') ? url.split('?')[1] : ''
    const sp = new URLSearchParams(qs)
    sp.set(key, value)
    router.visit(`${url.split('?')[0]}?${sp.toString()}`, { preserveScroll: true })
  }

  function deleteParam(key: string) {
    const qs = url.includes('?') ? url.split('?')[1] : ''
    const sp = new URLSearchParams(qs)
    sp.delete(key)
    const base = url.split('?')[0]
    const next = sp.toString()
    router.visit(next ? `${base}?${next}` : base, { preserveScroll: true })
  }

  return { params, setParam, deleteParam }
}
