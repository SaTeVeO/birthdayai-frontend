import { useState, useEffect } from 'react'

// ── Shared modal shell ──────────────────────────────────────────
function Modal({ title, onClose, children }) {
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
        dir="rtl"
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
  return (
    <>
      <p style={{ color: 'var(--color-text-faint)', fontSize: 12, margin: '0 0 20px' }}>
        עדכון אחרון: יוני 2026
      </p>
      <Section title="איסוף מידע">
        אנו אוספים את המידע הבא בעת השימוש בשירות: שם משתמש, כתובת דוא״ל, ונתוני אנשי הקשר שהמשתמש מזין באופן ידני (שם, תאריך יום הולדת, קרבה, טלפון, הערות).
      </Section>
      <Section title="שימוש במידע">
        המידע משמש אך ורק לצורך פעולת השירות: יצירת ברכות מותאמות אישית בעזרת AI ושליחתן. איננו משתמשים במידע למטרות שיווקיות.
      </Section>
      <Section title="אבטחת מידע">
        המידע מאוחסן בשרתי Supabase המוצפנים תחת תקני אבטחה מתקדמים. החיבור לשרת מוצפן באמצעות HTTPS.
      </Section>
      <Section title="שיתוף מידע">
        אנו לא מוכרים, משכירים או משתפים את המידע האישי שלך עם צדדים שלישיים, למעט שירותי התשתית הנדרשים להפעלת האפליקציה (Supabase, OpenAI).
      </Section>
      <Section title="עוגיות (Cookies)">
        האפליקציה משתמשת בעוגיות לצורך ניהול הסשן בלבד. אין שימוש בעוגיות מעקב או שיווקיות.
      </Section>
      <Section title="זכויות המשתמש">
        יש לך הזכות לעיין במידע שנאסף עליך, לתקן אותו, ולבקש את מחיקתו. לפנייה בנושא זה ראה קישור "צור קשר".
      </Section>
      <Section title="יצירת קשר">
        לכל שאלה בנושא פרטיות:{' '}
        <a href="mailto:birthdayai.contact@gmail.com" style={{ color: 'var(--color-primary)' }}>
          birthdayai.contact@gmail.com
        </a>
      </Section>
    </>
  )
}

// ── Terms modal content ─────────────────────────────────────────
function TermsContent() {
  return (
    <>
      <p style={{ color: 'var(--color-text-faint)', fontSize: 12, margin: '0 0 20px' }}>
        עדכון אחרון: יוני 2026
      </p>
      <Section title="קבלת התנאים">
        השימוש בשירות BirthdayAI מהווה הסכמה לתנאי שימוש אלה. אם אינך מסכים לתנאים, אנא הימנע משימוש בשירות.
      </Section>
      <Section title="גיל מינימלי">
        השירות מיועד למשתמשים מגיל 13 ומעלה. משתמשים מתחת לגיל 13 אינם רשאים להירשם.
      </Section>
      <Section title="אחריות המשתמש">
        המשתמש אחראי לכל תוכן הברכות שהוא יוצר ושולח באמצעות השירות. יש להשתמש בשירות בתום לב ובאופן שאינו פוגע בפרטיות אחרים.
      </Section>
      <Section title="שימוש אסור">
        אסור להשתמש בשירות לשליחת ספאם, תוכן פוגעני, הטרדה, או כל שימוש המנוגד לחוק הישראלי. BirthdayAI שומרת לעצמה הזכות לסגור חשבונות המפרים תנאים אלה ללא התראה מוקדמת.
      </Section>
      <Section title="השירות ניתן AS-IS">
        השירות מסופק כמות שהוא (AS-IS), ללא אחריות מכל סוג. BirthdayAI אינה אחראית לנזקים ישירים או עקיפים הנובעים מהשימוש בשירות.
      </Section>
      <Section title="שינויים בשירות">
        BirthdayAI שומרת לעצמה הזכות לשנות, להשעות או להפסיק את השירות בכל עת, עם או בלי הודעה מוקדמת.
      </Section>
      <Section title="דין חל">
        תנאי שימוש אלה כפופים לדין הישראלי. כל סכסוך יתברר בבתי המשפט המוסמכים בישראל.
      </Section>
    </>
  )
}

// ── Contact modal content ───────────────────────────────────────
function ContactContent() {
  const [name,           setName]           = useState('')
  const [email,          setEmail]          = useState('')
  const [message,        setMessage]        = useState('')
  const [contactSuccess, setContactSuccess] = useState(false)

  function handleSubmit() {
    const subject = encodeURIComponent(`פנייה מ-${name} דרך BirthdayAI`)
    const body    = encodeURIComponent(`שם: ${name}\nמייל: ${email}\n\nהודעה:\n${message}`)
    window.open(
      `mailto:birthdayai.contact@gmail.com?subject=${subject}&body=${body}`,
      '_blank'
    )
    setName('')
    setEmail('')
    setMessage('')
    setContactSuccess(true)
    setTimeout(() => setContactSuccess(false), 3000)
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
    direction: 'rtl',
  }

  return (
    <>
      <p style={{ color: 'var(--color-text-muted)', margin: '0 0 20px' }}>
        לכל שאלה, בקשה או משוב, ניתן לפנות ישירות למייל:{' '}
        <a href="mailto:birthdayai.contact@gmail.com" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
          birthdayai.contact@gmail.com
        </a>
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 5, color: 'var(--color-text-primary)' }}>שם</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="הכנס את שמך"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 5, color: 'var(--color-text-primary)' }}>כתובת מייל</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            style={{ ...inputStyle, direction: 'ltr' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 5, color: 'var(--color-text-primary)' }}>הודעה</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="כתוב את הודעתך כאן..."
            rows={5}
            style={{ ...inputStyle, resize: 'vertical', minHeight: 110 }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
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
            }}
          >שלח הודעה</button>

          {contactSuccess && (
            <span style={{ fontSize: 14, color: 'var(--color-primary)', fontWeight: 600 }}>
              ההודעה נשלחה ✓
            </span>
          )}
        </div>
      </div>
    </>
  )
}

// ── Footer ──────────────────────────────────────────────────────
export default function Footer() {
  const [open, setOpen] = useState(null) // 'privacy' | 'terms' | 'contact' | null

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

          <span style={{ fontSize: 13, color: 'var(--color-text-faint)' }}>
            © 2026 BirthdayAI · כל הזכויות שמורות
          </span>

          <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--color-text-muted)' }}>
            {[
              { key: 'privacy', label: 'פרטיות' },
              { key: 'terms',   label: 'תנאי שימוש' },
              { key: 'contact', label: 'צור קשר' },
            ].map(({ key, label }) => (
              <span
                key={key}
                onClick={() => setOpen(key)}
                style={{
                  cursor: 'pointer',
                  transition: 'color .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = ''}
              >{label}</span>
            ))}
          </div>
        </div>
      </footer>

      {open === 'privacy' && (
        <Modal title="מדיניות פרטיות" onClose={() => setOpen(null)}>
          <PrivacyContent />
        </Modal>
      )}
      {open === 'terms' && (
        <Modal title="תנאי שימוש" onClose={() => setOpen(null)}>
          <TermsContent />
        </Modal>
      )}
      {open === 'contact' && (
        <Modal title="צור קשר" onClose={() => setOpen(null)}>
          <ContactContent />
        </Modal>
      )}
    </>
  )
}
