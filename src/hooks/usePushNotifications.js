import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const usePushNotifications = (user) => {
  const [permission, setPermission] = useState(Notification.permission)
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    setSupported('Notification' in window && 'serviceWorker' in navigator)
  }, [])

  const requestPermission = async () => {
    if (!supported) return false

    const result = await Notification.requestPermission()
    setPermission(result)

    if (result === 'granted') {
      await subscribeUser()
      return true
    }
    return false
  }

  const subscribeUser = async () => {
    try {
      const registration = await navigator.serviceWorker.ready

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
      })

      await supabase.from('push_subscriptions').upsert({
        user_id: user.id,
        subscription: JSON.stringify(subscription),
        created_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })

      console.log('Push subscription saved!')
    } catch (error) {
      console.error('Subscribe error:', error)
    }
  }

  return { permission, supported, requestPermission }
}
