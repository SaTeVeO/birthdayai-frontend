import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

const MONTHS_HE = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר']

function formatCreatedAt(iso) {
  const d = new Date(iso)
  return `${d.getDate()} ב${MONTHS_HE[d.getMonth()]} ${d.getFullYear()}`
}

function formatBirthday(birthday) {
  const [, m, d] = birthday.split('-').map(Number)
  return `${d} ב${MONTHS_HE[m - 1]}`
}

const STATUS = {
  sent:  { label: 'נשלח',  bg: 'var(--color-success-bg)',  color: 'var(--color-success-text)', border: 'var(--color-border-success)' },
  draft: { label: 'טיוטה', bg: 'var(--color-surface)',     color: 'var(--color-text-muted)',   border: 'var(--color-border)'         },
}

const AVATAR_SLOTS = [
  { bg: 'var(--avatar-1-bg)', color: 'var(--avatar-1-text)' },
  { bg: 'var(--avatar-2-bg)', color: 'var(--avatar-2-text)' },
  { bg: 'var(--avatar-3-bg)', color: 'var(--avatar-3-text)' },
  { bg: 'var(--avatar-4-bg)', color: 'var(--avatar-4-text)' },
  { bg: 'var(--avatar-5-bg)', color: 'var(--avatar-5-text)' },
]

export default function GreetingHistory() {
  const { user } = useAuth()
  const [greetings, setGreetings] = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    if (!user) return

    async function load() {
      const { data } = await supabase
        .from('greetings')
        .select('*, contacts(name, birthday, relationship)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setGreetings(data ?? [])
      setLoading(false)
    }

    load()
  }, [user])

  if (loading) {
    return (
      <main style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--space-8)', display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-body-min)' }}>טוען...</span>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--space-8)' }}>

      <h1 style={{
        fontSize: 'var(--font-size-page-title-max)',
        fontWeight: 'var(--font-weight-page-title)',
        letterSpacing: 'var(--letter-spacing-page-title)',
        margin: '0 0 var(--space-6)',
        color: 'var(--color-text-primary)',
      }}>היסטוריית ברכות</h1>

      {greetings.length === 0 ? (
        <div style={{
          background: 'var(--color-surface)',
          border: '1px dashed var(--color-border-dashed)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-14) var(--space-6)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 36, marginBottom: 'var(--space-4)' }}>🎂</div>
          <h3 style={{ fontSize: 'var(--font-size-card-title-max)', fontWeight: 700, margin: '0 0 var(--space-2)', color: 'var(--color-text-primary)' }}>
            אין ברכות עדיין
          </h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-body-min)', margin: 0 }}>
            ברכות שתשלח יופיעו כאן.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {greetings.map((g, i) => {
            const contact = g.contacts
            const status  = STATUS[g.status] ?? STATUS.draft
            const slot    = AVATAR_SLOTS[i % AVATAR_SLOTS.length]
            const initial = (contact?.name || '?')[0]
            return (
              <div key={g.id} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: 16,
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-card)',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--radius-full)',
                  background: slot.bg, color: slot.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 'var(--font-size-card-title-min)', flexShrink: 0,
                }}>{initial}</div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 'var(--font-size-card-title-min)', color: 'var(--color-text-primary)' }}>
                    {contact?.name || '—'}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 3 }}>
                    {[
                      contact?.relationship,
                      contact?.birthday && `יום הולדת: ${formatBirthday(contact.birthday)}`,
                    ].filter(Boolean).join(' · ')}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-2)', flexShrink: 0 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: status.color,
                    background: status.bg,
                    border: `1px solid ${status.border}`,
                    padding: '3px var(--space-2)', borderRadius: 'var(--radius-full)',
                  }}>{status.label}</span>
                  <span style={{ fontSize: 'var(--font-size-label-min)', color: 'var(--color-text-faint)' }}>
                    {formatCreatedAt(g.created_at)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
