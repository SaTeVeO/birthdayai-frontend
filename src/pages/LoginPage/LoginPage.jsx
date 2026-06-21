import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
function isPassValid(v)  { return v.length >= 6 }

export default function LoginPage() {
  const navigate = useNavigate()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [touched,  setTouched]  = useState(false)

  const emailOk = isEmailValid(email)
  const passOk  = isPassValid(password)
  const emailErr = touched && !emailOk
  const passErr  = touched && !passOk
  const showError = emailErr || passErr

  const errorMsg = (emailErr && passErr)
    ? 'נא להזין כתובת אימייל וסיסמה תקינות'
    : emailErr
    ? 'כתובת האימייל אינה תקינה'
    : 'הסיסמה חייבת להכיל לפחות 6 תווים'

  function submit() {
    if (emailOk && passOk) { navigate('/dashboard'); return }
    setTouched(true)
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
          }}>כניסה לחשבון</h1>
          <p style={{
            textAlign: 'center',
            color: 'var(--color-text-muted)',
            fontSize: 'var(--font-size-label-max)',
            margin: '0 0 var(--space-6)',
          }}>היכנס כדי לנהל את ימי ההולדת שלך</p>

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

          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>אימייל</label>
          <input
            type="email" placeholder="name@email.com" dir="ltr"
            value={email} onChange={e => setEmail(e.target.value)}
            style={emailErr ? inputErr : inputOk}
          />

          <div style={{ height: 'var(--space-4)' }} />

          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>סיסמה</label>
          <input
            type="password" placeholder="••••••••" dir="ltr"
            value={password} onChange={e => setPassword(e.target.value)}
            style={passErr ? inputErr : inputOk}
          />

          <div style={{ height: 22 }} />

          <button
            onClick={submit}
            style={{
              width: '100%', padding: 13,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-primary)', color: 'var(--color-surface)',
              fontWeight: 700, fontSize: 'var(--font-size-body-min)',
              border: 'none', cursor: 'pointer',
              boxShadow: 'var(--shadow-btn-primary)',
            }}
          >כניסה</button>

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
          אין לך חשבון?{' '}
          <span onClick={() => navigate('/register')} style={{ color: 'var(--color-primary)', fontWeight: 700, cursor: 'pointer' }}>הרשמה</span>
        </p>
      </div>
    </div>
  )
}
