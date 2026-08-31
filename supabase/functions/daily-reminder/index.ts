// Eat&Fit — Edge Function: daily-reminder
// Invocada por Supabase Scheduled Trigger (cron) a las 21:00 Europe/Madrid
// Envía push notification a usuarios que no han completado el día de hoy.

import webpush from 'npm:web-push@3'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')!
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')!
const vapidSubject = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@example.com'

webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)

async function supabaseFetch(path: string, options?: RequestInit) {
  return fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
}

Deno.serve(async () => {
  const today = new Date().toISOString().split('T')[0]

  // Get all users with push_subscription
  const usersRes = await supabaseFetch('usuarios?select=id,push_subscription&push_subscription=not.is.null')
  const users: { id: string; push_subscription: PushSubscriptionJSON }[] = await usersRes.json()

  const results: string[] = []

  for (const user of users) {
    // Check if they've already logged today's data (comida or gimnasio)
    const regRes = await supabaseFetch(
      `registros_diarios?usuario_id=eq.${user.id}&fecha=eq.${today}&select=comida,gimnasio`
    )
    const registros: { comida: string | null; gimnasio: boolean }[] = await regRes.json()
    const done =
      registros.length > 0 && (registros[0].comida !== null || registros[0].gimnasio)

    if (!done) {
      try {
        await webpush.sendNotification(
          user.push_subscription as webpush.PushSubscription,
          JSON.stringify({
            title: 'Eat&Fit 🍉',
            body: '¿Cómo ha ido el día? Registra tu comida y deporte.',
            url: '/home',
          })
        )
        results.push(`Sent to ${user.id}`)
      } catch (err) {
        results.push(`Failed for ${user.id}: ${err}`)
      }
    } else {
      results.push(`Skipped ${user.id} (already logged)`)
    }
  }

  return new Response(JSON.stringify({ ok: true, results }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
