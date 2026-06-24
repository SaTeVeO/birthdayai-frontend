import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import webpush from 'npm:web-push'

serve(async (_req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    webpush.setVapidDetails(
      'mailto:birthdayai.contact@gmail.com',
      Deno.env.get('VAPID_PUBLIC_KEY')!,
      Deno.env.get('VAPID_PRIVATE_KEY')!
    )

    const today = new Date()

    const { data: contacts } = await supabase
      .from('contacts')
      .select(`
        *,
        profiles!contacts_user_id_fkey(reminder_days_before)
      `)

    if (!contacts) return new Response('No contacts', { status: 200 })

    let notificationsSent = 0

    for (const contact of contacts) {
      const birthday = new Date(contact.birthday)
      const birthdayMonth = birthday.getMonth() + 1
      const birthdayDay = birthday.getDate()
      const reminderDays = contact.profiles?.reminder_days_before ?? 3

      const birthdayThisYear = new Date(
        today.getFullYear(),
        birthdayMonth - 1,
        birthdayDay
      )

      if (birthdayThisYear < today) {
        birthdayThisYear.setFullYear(today.getFullYear() + 1)
      }

      const daysUntil = Math.ceil(
        (birthdayThisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysUntil === 0 || daysUntil === reminderDays) {
        const { data: pushSub } = await supabase
          .from('push_subscriptions')
          .select('subscription')
          .eq('user_id', contact.user_id)
          .single()

        if (!pushSub) continue

        const subscription = JSON.parse(pushSub.subscription)

        const message = daysUntil === 0
          ? `🎂 היום יום הולדת של ${contact.name}! שלח ברכה עכשיו`
          : `🔔 בעוד ${daysUntil} ימים יום הולדת של ${contact.name}`

        await webpush.sendNotification(
          subscription,
          JSON.stringify({
            title: 'BirthdayAI',
            body: message,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            data: {
              url: '/dashboard',
              contactId: contact.id,
            },
          })
        )

        notificationsSent++
      }
    }

    return new Response(
      JSON.stringify({ success: true, notificationsSent }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
