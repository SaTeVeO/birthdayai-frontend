import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// ── Animation ──────────────────────────────────────────────────
const CSS_ID = 'landing-anim'
function injectStyles() {
  if (document.getElementById(CSS_ID)) return
  const s = document.createElement('style')
  s.id = CSS_ID
  s.textContent = `
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(24px); }
      to   { opacity: 1; transform: translateY(0);    }
    }
    .fade-in { opacity: 0; transform: translateY(24px); transition: none; }
    .fade-in.visible { animation: fadeInUp 0.55s ease both; }
    .fade-in.visible.d1 { animation-delay: .07s; }
    .fade-in.visible.d2 { animation-delay: .14s; }
    .fade-in.visible.d3 { animation-delay: .21s; }

    @media (max-width: 700px) {
      .features-grid   { grid-template-columns: 1fr !important; }
      .how-steps       { flex-direction: column !important; }
      .step-connector  { display: none !important; }
      .landing-h1      { font-size: 2rem !important; }
      .landing-cta-row { flex-direction: column !important; align-items: stretch !important; }
    }
  `
  document.head.appendChild(s)
}

// ── Shared styles ───────────────────────────────────────────────
const primaryBtn = {
  borderRadius: 'var(--radius-sm)',
  border: 'none',
  background: 'var(--color-primary)',
  color: 'var(--color-surface)',
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: 'var(--shadow-btn-primary)',
}

const ghostBtn = {
  borderRadius: 'var(--radius-sm)',
  background: 'transparent',
  color: 'var(--color-text-body)',
  fontWeight: 600,
  border: '1.5px solid var(--color-border)',
  cursor: 'pointer',
}

const card = {
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border-subtle)',
  borderRadius: 'var(--radius-lg)',
  boxShadow: 'var(--shadow-card)',
}

