import { useState, useEffect } from 'react'
import emailjs from '@emailjs/browser'
import { useLanguage } from '../../contexts/LanguageContext'

// ── Shared modal shell ──────────────────────────────────────────
function Modal({ title, onClose, dir = 'rtl', children }) {
  // Close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        dir={dir}
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-modal)',
          boxShadow: '0 24px 64px -16px rgba(0,0,0,0.35)',
          width: '100%', maxWidth: 560,
          maxHeight: '80vh',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 24px',
          borderBottom: '1px solid var(--color-border-subtle)',
          flexShrink: 0,
        }}>
          <span style={{ fontWeight: 700, fontSize: 17, color: 'var(--color-text-primary)' }}>
            {title}
          </span>
          <button
            onClick={onClose}
            aria-label="סגור"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-text-muted)', fontSize: 20,
              width: 32, height: 32, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              lineHeight: 1,
            }}
          >✕</button>
        </div>

        {/* Scrollable body */}
        <div style={{
          overflowY: 'auto', padding: '24px',
          color: 'var(--color-text-body)',
          fontSize: 14, lineHeight: 1.8,
        }}>
          {children}
        </div>
      </div>
    </div>
  )
}

// ── Section helper ──────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{
        fontSize: 15, fontWeight: 700,
        color: 'var(--color-text-primary)',
        margin: '0 0 8px',
      }}>{title}</h3>
      <div style={{ color: 'var(--color-text-muted)' }}>{children}</div>
    </div>
  )
}

// ── Privacy modal content ───────────────────────────────────────
function PrivacyContent() {
  const { t } = useLanguage()
  return (
    <>
      <p style={{ color: 'var(--color-text-faint)', fontSize: 12, margin: '0 0 20px' }}>
        {t('footer.privacy_updated')}
      </p>
      <Section title={t('footer.privacy_collection_title')}>
        {t('footer.privacy_collection_text')}
      </Section>
      <Section title={t('footer.privacy_usage_title')}>
        {t('footer.privacy_usage_text')}
      </Section>
      <Section title={t('footer.privacy_security_title')}>
        {t('footer.privacy_security_text')}
      </Section>
      <Section title={t('footer.privacy_sharing_title')}>
        {t('footer.privacy_sharing_text')}
      </Section>
      <Section title={t('footer.privacy_cookies_title')}>
        {t('footer.privacy_cookies_text')}
      </Section>
      <Section title={t('footer.privacy_contact_title')}>
        {t('footer.privacy_contact_text')}{' '}
        <a href="mailto:birthdayai.contact@gmail.com" style={{ color: 'var(--color-primary)' }}>
          birthdayai.contact@gmail.com
        </a>
      </Section>
    </>
  )
}

// ── Terms modal content ─────────────────────────────────────────
function TermsContent() {
  const { t } = useLanguage()
  return (
    <>
      <p style={{ color: 'var(--color-text-faint)', fontSize: 12, margin: '0 0 20px' }}>
        {t('footer.privacy_updated')}
      </p>
      <ul style={{ margin: 0, paddingInlineStart: 20, color: 'var(--color-text-muted)', lineHeight: 2.2 }}>
        <li>{t('footer.terms_age')}</li>
        <li>{t('footer.terms_responsibility')}</li>
        <li>{t('footer.terms_spam')}</li>
        <li>{t('footer.terms_suspension')}</li>
        <li>{t('footer.terms_service')}</li>
        <li>{t('footer.terms_law')}</li>
      </ul>
    </>
  )
}

