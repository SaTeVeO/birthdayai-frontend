import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../contexts/LanguageContext'

const card = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 'var(--radius-lg)',
  padding: 'var(--space-6)',
  marginBottom: 'var(--space-4)',
  boxShadow: 'var(--shadow-card)',
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
              border:      active ? '1.5px solid var(--color-border-highlight)' : '1.5px solid var(--color-border)',
              background:  active ? 'var(--color-secondary)' : 'var(--color-surface)',
              color:       active ? 'var(--color-secondary-text)' : 'var(--color-text-muted)',
            }}
          >{opt.label}</button>
        )
      })}
    </div>
  )
}

export default function SettingsPage() {
  const { user } = useAuth()
  const { language, setLanguage, t } = useLanguage()

  const [name,             setName]             = useState('')
  const [email,            setEmail]            = useState('')
  const [reminderDays,     setReminderDays]     = useState(3)
  const [preferredChannel, setPreferredChannel] = useState('whatsapp')
  const [success,          setSuccess]          = useState('')
  const [error,            setError]            = useState('')
  const [loading,          setLoading]          = useState(true)

  useEffect(() => {
    if (!user) return

    async function load() {
      setEmail(user.email || '')

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profile) {
        setName(profile.name || '')
        setReminderDays(profile.reminder_days_before ?? 3)
        setPreferredChannel(profile.preferred_channel || 'whatsapp')
        // Sync DB language to context if set
        if (profile.language && profile.language !== language) {
          setLanguage(profile.language)
        }
      }

      setLoading(false)
    }

    load()
  }, [user])

  async function handleSave() {
    const { data, error: upsertError } = await supabase
      .from('profiles')
      .upsert(
        {
          user_id:              user.id,
          name,
          preferred_channel:    preferredChannel,
          reminder_days_before: reminderDays,
          language,
        },
        { onConflict: 'user_id' }
      )

    console.log('upsert result:', data, upsertError)

    if (upsertError) {
      setError('שמירת ההגדרות נכשלה: ' + upsertError.message)
      setTimeout(() => setError(''), 4000)
    } else {
      setSuccess(t('settings.savedSuccess'))
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut({ scope: 'local' })
    window.localStorage.clear()
    window.sessionStorage.clear()
    window.location.href = '/login'
  }

  const sectionTitle = { fontSize: 13, fontWeight: 700, color: 'var(--color-text-muted)', margin: '0 0 var(--space-4)' }
  const userInitial  = (name || email || '?')[0]

  if (loading) {
    return (
      <main style={{ maxWidth: 600, margin: '0 auto', padding: 'var(--space-8)', display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-body-min)' }}>{t('settings.loading')}</span>
      </main>
    )
  }

  return (
    <main className="settings-main" style={{ maxWidth: 600, margin: '0 auto', padding: 'var(--space-8)' }}>

      <h1 style={{
        fontSize: 'var(--font-size-page-title-max)',
        fontWeight: 'var(--font-weight-page-title)',
        letterSpacing: 'var(--letter-spacing-page-title)',
        margin: '0 0 var(--space-6)',
        color: 'var(--color-text-primary)',
      }}>{t('settings.title')}</h1>

      {/* Profile */}
      <div style={card}>
        <h2 style={sectionTitle}>{t('settings.profile')}</h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 'var(--radius-full)',
            background: 'var(--avatar-1-bg)', color: 'var(--avatar-1-text)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: 20, flexShrink: 0,
          }}>{userInitial}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 'var(--font-size-body-max)', color: 'var(--color-text-primary)' }}>{name || '—'}</div>
            <div style={{ fontSize: 'var(--font-size-label-max)', color: 'var(--color-text-muted)', marginTop: 2 }}>{email}</div>
          </div>
        </div>

        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{t('settings.name')}</label>
        <input
          type="text" dir="rtl" value={name}
          onChange={e => setName(e.target.value)}
          style={{ ...inputStyle, marginBottom: 'var(--space-4)' }}
        />

        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{t('settings.email')}</label>
        <input
          type="email" dir="ltr" value={email} readOnly
          style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }}
        />
      </div>

      {/* Notifications */}
      <div style={card}>
        <h2 style={sectionTitle}>{t('settings.notifications')}</h2>
        <label style={{ display: 'block', fontSize: 'var(--font-size-body-min)', fontWeight: 600, marginBottom: 'var(--space-3)', color: 'var(--color-text-primary)' }}>
          {t('settings.reminderBefore')}
        </label>
        <ToggleGroup
          value={reminderDays}
          onChange={setReminderDays}
          options={[
            { value: 1, label: t('settings.reminder1') },
            { value: 3, label: t('settings.reminder3') },
            { value: 7, label: t('settings.reminder7') },
          ]}
        />
      </div>

      {/* Channel */}
      <div style={card}>
        <h2 style={sectionTitle}>{t('settings.channel')}</h2>
        <ToggleGroup
          value={preferredChannel}
          onChange={setPreferredChannel}
          options={[
            { value: 'whatsapp', label: 'WhatsApp' },
            { value: 'email',    label: 'Email'    },
          ]}
        />
      </div>

      {/* Language */}
      <div style={card}>
        <h2 style={sectionTitle}>{t('settings.language')}</h2>
        <ToggleGroup
          value={language}
          onChange={setLanguage}
          options={[
            { value: 'he', label: '🇮🇱 עברית'   },
            { value: 'en', label: '🇺🇸 English' },
            { value: 'ru', label: '🇷🇺 Русский' },
          ]}
        />
      </div>

      {/* Actions */}
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
        >{t('settings.saveBtn')}</button>

        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: 13,
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-error-bg)',
            border: '1px solid var(--color-border-error)',
            color: 'var(--color-error-text)',
            fontWeight: 700, fontSize: 'var(--font-size-body-min)',
            cursor: 'pointer',
          }}
        >{t('settings.logoutBtn')}</button>
      </div>

      {error && (
        <div style={{
          position: 'fixed', bottom: 24, left: 24,
          display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
          background: 'var(--color-error-bg)',
          border: '1px solid var(--color-border-error)',
          color: 'var(--color-error-text)',
          padding: '12px var(--space-4)', borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-raised)',
          fontWeight: 600, fontSize: 'var(--font-size-body-min)', zIndex: 200,
        }}>
          <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-surface)', fontSize: 12, flexShrink: 0 }}>!</span>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          position: 'fixed', bottom: 24, left: 24,
          display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
          background: 'var(--color-success-bg)',
          border: '1px solid var(--color-border-success)',
          color: 'var(--color-success-text)',
          padding: '12px var(--space-4)', borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-raised)',
          fontWeight: 600, fontSize: 'var(--font-size-body-min)', zIndex: 200,
        }}>
          <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-surface)', fontSize: 12, flexShrink: 0 }}>✓</span>
          {success}
        </div>
      )}
    </main>
  )
}
