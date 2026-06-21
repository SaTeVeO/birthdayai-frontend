import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const DEFAULT_CONTACT = {
  name: 'דנה לוי', first: 'דנה', initial: 'ד',
  relationship: 'אחות', dateLabel: '19 ביוני',
  hobbies: ['ריצה', 'ציור'],
  avatarBg: 'var(--avatar-1-bg)', avatarColor: 'var(--avatar-1-text)',
}

const DEFAULT_GREETING =
`דנה היקרה,
יום הולדת שמח! 🎉 מאחלת לך שנה מלאה בבריאות, שמחה והצלחות רבות. תמשיכי להיות האחות המדהימה שאת!

באהבה רבה ❤️`

const MAX = 500

const channelBase = {
  display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
  padding: '10px var(--space-4)', borderRadius: 'var(--radius-sm)',
  fontWeight: 600, fontSize: 'var(--font-size-label-max)',
  cursor: 'pointer',
}

export default function EditGreeting() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const contact   = location.state?.contact ?? DEFAULT_CONTACT

  const [text,    setText]    = useState(DEFAULT_GREETING)
  const [channel, setChannel] = useState('whatsapp')
  const [sent,    setSent]    = useState(false)

  const firstName    = contact.first ?? contact.name?.split(' ')[0]
  const channelLabel = channel === 'whatsapp' ? 'WhatsApp' : 'Email'
  const over         = text.length > MAX

  const activeChannel = {
    ...channelBase,
    border: '1.5px solid var(--color-border-highlight)',
    background: 'var(--color-secondary)', color: 'var(--color-secondary-text)',
  }
  const inactiveChannel = {
    ...channelBase,
    border: '1.5px solid var(--color-border)',
    background: 'var(--color-surface)', color: 'var(--color-text-primary)',
  }

  return (
    <main className="edit-main" style={{ maxWidth: 680, margin: '0 auto', padding: 'var(--space-8)' }}>

      {/* ── Success banner ───────────────────────────────── */}
      {sent && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
          background: 'var(--color-success-bg)',
          border: '1px solid var(--color-border-success)',
          color: 'var(--color-success-text)',
          padding: '14px var(--space-4)', borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-5)',
        }}>
          <span style={{
            width: 22, height: 22, borderRadius: '50%',
            background: 'var(--color-success)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-surface)', fontSize: 13, flexShrink: 0,
          }}>✓</span>
          <span style={{ fontWeight: 600, fontSize: 'var(--font-size-label-max)' }}>
            הברכה נשלחה בהצלחה אל {firstName} דרך {channelLabel}!
          </span>
        </div>
      )}

      {/* ── Contact card ────────────────────────────────── */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)',
        display: 'flex', alignItems: 'center', gap: 'var(--space-4)',
        marginBottom: 'var(--space-4)', boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 'var(--radius-full)',
          background: contact.avatarBg ?? 'var(--avatar-1-bg)',
          color:      contact.avatarColor ?? 'var(--avatar-1-text)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 22, flexShrink: 0,
        }}>{contact.initial}</div>
        <div style={{ flex: 1 }}>
          <span style={{ fontWeight: 800, fontSize: 'var(--font-size-card-title-max)', color: 'var(--color-text-primary)' }}>
            {contact.name}
          </span>
          <div style={{ fontSize: 'var(--font-size-label-max)', color: 'var(--color-text-muted)', marginTop: 4 }}>
            יום הולדת · {contact.dateLabel} · {contact.relationship}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            {(contact.hobbies ?? []).map(h => (
              <span key={h} style={{
                fontSize: 'var(--font-size-label-min)',
                background: 'var(--color-bg)', color: '#374151',
                padding: '4px 10px', borderRadius: 'var(--radius-full)',
              }}>{h}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Greeting editor ──────────────────────────────── */}
      <div style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)',
        marginBottom: 'var(--space-4)', boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
          <span style={{ fontWeight: 700, fontSize: 'var(--font-size-body-min)' }}>הברכה</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 'var(--font-size-label-min)', fontWeight: 700,
            color: 'var(--color-secondary-text)', background: 'var(--color-secondary)',
            padding: '5px 10px', borderRadius: 'var(--radius-full)',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)' }} />
            נוצר ע״י AI
          </span>
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          style={{
            width: '100%', minHeight: 150,
            border: '1.5px solid var(--color-border)',
            borderRadius: 10, padding: 14,
            fontSize: 'var(--font-size-body-min)', lineHeight: 1.6,
            color: 'var(--color-text-primary)',
            resize: 'vertical', outline: 'none',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--space-3)' }}>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
            padding: '9px var(--space-4)', borderRadius: 'var(--radius-sm)',
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            color: 'var(--color-text-body)', fontWeight: 600, fontSize: 'var(--font-size-label-max)', cursor: 'pointer',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-primary)' }} />
            צור ברכה מחדש
          </button>
          <span style={{
            fontSize: 'var(--font-size-label-min)', fontWeight: 600,
            color: over ? 'var(--color-error)' : 'var(--color-text-faint)',
          }}>{text.length}/{MAX}</span>
        </div>
      </div>

      {/* ── Channel selector ─────────────────────────────── */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <div style={{ fontWeight: 700, fontSize: 'var(--font-size-label-max)', marginBottom: 10 }}>ערוץ שליחה</div>
        <div className="channel-btns" style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button onClick={() => setChannel('whatsapp')} style={channel === 'whatsapp' ? activeChannel : inactiveChannel}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#25D366' }} />
            WhatsApp
          </button>
          <button onClick={() => setChannel('email')} style={channel === 'email' ? activeChannel : inactiveChannel}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-primary)' }} />
            Email
          </button>
        </div>
      </div>

      {/* ── Actions ──────────────────────────────────────── */}
      <div className="edit-actions" style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={() => { setSent(true); setTimeout(() => navigate('/dashboard'), 2000) }}
          style={{
            flex: 1, minWidth: 180, padding: 14,
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-primary)', color: 'var(--color-surface)',
            fontWeight: 700, fontSize: 'var(--font-size-body-min)',
            border: 'none', cursor: 'pointer', boxShadow: 'var(--shadow-btn-primary)',
          }}
        >שלח ברכה עכשיו</button>
        <button style={{
          padding: '14px var(--space-5)', borderRadius: 'var(--radius-sm)',
          background: 'var(--color-secondary)', color: 'var(--color-secondary-text)',
          fontWeight: 600, fontSize: 'var(--font-size-body-min)',
          border: 'none', cursor: 'pointer',
        }}>שמור טיוטה</button>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '14px var(--space-5)', borderRadius: 'var(--radius-sm)',
            background: 'transparent', color: 'var(--color-text-muted)',
            fontWeight: 600, fontSize: 'var(--font-size-body-min)',
            border: 'none', cursor: 'pointer',
          }}
        >ביטול</button>
      </div>
    </main>
  )
}