// ── Contact modal content ───────────────────────────────────────
function ContactContent() {
  const [name,           setName]           = useState('')
  const [email,          setEmail]          = useState('')
  const [message,        setMessage]        = useState('')
  const [contactSuccess, setContactSuccess] = useState(false)
  const { t, language } = useLanguage()
  const isRtl = language === 'he'

  async function handleSubmit() {
    if (!name || !email || !message) {
      alert('נא למלא את כל השדות')
      return
    }

    try {
      await emailjs.send(
        'birthdayai_contact',
        'template_ivn200f',
        { from_name: name, from_email: email, message },
        'umnrwQBgZT6WD9j1D'
      )
      setContactSuccess(true)
      setName('')
      setEmail('')
      setMessage('')
    } catch (error) {
      console.error('EmailJS error:', error)
      alert('שגיאה בשליחה, נסה שוב')
    }
  }

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '10px 12px',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 14, fontFamily: 'var(--font-family)',
    color: 'var(--color-text-primary)',
    background: 'var(--color-surface)',
    outline: 'none',
    direction: isRtl ? 'rtl' : 'ltr',
  }

  return (
    <>
      <p style={{ color: 'var(--color-text-muted)', margin: '0 0 20px' }}>
        {t('footer.contact_intro')}{' '}
        <a href="mailto:birthdayai.contact@gmail.com" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
          birthdayai.contact@gmail.com
        </a>
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 5, color: 'var(--color-text-primary)' }}>{t('footer.contact_name')}</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t('footer.contact_name')}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 5, color: 'var(--color-text-primary)' }}>{t('footer.contact_email')}</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            style={{ ...inputStyle, direction: 'ltr' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 5, color: 'var(--color-text-primary)' }}>{t('footer.contact_message')}</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder={t('footer.contact_message')}
            rows={5}
            style={{ ...inputStyle, resize: 'vertical', minHeight: 110 }}
          />
        </div>

        {contactSuccess ? (
          <div style={{
            padding: '14px 18px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-secondary)',
            border: '1px solid var(--color-border-highlight)',
            color: 'var(--color-text-primary)',
            fontSize: 14, lineHeight: 1.7,
          }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>{t('footer.contact_success')}</div>
            <div style={{ color: 'var(--color-text-muted)' }}>
              {t('footer.contact_direct')}{' '}
              <a href="mailto:birthdayai.contact@gmail.com" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                birthdayai.contact@gmail.com
              </a>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            style={{
              padding: '11px 24px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: 'var(--color-primary)',
              color: 'var(--color-surface)',
              fontWeight: 700, fontSize: 15,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-btn-primary)',
              alignSelf: 'flex-start',
            }}
          >{t('footer.contact_send')}</button>
        )}
      </div>
    </>
  )
}

// ── Footer ──────────────────────────────────────────────────────
export default function Footer() {
  const [open, setOpen] = useState(null) // 'privacy' | 'terms' | 'contact' | null
  const { t, language, setLanguage } = useLanguage()
  const modalDir = language === 'he' ? 'rtl' : 'ltr'

  return (
    <>
      <footer style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
        <div style={{
          maxWidth: 1080, margin: '0 auto',
          padding: 'var(--space-7) var(--space-8)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 'var(--space-4)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', direction: 'ltr' }}>
            <div style={{
              width: 24, height: 24, borderRadius: 7,
              background: 'var(--color-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--color-surface)' }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 'var(--font-size-label-max)' }}>BirthdayAI</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--color-text-faint)' }}>
              {t('footer.rights')}
            </span>
            <div style={{ display: 'flex', gap: 2 }}>
              {[
                { key: 'he', flag: '🇮🇱' },
                { key: 'en', flag: '🇺🇸' },
                { key: 'ru', flag: '🇷🇺' },
              ].map(l => (
                <button
                  key={l.key}
                  onClick={() => setLanguage(l.key)}
                  title={l.key}
                  style={{
                    width: 28, height: 28,
                    borderRadius: 'var(--radius-sm)',
                    border: language === l.key ? '1.5px solid var(--color-primary)' : '1px solid transparent',
                    background: language === l.key ? 'var(--color-secondary)' : 'transparent',
                    fontSize: 15, cursor: 'pointer', lineHeight: 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >{l.flag}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--color-text-muted)' }}>
            {[
              { key: 'privacy', label: t('footer.privacy') },
              { key: 'terms',   label: t('footer.terms')   },
              { key: 'contact', label: t('footer.contact') },
            ].map(({ key, label }) => (
              <span
                key={key}
                onClick={() => setOpen(key)}
                style={{ cursor: 'pointer', transition: 'color .15s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = ''}
              >{label}</span>
            ))}
          </div>
        </div>
      </footer>

      {open === 'privacy' && (
        <Modal title={t('footer.privacyTitle')} onClose={() => setOpen(null)} dir={modalDir}>
          <PrivacyContent />
        </Modal>
      )}
      {open === 'terms' && (
        <Modal title={t('footer.termsTitle')} onClose={() => setOpen(null)} dir={modalDir}>
          <TermsContent />
        </Modal>
      )}
      {open === 'contact' && (
        <Modal title={t('footer.contactTitle')} onClose={() => setOpen(null)} dir={modalDir}>
          <ContactContent />
        </Modal>
      )}
    </>
  )
}