// ── Component ───────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate()

  useEffect(() => {
    injectStyles()
    const els = document.querySelectorAll('.fade-in')
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target) }
      }),
      { threshold: 0.12 }
    )
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <main style={{ overflowX: 'hidden' }}>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section style={{
        maxWidth: 920, margin: '0 auto',
        padding: 'var(--space-22) var(--space-8) 56px',
        textAlign: 'center',
      }}>
        {/* Badge */}
        <div className="fade-in" style={{
          display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
          padding: '6px 14px', borderRadius: 'var(--radius-full)',
          background: 'var(--color-secondary)', color: 'var(--color-secondary-text)',
          fontSize: 13, fontWeight: 600, marginBottom: 'var(--space-6)',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)' }} />
          מופעל באמצעות בינה מלאכותית ✨
        </div>

        <h1 className="landing-h1 fade-in d1" style={{
          fontSize: 'var(--font-size-hero)',
          lineHeight: 1.1,
          fontWeight: 'var(--font-weight-hero)',
          letterSpacing: 'var(--letter-spacing-hero)',
          margin: '0 0 var(--space-5)',
          color: 'var(--color-text-primary)',
        }}>
          אל תשכח לברך את היקרים לך
        </h1>

        <p className="fade-in d2" style={{
          fontSize: 19,
          lineHeight: 'var(--line-height-body)',
          color: 'var(--color-text-muted)',
          maxWidth: 580, margin: '0 auto var(--space-8)',
        }}>
          BirthdayAI זוכרת את ימי ההולדת, יוצרת ברכה אישית ומרגשת בעזרת AI, ושולחת אותה לוואטסאפ או מייל בלחיצת כפתור.
        </p>

        <div className="landing-cta-row fade-in d3" style={{
          display: 'flex', gap: 'var(--space-3)',
          justifyContent: 'center', flexWrap: 'wrap',
        }}>
          <button
            onClick={() => navigate('/register')}
            style={{ ...primaryBtn, padding: '14px 30px', fontSize: 16 }}
          >התחל חינם</button>
          <button
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ ...ghostBtn, padding: '14px 30px', fontSize: 16 }}
          >ראה איך זה עובד</button>
        </div>
      </section>

      {/* ── APP PREVIEW ──────────────────────────────────────── */}
      <section className="fade-in" style={{
        maxWidth: 680, margin: '0 auto',
        padding: '0 var(--space-8) 80px',
      }}>
        <div style={{
          ...card,
          borderRadius: 'var(--radius-modal)',
          boxShadow: '0 28px 64px -24px rgba(17,24,39,.22)',
          padding: 22,
        }}>
          {/* Card header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 16, paddingBottom: 14,
            borderBottom: '1px solid var(--color-border-subtle)',
          }}>
            <span style={{ fontWeight: 700, fontSize: 'var(--font-size-body-min)' }}>ימי הולדת קרובים</span>
            <span style={{ fontSize: 12, color: 'var(--color-text-faint)', fontWeight: 500 }}>יוני 2026</span>
          </div>

          {/* Today card */}
          {[
            {
              initial: 'ד', bg: 'var(--avatar-1-bg)', color: 'var(--avatar-1-text)',
              name: 'דנה לוי', sub: 'אחות · 19 ביוני',
              badge: 'היום!',
              action: <button style={{ ...primaryBtn, padding: '7px 14px', fontSize: 12, whiteSpace: 'nowrap' }}>שלח ברכה 💬</button>,
              highlight: true,
            },
            {
              initial: 'י', bg: 'var(--avatar-2-bg)', color: 'var(--avatar-2-text)',
              name: 'יוסי כהן', sub: 'חבר · 22 ביוני',
              days: 'בעוד 3 ימים',
              action: <button style={{ ...ghostBtn, background: 'var(--color-secondary)', color: 'var(--color-secondary-text)', border: 'none', padding: '7px 14px', fontSize: 12, whiteSpace: 'nowrap' }}>ערוך ברכה</button>,
              highlight: false,
            },
            {
              initial: 'מ', bg: 'var(--avatar-3-bg)', color: 'var(--avatar-3-text)',
              name: 'מירב גולן', sub: 'קולגה · 28 ביוני',
              days: 'בעוד 9 ימים',
              action: <button style={{ ...ghostBtn, background: 'var(--color-secondary)', color: 'var(--color-secondary-text)', border: 'none', padding: '7px 14px', fontSize: 12, whiteSpace: 'nowrap' }}>ערוך ברכה</button>,
              highlight: false,
            },
          ].map(({ initial, bg, color, name, sub, badge, days, action, highlight }) => (
            <div key={name} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '12px 14px', borderRadius: 'var(--radius-md)',
              border: highlight ? '1.5px solid var(--color-border-highlight)' : '1px solid var(--color-border-subtle)',
              background: 'var(--color-surface)',
              marginBottom: 8,
              boxShadow: highlight ? 'var(--shadow-raised)' : 'none',
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 'var(--radius-full)',
                background: bg, color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 16, flexShrink: 0,
              }}>{initial}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontWeight: 700, fontSize: 'var(--font-size-body-min)' }}>{name}</span>
                  {badge && (
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      color: 'var(--color-accent-badge-text)',
                      background: 'var(--color-accent-badge-bg)',
                      padding: '2px 8px', borderRadius: 'var(--radius-full)',
                    }}>{badge}</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{sub}</div>
              </div>
              {days && <span style={{ fontSize: 12, color: 'var(--color-text-faint)', fontWeight: 500, whiteSpace: 'nowrap' }}>{days}</span>}
              {action}
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section style={{
        background: 'var(--color-surface-subtle)',
        borderTop: '1px solid var(--color-border-subtle)',
        borderBottom: '1px solid var(--color-border-subtle)',
        padding: 'var(--space-18) var(--space-8)',
      }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <div className="fade-in" style={{ textAlign: 'center', marginBottom: 44 }}>
            <h2 style={{
              fontSize: 'var(--font-size-h2)',
              fontWeight: 'var(--font-weight-h2)',
              letterSpacing: 'var(--letter-spacing-h2)',
              margin: '0 0 var(--space-3)',
              color: 'var(--color-text-primary)',
            }}>כל מה שצריך, במקום אחד</h2>
            <p style={{ fontSize: 17, color: 'var(--color-text-muted)', margin: 0 }}>
              פשוט, חכם, ומרגש — בדיוק כמו ברכה טובה.
            </p>
          </div>

          <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
            {[
              {
                emoji: '🎂',
                bg: 'var(--color-secondary)',
                title: 'זכירת ימי הולדת',
                body: 'הוסף אנשי קשר עם תאריכי יום הולדת וקבל תזכורת מבעוד מועד — לעולם לא תפספס.',
                delay: 'd1',
              },
              {
                emoji: '🤖',
                bg: 'var(--color-accent-badge-bg)',
                title: 'ברכה אישית מ‑AI',
                body: 'הבינה המלאכותית יוצרת ברכה מותאמת אישית לפי הקרבה, התחביבים והסגנון שתבחר.',
                delay: 'd2',
              },
              {
                emoji: '💬',
                bg: 'var(--avatar-3-bg)',
                title: 'שליחה בלחיצת כפתור',
                body: 'שלח את הברכה ישירות לוואטסאפ או למייל של איש הקשר — בלחיצה אחת.',
                delay: 'd3',
              },
            ].map(({ emoji, bg, title, body, delay }) => (
              <div key={title} className={`fade-in ${delay}`} style={{
                ...card,
                padding: 'var(--space-7)',
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 'var(--radius-md)',
                  background: bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26, marginBottom: 18,
                }}>{emoji}</div>
                <h3 style={{
                  fontSize: 18, fontWeight: 700,
                  margin: '0 0 var(--space-2)', color: 'var(--color-text-primary)',
                }}>{title}</h3>
                <p style={{
                  fontSize: 'var(--font-size-body-min)',
                  lineHeight: 'var(--line-height-body)',
                  color: 'var(--color-text-muted)', margin: 0,
                }}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section id="how-it-works" style={{ padding: 'var(--space-18) var(--space-8)' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div className="fade-in" style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{
              fontSize: 'var(--font-size-h2)',
              fontWeight: 'var(--font-weight-h2)',
              letterSpacing: 'var(--letter-spacing-h2)',
              margin: '0 0 var(--space-3)',
              color: 'var(--color-text-primary)',
            }}>איך זה עובד?</h2>
            <p style={{ fontSize: 17, color: 'var(--color-text-muted)', margin: 0 }}>שלושה צעדים פשוטים.</p>
          </div>

          <div className="how-steps" style={{ display: 'flex', alignItems: 'flex-start', gap: 0, position: 'relative' }}>
            {[
              {
                step: '1',
                title: 'הוסף איש קשר',
                body: 'שם, תאריך יום הולדת ופרטים אישיים כמו תחביבים וקרבה.',
                emoji: '👤',
              },
              {
                step: '2',
                title: 'קבל ברכה מ‑AI',
                body: 'בחר סגנון, שפה ואורך — ה‑AI יוצר ברכה אישית ושומר אותה בטיוטה.',
                emoji: '✨',
              },
              {
                step: '3',
                title: 'שלח בלחיצת כפתור',
                body: 'ישירות לוואטסאפ או מייל. הברכה נשמרת בהיסטוריה.',
                emoji: '🚀',
              },
            ].map(({ step, title, body, emoji }, i) => (
              <div key={step} style={{ display: 'flex', flex: 1, alignItems: 'flex-start' }}>
                <div className={`fade-in d${i + 1}`} style={{ flex: 1, textAlign: 'center', padding: '0 var(--space-5)' }}>
                  {/* Numbered circle */}
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'var(--color-secondary)',
                    border: '2px solid var(--color-border-highlight)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                    fontSize: 26,
                  }}>{emoji}</div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'var(--color-primary)', color: 'var(--color-surface)',
                    fontSize: 12, fontWeight: 700, marginBottom: 12,
                  }}>{step}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 var(--space-2)', color: 'var(--color-text-primary)' }}>{title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>{body}</p>
                </div>

                {/* Connector line between steps */}
                {i < 2 && (
                  <div className="step-connector" style={{
                    flexShrink: 0, width: 40, marginTop: 32,
                    borderTop: '2px dashed var(--color-border)',
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ─────────────────────────────────────────── */}
      <section style={{ padding: '0 var(--space-8) 80px' }}>
        <div className="fade-in" style={{
          maxWidth: 1040, margin: '0 auto',
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-hover) 100%)',
          borderRadius: 'var(--radius-cta)',
          padding: 'var(--space-14) 40px',
          textAlign: 'center',
          color: 'var(--color-surface)',
          boxShadow: '0 24px 60px -20px rgba(99,102,241,.55)',
        }}>
          <h2 style={{
            fontSize: 'var(--font-size-h2)',
            fontWeight: 'var(--font-weight-h2)',
            margin: '0 0 12px',
            letterSpacing: 'var(--letter-spacing-h2)',
          }}>מוכן להתחיל?</h2>
          <p style={{ fontSize: 17, opacity: 0.88, margin: '0 0 var(--space-7)' }}>
            הצטרף חינם ותן ל‑AI לדאוג לברכות שלך
          </p>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '15px 34px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-surface)',
              color: 'var(--color-primary)',
              fontWeight: 700, fontSize: 16,
              border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(0,0,0,.18)',
            }}
          >הירשם עכשיו — חינם</button>
        </div>
      </section>

    </main>
  )
}
