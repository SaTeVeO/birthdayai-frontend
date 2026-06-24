import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../contexts/LanguageContext'

const LANG_FLAGS = [
  { key: 'he', flag: '🇮🇱' },
  { key: 'en', flag: '🇺🇸' },
  { key: 'ru', flag: '🇷🇺' },
]

function Logomark({ onClick }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, direction: 'ltr', cursor: 'pointer' }}>
      <div style={{
        width: 32, height: 32, borderRadius: 9,
        background: 'var(--color-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 6px rgba(99,102,241,.35)',
        flexShrink: 0,
      }}>
        <div style={{ width: 13, height: 13, borderRadius: 4, background: 'var(--color-surface)' }} />
      </div>
      <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: 'var(--letter-spacing-h2)', color: 'var(--color-text-primary)' }}>
        BirthdayAI
      </span>
    </div>
  )
}

const shell = {
  height: 64,
  display: 'flex',
  alignItems: 'center',
  padding: '0 var(--space-8)',
  paddingTop: 'env(safe-area-inset-top)',
  borderBottom: '1px solid var(--color-border-subtle)',
  background: 'var(--color-surface)',
  position: 'sticky',
  top: 0,
  zIndex: 50,
}

function useDark() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }
  return { dark, toggle }
}

const darkBtnStyle = {
  width: 34, height: 34,
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--color-border)',
  background: 'transparent',
  cursor: 'pointer',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 15, lineHeight: 1,
}

export default function Navbar({ variant = 'landing' }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const [displayName, setDisplayName] = useState('')
  const { dark, toggle } = useDark()

  useEffect(() => {
    if (!user) return

    const fetchProfile = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('name')
        .eq('user_id', user.id)
        .single()
      setDisplayName(data?.name || user.email || '')
    }

    fetchProfile()

    const subscription = supabase
      .channel('profile_changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        if (payload.new?.name) setDisplayName(payload.new.name)
      })
      .subscribe()

    return () => { supabase.removeChannel(subscription) }
  }, [user])

  const userInitial = displayName
    ? displayName[0].toUpperCase()
    : (user?.email?.[0] ?? '?').toUpperCase()

  const onLogoClick = () => navigate(user ? '/dashboard' : '/')

  const DarkBtn = (
    <button onClick={toggle} style={darkBtnStyle} title={dark ? t('nav.darkOff') : t('nav.darkOn')}>
      {dark ? '☀️' : '🌙'}
    </button>
  )

  const LangSwitcher = (
    <div style={{ display: 'flex', gap: 2 }}>
      {LANG_FLAGS.map(l => (
        <button
          key={l.key}
          onClick={() => setLanguage(l.key)}
          title={l.key}
          style={{
            width: 30, height: 30,
            borderRadius: 'var(--radius-sm)',
            border: language === l.key ? '1.5px solid var(--color-primary)' : '1px solid transparent',
            background: language === l.key ? 'var(--color-secondary)' : 'transparent',
            fontSize: 16, cursor: 'pointer', lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >{l.flag}</button>
      ))}
    </div>
  )

  /* ── Login / Register ───────────────────────────────────── */
  if (variant === 'login') {
    return (
      <nav className="nav-shell" style={{ ...shell, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{LangSwitcher}</div>
        <Logomark onClick={onLogoClick} />
        {DarkBtn}
      </nav>
    )
  }

  /* ── Edit / Settings ────────────────────────────────────── */
  if (variant === 'edit' || variant === 'settings') {
    const title = variant === 'settings' ? t('nav.settings') : t('nav.editGreeting')
    return (
      <nav className="nav-shell" style={{ ...shell, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              background: 'transparent',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-body)',
              fontWeight: 600, fontSize: 'var(--font-size-label-max)', cursor: 'pointer',
            }}
          >{t('nav.back')}</button>
          <span style={{ fontWeight: 700, fontSize: 'var(--font-size-body-min)', color: 'var(--color-text-primary)' }}>{title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {LangSwitcher}
          {DarkBtn}
          <Logomark onClick={onLogoClick} />
        </div>
      </nav>
    )
  }

  /* ── Dashboard ──────────────────────────────────────────── */
  if (variant === 'dashboard') {
    return (
      <nav className="nav-shell" style={{ ...shell, justifyContent: 'space-between' }}>
        <Logomark onClick={onLogoClick} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            className="nav-hide-mobile"
            onClick={() => window.dispatchEvent(new CustomEvent('openAddContact'))}
            style={{
              padding: '9px var(--space-4)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-primary)', color: 'var(--color-surface)',
              fontWeight: 600, fontSize: 'var(--font-size-label-max)',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(99,102,241,.4)',
            }}
          >{t('nav.addContact')}</button>
          <button
            className="nav-hide-mobile"
            onClick={() => navigate('/contacts')}
            style={{
              padding: '9px var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              background: 'transparent',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
              fontWeight: 600, fontSize: 'var(--font-size-label-max)', cursor: 'pointer',
            }}
          >{t('nav.contacts')}</button>
          <button
            className="nav-hide-mobile"
            onClick={() => navigate('/settings')}
            style={{
              padding: '9px var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              background: 'transparent',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
              fontWeight: 600, fontSize: 'var(--font-size-label-max)', cursor: 'pointer',
            }}
          >{t('nav.settings')}</button>
          {LangSwitcher}
          {DarkBtn}
          <button
            onClick={async () => {
              await supabase.auth.signOut({ scope: 'local' })
              window.localStorage.clear()
              window.sessionStorage.clear()
              window.location.href = '/login'
            }}
            style={{
              padding: '9px var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              background: 'transparent',
              border: '1px solid var(--color-error)',
              color: 'var(--color-error)',
              fontWeight: 700, fontSize: 'var(--font-size-label-max)', cursor: 'pointer',
            }}
          >{t('nav.logout')}</button>
          <div
            onClick={() => navigate('/settings')}
            style={{
              width: 36, height: 36, borderRadius: 'var(--radius-full)',
              background: 'var(--color-secondary)', color: 'var(--color-secondary-text)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 'var(--font-size-label-max)',
              cursor: 'pointer',
            }}
          >{userInitial}</div>
        </div>
      </nav>
    )
  }

  /* ── Landing ────────────────────────────────────────────── */
  return (
    <nav className="nav-shell" style={{
      ...shell,
      justifyContent: 'space-between',
      background: 'var(--color-nav-glass)',
      backdropFilter: 'blur(8px)',
    }}>
      <Logomark onClick={onLogoClick} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        {LangSwitcher}
        {DarkBtn}
        <button
          onClick={() => navigate('/login')}
          style={{
            padding: '9px var(--space-4)',
            borderRadius: 'var(--radius-sm)',
            border: 'none', background: 'transparent',
            color: 'var(--color-text-body)',
            fontWeight: 600, fontSize: 'var(--font-size-label-max)', cursor: 'pointer',
          }}
        >{t('nav.login')}</button>
        <button
          onClick={() => navigate('/register')}
          style={{
            padding: '9px 18px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: 'var(--color-primary)', color: 'var(--color-surface)',
            fontWeight: 600, fontSize: 'var(--font-size-label-max)', cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(99,102,241,.4)',
          }}
        >{t('nav.register')}</button>
      </div>
    </nav>
  )
}
