import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const card = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-6)',
  marginBottom: 'var(--space-4)',
  boxShadow: 'var(--shadow-card)',
}

const sectionTitle = {
  fontSize: 13, fontWeight: 700,
  color: 'var(--color-text-muted)',
  margin: '0 0 var(--space-4)',
}

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  borderRadius: 'var(--radius-sm)',
  border: '1.5px solid var(--color-border)',
  fontSize: 'var(--font-size-body-min)',
  outline: 'none',
  background: 'var(--color-surface)',
  color: 'var(--color-text-primary)',
}

function ToggleGroup({ options, value, onChange }) {
  return (
    <div className="toggle-group" style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
      {options.map(opt => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              padding: '9px var(--space-4)',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              fontSize: 'var(--font-size-label-max)',
              cursor: 'pointer',
              border: active ? '1.5px solid var(--color-border-highlight)' : '1.5px solid var(--color-border)',
              background: active ? 'var(--color-secondary)' : 'var(--color-surface)',
              color:      active ? 'var(--color-secondary-text)' : 'var(--color-text-muted)',
            }}
          >{opt.label}</button>
        )
      })}
    </div>
  )
}

export default function SettingsPage() {
  const navigate = useNavigate()

  const [name,         setName]         = useState('שיר לוי')
  const [email,        setEmail]        = useState('shir@example.com')
  const [reminderDays, setReminderDays] = useState(3)
  const [channel,      setChannel]      = useState('whatsapp')
  const [language,     setLanguage]     = useState('he')
  const [saved,        setSaved]        = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const userInitial = (name || 'ש')[0]

  return (
    <main className="settings-main" style={{ maxWidth: 600, margin: '0 auto', padding: 'var(--space-8)' }}>

      {/* ── Page title ────────────────────────────────────── */}
      <h1 style={{
        fontSize: 'var(--font-size-page-title-max)',
        fontWeight: 'var(--font-weight-page-title)',
        letterSpacing: 'var(--letter-spacing-page-title)',
        margin: '0 0 var(--space-6)',
        color: 'var(--color-text-primary)',
      }}>הגדרות</h1>

      {/* ── Profile card ──────────────────────────────────── */}
      <div style={card}>
        <h2 style={sectionTitle}>פרטי משתמש</h2>

        {/* Avatar + summary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 'var(--radius-full)',
            background: 'var(--avatar-1-bg)', color: 'var(--avatar-1-text)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 20, flexShrink: 0,
          }}>{userInitial}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 'var(--font-size-body-max)', color: 'var(--color-text-primary)' }}>{name}</div>
            <div style={{ fontSize: 'var(--font-size-label-max)', color: 'var(--color-text-muted)', marginTop: 2 }}>{email}</div>
          </div>
        </div>

        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>שם מלא</label>
        <input
          type="text" dir="rtl" value={name}
          onChange={e => setName(e.target.value)}
          style={{ ...inputStyle, marginBottom: 'var(--space-4)' }}
        />

        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>אימייל</label>
        <input
          type="email" dir="ltr" value={email}
          onChange={e => setEmail(e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* ── Notifications card ────────────────────────────── */}
      <div style={card}>
        <h2 style={sectionTitle}>התראות</h2>
        <label style={{ display: 'block', fontSize: 'var(--font-size-body-min)', fontWeight: 600, marginBottom: 'var(--space-3)', color: 'var(--color-text-primary)' }}>
          תזכורת לפני יום הולדת
        </label>
        <ToggleGroup
          value={reminderDays}
          onChange={setReminderDays}
          options={[
            { value: 1, label: 'יום אחד' },
            { value: 3, label: '3 ימים'  },
            { value: 7, label: 'שבוע'    },
          ]}
        />
      </div>

      {/* ── Channel card ──────────────────────────────────── */}
      <div style={card}>
        <h2 style={sectionTitle}>ערוץ שליחה מועדף</h2>
        <ToggleGroup
          value={channel}
          onChange={setChannel}
          options={[
            { value: 'whatsapp', label: 'WhatsApp' },
            { value: 'email',    label: 'Email'    },
          ]}
        />
      </div>

      {/* ── Language card ─────────────────────────────────── */}
      <div style={card}>
        <h2 style={sectionTitle}>שפה</h2>
        <ToggleGroup
          value={language}
          onChange={setLanguage}
          options={[
            { value: 'he', label: 'עברית'   },
            { value: 'en', label: 'English' },
          ]}
        />
      </div>

      {/* ── Actions ───────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <button
          onClick={handleSave}
          style={{
            width: '100%', padding: 13,
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-primary)', color: 'var(--color-surface)',
            fontWeight: 700, fontSize: 'var(--font-size-body-min)',
            border: 'none', cursor: 'pointer',
            boxShadow: 'var(--shadow-btn-primary)',
          }}
        >שמור שינויים</button>

        <button
          onClick={() => navigate('/')}
          style={{
            width: '100%', padding: 13,
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-error-bg)',
            border: '1px solid #FECACA',
            color: 'var(--color-error-text)',
            fontWeight: 700, fontSize: 'var(--font-size-body-min)',
            cursor: 'pointer',
          }}
        >התנתקות</button>
      </div>

      {/* ── Success toast ─────────────────────────────────── */}
      {saved && (
        <div style={{
          position: 'fixed', bottom: 24, left: 24,
          display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
          background: 'var(--color-success-bg)',
          border: '1px solid var(--color-border-success)',
          color: 'var(--color-success-text)',
          padding: '12px var(--space-4)', borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-raised)',
          fontWeight: 600, fontSize: 'var(--font-size-body-min)',
          zIndex: 200,
        }}>
          <span style={{
            width: 20, height: 20, borderRadius: '50%',
            background: 'var(--color-success)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-surface)', fontSize: 12, flexShrink: 0,
          }}>✓</span>
          ההגדרות נשמרו
        </div>
      )}
    </main>
  )
}
