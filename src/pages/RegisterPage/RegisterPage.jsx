import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const inputBase = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'var(--font-size-body-min)',
  outline: 'none',
  background: 'var(--color-surface)',
  color: 'var(--color-text-primary)',
}

const inputOk  = { ...inputBase, border: '1.5px solid var(--color-border)' }
const inputErr = { ...inputBase, border: '1.5px solid var(--color-error)', boxShadow: '0 0 0 3px rgba(239,68,68,.12)' }

function isEmailValid(v) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) }

export default function RegisterPage() {
  const navigate = useNavigate()

  const [name,        setName]        = useState('')
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [touched,     setTouched]     = useState(false)
  const [submitting,  setSubmitting]  = useState(false)
  const [serverError, setServerError] = useState('')

  const nameOk  = name.trim().length > 0
  const emailOk = isEmailValid(email)
  const passOk  = password.length >= 6
  const matchOk = password === confirmPass && password.length > 0

  const nameErr  = touched && !nameOk
  const emailErr = touched && !emailOk
  const passErr  = touched && !passOk
  const matchErr = touched && passOk && !matchOk

  const showError = nameErr || emailErr || passErr || matchErr || !!serverError

  const errorMsg = serverError ? serverError
    : nameErr  ? 'נא להזין שם מלא'
    : emailErr ? 'כתובת האימייל אינה תקינה'
    : passErr  ? 'הסיסמה חייבת להכיל לפחות 6 תווים'
    : matchErr ? 'הסיסמאות אינן תואמות'
    : ''

  async function submit() {
    setServerError('')
    if (!nameOk || !emailOk || !passOk || !matchOk) { setTouched(true); return }

    setSubmitting(true)
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) { setServerError(error.message); setSubmitting(false); return }

    if (data.user) {
      await supabase.from('profiles').insert({ id: data.user.id, name: name.trim() })
    }

    setSubmitting(false)
    navigate('/dashboard')
  }

  return (
    <div className="auth-outer" style={{
      flex: 1,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '48px var(--space-5)',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div className="auth-card" style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-8)',
          boxShadow: '0 4px 20px -4px rgba(17,24,39,.12)',
        }}>
          <h1 style={{
            fontSize: 'var(--font-size-page-title-min)',
            fontWeight: 'var(--font-weight-page-title)',
            margin: '0 0 6px',
            textAlign: 'center',
            letterSpacing: 'var(--letter-spacing-page-title)',
            color: 'var(--color-text-primary)',
          }}>יצירת חשבון</h1>
          <p style={{
            textAlign: 'center',
            color: 'var(--color-text-muted)',
            fontSize: 'var(--font-size-label-max)',
            margin: '0 0 var(--space-6)',
          }}>הצטרף ל‑BirthdayAI — חינם לגמרי</p>

          {showError && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
              background: 'var(--color-error-bg)',
              border: '1px solid var(--color-border-error)',
              color: 'var(--color-error-text)',
              padding: '10px 12px', borderRadius: 'var(--radius-sm)',
              fontSize: 13, fontWeight: 600,
              marginBottom: 'var(--space-4)',
            }}>
              <span style={{
                width: 16, height: 16, borderRadius: '50%',
                background: 'var(--color-error)', color: 'var(--color-surface)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, flexShrink: 0,
              }}>!</span>
              {errorMsg}
            </div>
          )}

          {/* Name */}
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>שם מלא</label>
          <input
            type="text" placeholder="ישראל ישראלי" dir="rtl"
            value={name} onChange={e => setName(e.target.value)}
            style={nameErr ? inputErr : inputOk}
          />

          <div style={{ height: 'var(--space-4)' }} />

          {/* Email */}
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>אימייל</label>
          <input
            type="email" placeholder="name@email.com" dir="ltr"
            value={email} onChange={e => setEmail(e.target.value)}
            style={emailErr ? inputErr : inputOk}
          />

          <div style={{ height: 'var(--space-4)' }} />

          {/* Password */}
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>סיסמה</label>
          <input
            type="password" placeholder="לפחות 6 תווים" dir="ltr"
            value={password} onChange={e => setPassword(e.target.value)}
            style={passErr ? inputErr : inputOk}
          />

          <div style={{ height: 'var(--space-4)' }} />

          {/* Confirm password */}
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>אימות סיסמה</label>
          <input
            type="password" placeholder="הזן סיסמה שנית" dir="ltr"
            value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
            style={matchErr ? inputErr : inputOk}
          />

          <div style={{ height: 22 }} />

          <button
            onClick={submit}
            disabled={submitting}
            style={{
              width: '100%', padding: 13,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-primary)', color: 'var(--color-surface)',
              fontWeight: 700, fontSize: 'var(--font-size-body-min)',
              border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
              boxShadow: 'var(--shadow-btn-primary)',
            }}
          >{submitting ? '...' : 'הירשם'}</button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
            <span style={{ fontSize: 'var(--font-size-label-min)', color: 'var(--color-text-faint)' }}>או</span>
            <div style={{ flex: 1, height: 1, background: 'var(--color-border)' }} />
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            style={{
              width: '100%', padding: 12,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-body)',
              fontWeight: 600, fontSize: 'var(--font-size-label-max)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            <span style={{
              width: 18, height: 18, borderRadius: '50%',
              background: 'conic-gradient(#EA4335,#FBBC05,#34A853,#4285F4)',
              flexShrink: 0,
            }} />
            המשך עם Google
          </button>
        </div>

        <p style={{
          textAlign: 'center',
          fontSize: 'var(--font-size-label-max)',
          color: 'var(--color-text-muted)',
          margin: 'var(--space-5) 0 0',
        }}>
          כבר יש לך חשבון?{' '}
          <span
            onClick={() => navigate('/login')}
            style={{ color: 'var(--color-primary)', fontWeight: 700, cursor: 'pointer' }}
          >כניסה</span>
        </p>
      </div>
    </div>
  )
}
