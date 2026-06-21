import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const CONTACTS = [
  { id: '1', name: 'דנה לוי',   initial: 'ד', relationship: 'אחות',          dateLabel: '19 ביוני', today: true,  daysLabel: '',             avatarBg: 'var(--avatar-1-bg)', avatarColor: 'var(--avatar-1-text)', hobbies: ['ריצה', 'ציור'] },
  { id: '2', name: 'יוסי כהן',  initial: 'י', relationship: 'חבר מהצבא',     dateLabel: '22 ביוני', today: false, daysLabel: 'בעוד 3 ימים',  avatarBg: 'var(--avatar-2-bg)', avatarColor: 'var(--avatar-2-text)', hobbies: ['כדורגל', 'בישול'] },
  { id: '3', name: 'מיכל ברג',  initial: 'מ', relationship: 'עמית לעבודה',   dateLabel: '25 ביוני', today: false, daysLabel: 'בעוד 6 ימים',  avatarBg: 'var(--avatar-3-bg)', avatarColor: 'var(--avatar-3-text)', hobbies: ['יוגה', 'קריאה'] },
  { id: '4', name: 'אורי שמיר', initial: 'א', relationship: 'בן דוד',        dateLabel: '28 ביוני', today: false, daysLabel: 'בעוד 9 ימים',  avatarBg: 'var(--avatar-5-bg)', avatarColor: 'var(--avatar-5-text)', hobbies: ['גיטרה', 'טיולים'] },
]

const STATS    = { contacts: 12, month: 4, sent: 31 }

const ACTIVITY = [
  { id: 1, text: 'ברכה נשלחה לדנה לוי בוואטסאפ',         meta: 'היום, 08:00',     dot: 'var(--color-primary)' },
  { id: 2, text: 'ברכת יום הולדת נוצרה עבור יוסי כהן',    meta: 'אתמול, 14:30',   dot: 'var(--color-accent)'  },
  { id: 3, text: 'איש קשר חדש הוסף: מיכל ברג',            meta: 'לפני 3 ימים',    dot: 'var(--color-success)' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [showEmpty, setShowEmpty] = useState(false)
  const contacts = showEmpty ? [] : CONTACTS

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
          }}>שלום, שיר 👋</h1>
          <p style={{ margin: '6px 0 0', color: 'var(--color-text-muted)', fontSize: 'var(--font-size-body-min)' }}>
            {contacts.length === 0
              ? 'בוא נתחיל — אין עדיין אנשי קשר'
              : `יש לך ${contacts.filter(c => !c.today).length} ימי הולדת ב‑30 הימים הקרובים`}
          </p>
        </div>
        <button
          onClick={() => setShowEmpty(e => !e)}
          style={{
            padding: '7px 14px', borderRadius: 'var(--radius-sm)',
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            color: 'var(--color-text-muted)', fontWeight: 600, fontSize: 13, cursor: 'pointer',
          }}
        >{showEmpty ? 'הצג אנשי קשר' : 'הצג מצב ריק'}</button>
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
              <button style={{
                padding: '12px 22px', borderRadius: 'var(--radius-sm)',
                background: 'var(--color-primary)', color: 'var(--color-surface)',
                fontWeight: 600, fontSize: 'var(--font-size-body-min)',
                border: 'none', cursor: 'pointer', boxShadow: 'var(--shadow-btn-primary)',
              }}>+ הוסף איש קשר ראשון</button>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: 'var(--font-size-label-max)', fontWeight: 700, color: 'var(--color-text-muted)', margin: '0 0 14px' }}>
                ימי הולדת קרובים
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {contacts.map(c => (
                  <div key={c.id} className="contact-card" style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: 14,
                    borderRadius: 'var(--radius-md)',
                    border: c.today ? '1.5px solid var(--color-border-highlight)' : '1px solid var(--color-border-subtle)',
                    background: 'var(--color-surface)',
                    boxShadow: c.today ? 'var(--shadow-raised)' : 'var(--shadow-card)',
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
                        {c.today && (
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
                      {!c.today && (
                        <span style={{ fontSize: 13, color: 'var(--color-text-faint)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {c.daysLabel}
                        </span>
                      )}
                      {c.today ? (
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
                { label: 'אנשי קשר',         value: STATS.contacts, color: 'var(--color-text-primary)' },
                { label: 'ימי הולדת החודש',   value: STATS.month,    color: 'var(--color-primary)'      },
                { label: 'ברכות שנשלחו',      value: STATS.sent,     color: 'var(--color-success)'      },
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
              {ACTIVITY.map(a => (
                <div key={a.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: a.dot, flexShrink: 0, marginTop: 4,
                  }} />
                  <div>
                    <div style={{ fontSize: 13.5, color: 'var(--color-text-primary)', lineHeight: 1.4 }}>{a.text}</div>
                    <div style={{ fontSize: 'var(--font-size-label-min)', color: 'var(--color-text-faint)', marginTop: 2 }}>{a.meta}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}
