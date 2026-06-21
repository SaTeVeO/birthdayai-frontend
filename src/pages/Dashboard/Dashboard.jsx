import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import AddContactModal from '../../components/AddContactModal/AddContactModal'

const MONTHS_HE = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר']

const AVATAR_SLOTS = [
  { bg: 'var(--avatar-1-bg)', color: 'var(--avatar-1-text)' },
  { bg: 'var(--avatar-2-bg)', color: 'var(--avatar-2-text)' },
  { bg: 'var(--avatar-3-bg)', color: 'var(--avatar-3-text)' },
  { bg: 'var(--avatar-4-bg)', color: 'var(--avatar-4-text)' },
  { bg: 'var(--avatar-5-bg)', color: 'var(--avatar-5-text)' },
]

// Parse "YYYY-MM-DD" without UTC shift
function parseBirthday(str) {
  const [, m, d] = str.split('-').map(Number)
  return { month: m - 1, day: d }
}

function daysUntil(birthday) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { month, day } = parseBirthday(birthday)
  const next = new Date(today.getFullYear(), month, day)
  if (next < today) next.setFullYear(today.getFullYear() + 1)
  return Math.round((next - today) / 86400000)
}

function birthdayLabel(birthday) {
  const { month, day } = parseBirthday(birthday)
  return `${day} ב${MONTHS_HE[month]}`
}

function daysText(days) {
  if (days === 1) return 'מחר'
  return `בעוד ${days} ימים`
}

function activityMeta(iso) {
  const d = new Date(iso)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const itemDate = new Date(d)
  itemDate.setHours(0, 0, 0, 0)
  const time     = d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })
  const diffDays = Math.round((today - itemDate) / 86400000)
  if (diffDays === 0) return `היום, ${time}`
  if (diffDays === 1) return `אתמול, ${time}`
  return `לפני ${diffDays} ימים`
}

function activityText(g) {
  const name = g.contacts?.name || 'איש קשר'
  return g.status === 'sent' ? `ברכה נשלחה ל${name}` : `ברכה נוצרה עבור ${name}`
}

function activityDot(status) {
  return status === 'sent' ? 'var(--color-primary)' : 'var(--color-accent)'
}

