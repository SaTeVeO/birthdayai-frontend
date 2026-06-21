import { useNavigate } from 'react-router-dom'

const primaryBtn = {
  borderRadius: 'var(--radius-sm)',
  border: 'none',
  background: 'var(--color-primary)',
  color: 'var(--color-surface)',
  fontWeight: 600,
  cursor: 'pointer',
}

const secondaryBtn = {
  borderRadius: 'var(--radius-sm)',
  background: 'var(--color-surface)',
  color: 'var(--color-text-body)',
  fontWeight: 600,
  border: '1px solid var(--color-border)',
  cursor: 'pointer',
}

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="landing-hero" style={{
        maxWidth: 920, margin: '0 auto',
        padding: 'var(--space-22) var(--space-8) 48px',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
          padding: '6px 14px', borderRadius: 'var(--radius-full)',
          background: 'var(--color-secondary)', color: 'var(--color-secondary-text)',
          fontSize: 13, fontWeight: 600, marginBottom: 'var(--space-7)',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)' }} />
          מופעל באמצעות בינה מלאכותית
        </div>

        <h1 className="landing-h1" style={{
          fontSize: 'var(--font-size-hero)',
          lineHeight: 1.08,
          fontWeight: 'var(--font-weight-hero)',
          letterSpacing: 'var(--letter-spacing-hero)',
          margin: '0 0 var(--space-5)',
          color: 'var(--color-text-primary)',
        }}>
          אל תשכח יום הולדת לעולם יותר
        </h1>

        <p style={{
          fontSize: 20,
          lineHeight: 'var(--line-height-body)',
          color: 'var(--color-text-muted)',
          maxWidth: 620, margin: '0 auto 36px',
        }}>
          BirthdayAI עוקבת אחרי כל ימי ההולדת החשובים לך, כותבת ברכה אישית עם AI ושולחת אותה אוטומטית
          ב‑WhatsApp או במייל — כדי שלא תפספס אף אחד.
        </p>

        <div className="landing-cta-row" style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/register')}
            style={{ ...primaryBtn, padding: '14px 28px', fontSize: 16, boxShadow: 'var(--shadow-btn-primary)' }}
          >התחל חינם</button>
          <button style={{ ...secondaryBtn, padding: '14px 28px', fontSize: 16 }}>
            ראה איך זה עובד
          </button>
        </div>
      </section>

      {/* ── Preview card ─────────────────────────────────── */}
      <section className="landing-preview" style={{ maxWidth: 760, margin: '0 auto', padding: '0 var(--space-8) 80px' }}>
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: 'var(--radius-modal)',
          boxShadow: '0 24px 60px -22px rgba(17,24,39,.25)',
          padding: 22,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
            <span style={{ fontWeight: 700, fontSize: 'var(--font-size-body-min)' }}>ימי הולדת קרובים</span>
            <span style={{ fontSize: 'var(--font-size-label-min)', color: 'var(--color-text-faint)' }}>יוני 2026</span>
          </div>

          {/* Today card */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: 14, borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--color-border-highlight)',
            background: 'var(--color-surface)',
            marginBottom: 10,
            boxShadow: 'var(--shadow-raised)',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 'var(--radius-full)',
              background: 'var(--avatar-1-bg)', color: 'var(--avatar-1-text)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 'var(--font-size-card-title-min)', flexShrink: 0,
            }}>ד</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ fontWeight: 700, fontSize: 'var(--font-size-body-min)' }}>דנה לוי</span>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: 'var(--color-accent-badge-text)',
                  background: 'var(--color-accent-badge-bg)',
                  padding: '3px var(--space-2)', borderRadius: 'var(--radius-full)',
                }}>היום!</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 3 }}>אחות · 19 ביוני</div>
            </div>
            <button style={{ ...primaryBtn, padding: 'var(--space-2) var(--space-4)', fontSize: 13, whiteSpace: 'nowrap' }}>
              שלח ברכה
            </button>
          </div>

          {/* Upcoming card */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: 14, borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-subtle)',
            background: 'var(--color-surface)',
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 'var(--radius-full)',
              background: 'var(--avatar-2-bg)', color: 'var(--avatar-2-text)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: 'var(--font-size-card-title-min)', flexShrink: 0,
            }}>י</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--font-size-body-min)' }}>יוסי כהן</div>
              <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 3 }}>חבר מהצבא · 22 ביוני</div>
            </div>
            <span style={{ fontSize: 13, color: 'var(--color-text-faint)', fontWeight: 600 }}>בעוד 3 ימים</span>
            <button style={{
              ...secondaryBtn,
              background: 'var(--color-secondary)', color: 'var(--color-secondary-text)',
              padding: 'var(--space-2) var(--space-4)', fontSize: 13, whiteSpace: 'nowrap',
            }}>ערוך ברכה</button>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="features-section" style={{
        background: 'var(--color-surface-subtle)',
        borderTop: '1px solid var(--color-border-subtle)',
        borderBottom: '1px solid var(--color-border-subtle)',
        padding: 'var(--space-18) var(--space-8)',
      }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <h2 style={{
              fontSize: 'var(--font-size-h2)',
              fontWeight: 'var(--font-weight-h2)',
              letterSpacing: 'var(--letter-spacing-h2)',
              margin: '0 0 var(--space-3)',
              color: 'var(--color-text-primary)',
            }}>כל מה שצריך כדי לא לשכוח</h2>
            <p style={{ fontSize: 17, color: 'var(--color-text-muted)', margin: 0 }}>שלושה צעדים פשוטים, אפס מאמץ.</p>
          </div>

          <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
            {[
              {
                iconBg: 'var(--color-secondary)',
                icon: <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2.5px solid var(--color-primary)' }} />,
                title: 'תזכורות חכמות',
                body: 'קבל התראה כמה ימים לפני כל יום הולדת, כדי שתמיד יהיה לך זמן להתכונן.',
              },
              {
                iconBg: 'var(--color-accent-badge-bg)',
                icon: <div style={{ width: 15, height: 15, borderRadius: 3, border: '2.5px solid var(--avatar-2-text)', transform: 'rotate(45deg)' }} />,
                title: 'ברכה אישית מ‑AI',
                body: 'ה‑AI כותב ברכה חמה ומותאמת אישית לפי הקשר, התחביבים וההיכרות שלך עם כל אדם.',
              },
              {
                iconBg: 'var(--avatar-3-bg)',
                icon: <div style={{ width: 16, height: 16, borderRadius: 5, background: 'var(--avatar-3-text)' }} />,
                title: 'שליחה אוטומטית',
                body: 'הברכה נשלחת אוטומטית בערוץ המועדף — WhatsApp או אימייל — בדיוק בזמן.',
              },
            ].map(({ iconBg, icon, title, body }) => (
              <div key={title} style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-7)',
                boxShadow: 'var(--shadow-card)',
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--radius-md)',
                  background: iconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 18,
                }}>{icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 var(--space-2)', color: 'var(--color-text-primary)' }}>{title}</h3>
                <p style={{ fontSize: 'var(--font-size-body-min)', lineHeight: 'var(--line-height-body)', color: 'var(--color-text-muted)', margin: 0 }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA band ─────────────────────────────────────── */}
      <section className="cta-section" style={{ padding: '80px var(--space-8)' }}>
        <div className="cta-band" style={{
          maxWidth: 1080, margin: '0 auto',
          background: 'linear-gradient(135deg,var(--color-primary),var(--color-primary-hover))',
          borderRadius: 'var(--radius-cta)',
          padding: 'var(--space-14) 40px',
          textAlign: 'center',
          color: 'var(--color-surface)',
          boxShadow: '0 24px 60px -24px rgba(99,102,241,.6)',
        }}>
          <h2 style={{
            fontSize: 'var(--font-size-h2)',
            fontWeight: 'var(--font-weight-h2)',
            margin: '0 0 14px',
            letterSpacing: 'var(--letter-spacing-h2)',
          }}>מוכן להפסיק לשכוח ימי הולדת?</h2>
          <p style={{ fontSize: 17, opacity: 0.9, margin: '0 0 var(--space-7)' }}>
            הצטרף בחינם והגדר את איש הקשר הראשון תוך פחות מדקה.
          </p>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '15px 32px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-surface)',
              color: 'var(--color-primary-hover)',
              fontWeight: 700, fontSize: 16,
              border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,.18)',
            }}
          >הירשם עכשיו — חינם</button>
        </div>
      </section>
    </main>
  )
}
