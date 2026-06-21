import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

const MAX = 500

function defaultGreeting(contact) {
  const first = contact.name?.split(' ')[0] ?? contact.name
  return `${first} היקר/ה,\nיום הולדת שמח! 🎉 מאחלים לך שנה מלאה בבריאות, שמחה והצלחות רבות.\n\nבאהבה רבה ❤️`
}

const channelBase = {
  display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
  padding: '10px var(--space-4)', borderRadius: 'var(--radius-sm)',
  fontWeight: 600, fontSize: 'var(--font-size-label-max)',
  cursor: 'pointer',
}

export default function EditGreeting() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user }  = useAuth()
  const contact   = location.state?.contact

  const [text,             setText]            = useState(() => contact ? defaultGreeting(contact) : '')
  const [channel,          setChannel]          = useState('whatsapp')
  const [sent,             setSent]             = useState(false)
  const [draftSaved,       setDraftSaved]       = useState(false)
  const [saving,           setSaving]           = useState(false)
  const [existingGreeting, setExistingGreeting] = useState(null)
  const [loadingGreeting,  setLoadingGreeting]  = useState(!!contact)

  // Redirect when there's no contact in navigation state
  useEffect(() => {
    if (!contact) navigate('/dashboard', { replace: true })
  }, [])

  // Load existing draft — waits until both contact and user are ready
  useEffect(() => {
    if (!contact?.id || !user?.id) return

    async function loadDraft() {
      const { data } = await supabase
        .from('greetings')
        .select('*')
        .eq('contact_id', contact.id)
        .eq('user_id', user.id)
        .eq('status', 'draft')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (data) {
        setExistingGreeting(data)
        setText(data.greeting_text)
        if (data.channel) setChannel(data.channel)
      }
      setLoadingGreeting(false)
    }

    loadDraft()
  }, [contact, user])

  if (!contact) return null

  async function handleSend() {
    if (saving) return
    setSaving(true)

    if (existingGreeting) {
      await supabase
        .from('greetings')
        .update({
          greeting_text: text,
          channel,
          status:  'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', existingGreeting.id)
    } else {
      await supabase.from('greetings').insert({
        user_id:       user.id,
        contact_id:    contact.id,
        greeting_text: text,
        channel,
        status:  'sent',
        sent_at: new Date().toISOString(),
      })
    }

    setSaving(false)
    setSent(true)
    setTimeout(() => navigate('/dashboard'), 2000)
  }

  async function handleDraft() {
    if (saving) return
    setSaving(true)

    console.log('saving draft...')
    console.log('user.id:', user.id)
    console.log('contact.id:', contact.id)
    console.log('text:', text)
    console.log('existingGreeting:', existingGreeting)

    if (existingGreeting?.id) {
      const { data, error } = await supabase
        .from('greetings')
        .update({ greeting_text: text, channel })
        .eq('id', existingGreeting.id)
        .eq('user_id', user.id)
        .select('*')
        .single()
      console.log('update result:', data, error)
      if (data) setExistingGreeting(data)
    } else {
      const { data: newGreeting, error: insertError } = await supabase
        .from('greetings')
        .insert({
          user_id:       user.id,
          contact_id:    contact.id,
          greeting_text: text,
          channel,
          status: 'draft',
        })
        .select()
        .single()
      console.log('insert result:', newGreeting, insertError)
      if (newGreeting) setExistingGreeting(newGreeting)
    }

    setSaving(false)
    setDraftSaved(true)
    setTimeout(() => setDraftSaved(false), 3000)
  }

  const firstName    = contact.name?.split(' ')[0] ?? contact.name
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

  const hobbies = Array.isArray(contact.hobbies) ? contact.hobbies : []

  return (
    <main className="edit-main" style={{ maxWidth: 680, margin: '0 auto', padding: 'var(--space-8)' }}>

      {/* ── Sent banner ──────────────────────────────────── */}
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

      {/* ── Draft saved banner ───────────────────────────── */}
      {draftSaved && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
          background: 'var(--color-secondary)',
          border: '1px solid var(--color-border)',
          color: 'var(--color-secondary-text)',
          padding: '14px var(--space-4)', borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-5)',
        }}>
          <span style={{ fontWeight: 600, fontSize: 'var(--font-size-label-max)' }}>הטיוטה נשמרה ✓</span>
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
        }}>{contact.initial ?? contact.name?.[0] ?? '?'}</div>
        <div style={{ flex: 1 }}>
          <span style={{ fontWeight: 800, fontSize: 'var(--font-size-card-title-max)', color: 'var(--color-text-primary)' }}>
            {contact.name}
          </span>
          <div style={{ fontSize: 'var(--font-size-label-max)', color: 'var(--color-text-muted)', marginTop: 4 }}>
            {[contact.relationship, contact.dateLabel && `יום הולדת · ${contact.dateLabel}`].filter(Boolean).join(' · ')}
          </div>
          {hobbies.length > 0 && (
            <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
              {hobbies.map(h => (
                <span key={h} style={{
                  fontSize: 'var(--font-size-label-min)',
                  background: 'var(--color-bg)', color: '#374151',
                  padding: '4px 10px', borderRadius: 'var(--radius-full)',
                }}>{h}</span>
              ))}
            </div>
          )}
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
          dir="rtl"
          style={{
            width: '100%', minHeight: '150px',
            padding: '14px',
            fontSize: '15px', lineHeight: '1.6',
            borderRadius: '8px',
            border: '1px solid var(--color-border-secondary)',
            color: 'var(--color-text-primary)',
            background: 'var(--color-background-primary)',
            resize: 'vertical', outline: 'none',
            fontFamily: 'inherit',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--space-3)' }}>
          <button
            onClick={() => setText(defaultGreeting(contact))}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
              padding: '9px var(--space-4)', borderRadius: 'var(--radius-sm)',
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              color: 'var(--color-text-body)', fontWeight: 600, fontSize: 'var(--font-size-label-max)', cursor: 'pointer',
            }}
          >
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
          onClick={handleSend}
          disabled={saving || sent}
          style={{
            flex: 1, minWidth: 180, padding: 14,
            borderRadius: 'var(--radius-sm)',
            background: 'var(--color-primary)', color: 'var(--color-surface)',
            fontWeight: 700, fontSize: 'var(--font-size-body-min)',
            border: 'none', cursor: saving || sent ? 'not-allowed' : 'pointer',
            opacity: saving || sent ? 0.7 : 1,
            boxShadow: 'var(--shadow-btn-primary)',
          }}
        >{saving ? 'שולח...' : 'שלח ברכה עכשיו'}</button>
        <button
          onClick={handleDraft}
          disabled={saving}
          style={{
            padding: '14px var(--space-5)', borderRadius: 'var(--radius-sm)',
            background: 'var(--color-secondary)', color: 'var(--color-secondary-text)',
            fontWeight: 600, fontSize: 'var(--font-size-body-min)',
            border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1,
          }}
        >{saving ? 'שומר...' : draftSaved ? 'נשמר ✓' : 'שמור טיוטה'}</button>
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