export default function Dashboard() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user }  = useAuth()

  const [contacts,       setContacts]       = useState([])
  const [sentCount,      setSentCount]      = useState(0)
  const [recentActivity, setRecentActivity] = useState([])
  const [userName,       setUserName]       = useState('')
  const [loading,        setLoading]        = useState(true)
  const [showAddModal,   setShowAddModal]   = useState(false)
  const [refreshKey,     setRefreshKey]     = useState(0)

  // Open modal via custom event dispatched from Navbar
  useEffect(() => {
    const handler = () => setShowAddModal(true)
    window.addEventListener('openAddContact', handler)
    return () => window.removeEventListener('openAddContact', handler)
  }, [])

  useEffect(() => {
    if (!user) return

    async function load() {
      setLoading(true)

      const [{ data: rows }, { data: profile }] = await Promise.all([
        supabase.from('contacts').select('*').eq('user_id', user.id).order('birthday'),
        supabase.from('profiles').select('name').eq('user_id', user.id).single(),
      ])

      setUserName(profile?.name || user.email?.split('@')[0] || '')

      const enriched = (rows ?? [])
        .map((c, i) => ({
          ...c,
          days:        daysUntil(c.birthday),
          dateLabel:   birthdayLabel(c.birthday),
          initial:     (c.name || '?')[0],
          avatarBg:    AVATAR_SLOTS[i % AVATAR_SLOTS.length].bg,
          avatarColor: AVATAR_SLOTS[i % AVATAR_SLOTS.length].color,
        }))
        .sort((a, b) => a.days - b.days)

      setContacts(enriched)

      const [sentResult, activityResult] = await Promise.all([
        enriched.length > 0
          ? supabase
              .from('greetings')
              .select('id', { count: 'exact', head: true })
              .in('contact_id', enriched.map(c => c.id))
              .eq('status', 'sent')
          : Promise.resolve({ count: 0 }),
        supabase
          .from('greetings')
          .select('*, contacts(name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      setSentCount(sentResult.count ?? 0)
      setRecentActivity(activityResult.data ?? [])

      setLoading(false)
    }

    load()
  }, [user, refreshKey, location.key])

  function handleContactAdded() {
    setShowAddModal(false)
    setRefreshKey(k => k + 1)
  }

  const currentMonth   = new Date().getMonth()
  const thisMonthCount = contacts.filter(c => parseBirthday(c.birthday).month === currentMonth).length
  const upcomingCount  = contacts.filter(c => c.days > 0 && c.days <= 30).length

  if (loading) {
    return (
      <main style={{ maxWidth: 1080, margin: '0 auto', padding: 'var(--space-8)', display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-body-min)' }}>טוען...</span>
      </main>
    )
  }

  return (
    <main className="dashboard-main" style={{ maxWidth: 1080, margin: '0 auto', padding: 'var(--space-8)' }}>

      {/* ── Header ─────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', gap: 'var(--space-4)', flexWrap: 'wrap',
      }}>
        <div>
          <h1 style={{
            fontSize: 'var(--font-size-page-title-max)',
            fontWeight: 'var(--font-weight-page-title)',
            letterSpacing: 'var(--letter-spacing-page-title)',
            margin: 0, color: 'var(--color-text-primary)',
          }}>שלום, {userName} 👋</h1>
          <p style={{ margin: '6px 0 0', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-body-min)' }}>
            {contacts.length === 0
              ? 'בוא נתחיל — אין עדיין אנשי קשר'
              : `יש לך ${upcomingCount} ימי הולדת ב‑30 הימים הקרובים`}
          </p>
        </div>
      </div>

      {/* ── Two-column grid ─────────────────────────────── */}
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--space-6)', marginTop: 'var(--space-7)', alignItems: 'start' }}>

        {/* Left: contacts / empty state */}
        <div>
          {contacts.length === 0 ? (
            <div style={{
              background: 'var(--color-surface)',
              border: '1px dashed var(--color-border-dashed)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-14) var(--space-6)',
              textAlign: 'center',
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: 'var(--radius-lg)',
                background: 'var(--color-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto var(--space-5)',
              }}>
                <div style={{ width: 26, height: 26, borderRadius: 'var(--radius-sm)', border: '2.5px solid var(--color-primary)' }} />
              </div>
              <h3 style={{ fontSize: 'var(--font-size-card-title-max)', fontWeight: 700, margin: '0 0 var(--space-2)', color: 'var(--color-text-primary)' }}>
                עדיין אין ימי הולדת
              </h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-body-min)', margin: '0 auto var(--space-6)', maxWidth: 360, lineHeight: 'var(--line-height-body)' }}>
                הוסף את איש הקשר הראשון שלך כדי ש‑BirthdayAI יתחיל לעקוב ולשלוח ברכות אוטומטית.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  padding: '12px 22px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-primary)', color: 'var(--color-surface)',
                  fontWeight: 600, fontSize: 'var(--font-size-body-min)',
                  border: 'none', cursor: 'pointer', boxShadow: 'var(--shadow-btn-primary)',
                }}
              >+ הוסף איש קשר ראשון</button>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <h2 style={{ fontSize: 'var(--font-size-label-max)', fontWeight: 700, color: 'var(--color-text-muted)', margin: 0 }}>
                  ימי הולדת קרובים
                </h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  style={{
                    padding: '7px 14px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-primary)', color: 'var(--color-surface)',
                    fontWeight: 600, fontSize: 13,
                    border: 'none', cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(99,102,241,.4)',
                  }}
                >+ הוסף</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {contacts.map(c => (
                  <div key={c.id} className="contact-card" style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: 14,
                    borderRadius: 'var(--radius-md)',
                    border: c.days === 0 ? '1.5px solid var(--color-border-highlight)' : '1px solid var(--color-border-subtle)',
                    background: 'var(--color-surface)',
                    boxShadow: c.days === 0 ? 'var(--shadow-raised)' : 'var(--shadow-card)',
                  }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 'var(--radius-full)',
                      background: c.avatarBg, color: c.avatarColor,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, fontSize: 'var(--font-size-card-title-min)', flexShrink: 0,
                    }}>{c.initial}</div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <span style={{ fontWeight: 700, fontSize: 'var(--font-size-card-title-min)' }}>{c.name}</span>
                        {c.days === 0 && (
                          <span style={{
                            fontSize: 11, fontWeight: 700,
                            color: 'var(--color-accent-badge-text)',
                            background: 'var(--color-accent-badge-bg)',
                            padding: '3px var(--space-2)', borderRadius: 'var(--radius-full)',
                          }}>היום!</span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 3 }}>
                        {c.relationship} · {c.dateLabel}
                      </div>
                    </div>

                    <div className="contact-card-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-2)' }}>
                      {c.days > 0 && (
                        <span style={{ fontSize: 13, color: 'var(--color-text-faint)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {daysText(c.days)}
                        </span>
                      )}
                      {c.days === 0 ? (
                        <button
                          onClick={() => navigate('/edit-greeting', { state: { contact: c } })}
                          style={{
                            padding: 'var(--space-2) var(--space-4)',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--color-primary)', color: 'var(--color-surface)',
                            fontWeight: 600, fontSize: 13,
                            border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                            boxShadow: '0 1px 2px rgba(99,102,241,.4)',
                          }}
                        >שלח ברכה</button>
                      ) : (
                        <button
                          onClick={() => navigate('/edit-greeting', { state: { contact: c } })}
                          style={{
                            padding: 'var(--space-2) var(--space-4)',
                            borderRadius: 'var(--radius-sm)',
                            background: 'var(--color-secondary)', color: 'var(--color-secondary-text)',
                            fontWeight: 600, fontSize: 13,
                            border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                          }}
                        >ערוך ברכה</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Right: sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          {/* Stats */}
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)',
            boxShadow: 'var(--shadow-card)',
          }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-muted)', margin: '0 0 var(--space-4)' }}>
              סטטיסטיקה
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { label: 'אנשי קשר',        value: contacts.length, color: 'var(--color-text-primary)' },
                { label: 'ימי הולדת החודש',  value: thisMonthCount,  color: 'var(--color-primary)'      },
                { label: 'ברכות שנשלחו',     value: sentCount,       color: 'var(--color-success)'      },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-label-max)' }}>{label}</span>
                  <span style={{ fontWeight: 800, fontSize: 20, color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border-subtle)',
            borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)',
            boxShadow: 'var(--shadow-card)',
          }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text-muted)', margin: '0 0 var(--space-1)' }}>
              פעילות אחרונה
            </h3>
            {recentActivity.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--color-text-faint)', textAlign: 'center', margin: '14px 0 0' }}>
                אין פעילות אחרונה
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
                {recentActivity.map(g => (
                  <div key={g.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: activityDot(g.status), flexShrink: 0, marginTop: 4,
                    }} />
                    <div>
                      <div style={{ fontSize: 13.5, color: 'var(--color-text-primary)', lineHeight: 1.4 }}>{activityText(g)}</div>
                      <div style={{ fontSize: 'var(--font-size-label-min)', color: 'var(--color-text-faint)', marginTop: 2 }}>{activityMeta(g.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {showAddModal && (
        <AddContactModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleContactAdded}
        />
      )}
    </main>
  )
}
