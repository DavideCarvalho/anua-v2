import { useEffect, useState } from 'react'
import { useAuthUser } from '../stores/auth_store'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export function usePushNotifications() {
  const user = useAuthUser()
  const [supported] = useState(() => 'serviceWorker' in navigator && 'PushManager' in window)
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    if (!supported || !user) return

    navigator.serviceWorker.register('/sw.js').catch(() => {})
  }, [supported, user])

  async function subscribe(): Promise<boolean> {
    if (!supported) return false

    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return false

      const reg = await navigator.serviceWorker.ready

      const vapidRes = await fetch('/api/v1/push/vapid-key')
      const { vapidPublicKey } = await vapidRes.json()
      if (!vapidPublicKey) return false

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      })

      const res = await fetch('/api/v1/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(subscription.toJSON()),
      })

      if (res.ok) {
        setSubscribed(true)
        return true
      }
      return false
    } catch {
      return false
    }
  }

  async function unsubscribe(): Promise<boolean> {
    try {
      const reg = await navigator.serviceWorker.ready
      const subscription = await reg.pushManager.getSubscription()
      if (subscription) await subscription.unsubscribe()

      await fetch('/api/v1/push/unsubscribe', {
        method: 'POST',
        credentials: 'include',
      })

      setSubscribed(false)
      return true
    } catch {
      return false
    }
  }

  return { supported, subscribed, subscribe, unsubscribe }
}
