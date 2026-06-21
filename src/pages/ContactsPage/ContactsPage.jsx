import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

const MONTHS_HE = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר']

const AVATAR_SLOTS = [
  { bg: 'var(--avatar-1-bg)', color: 'var(--avatar-1-text)' },
  { bg: 'var(--avatar-2-bg)', color: 'var(--avatar-2-text)' },
  { bg: 'var(--avatar-3-bg)', color: 'var(--avatar-3-text)' },
  { bg: 'var(--avatar-4-bg)', color: 'var(--avatar-4-text)' },
  { bg: 'var(--avatar-5-bg)', color: 'var(--avatar-5-text)' },
]

function parseBirthday(str) {
  const [, m, d] = str.split('-').map(Number)
  return { month: m - 1, day: d }
}

function daysUntil(birthday) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { month, day } = parseBirthday(birthday)
  const next = new Date(today.getFullYear(), month, day)
  if (next < today) next.setFullYear(today.getFullYear() + 1)
  return Math.round((next - today) / 86400000)
}

function birthdayLabel(birthday) {
  const { month, day } = parseBirthday(birthday)
  return `${day} ב${MONTHS_HE[month]}`
}

function daysText(days) {
  if (days === 0) return 'היום!'
  if (days === 1) return 'מחר'
  return `בעוד ${days} ימים`
}

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 'var(--radius-sm)',
  border: '1.5px solid var(--color-border)',
  fontSize: 'var(--font-size-body-min)',
  outline: 'none',
  background: 'var(--color-surface)',
  color: 'var(--color-text-primary)',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
}

const labelStyle = {
  display: 'block',
  fontSize: 13, fontWeight: 600,
  marginBottom: 6,
  color: 'var(--color-text-primary)',
}

function EditContactModal({ contact, onClose, onSuccess }) {
  const [name,         setName]         = useState(contact.name || '')
  const [birthday,     setBirthday]     = useState(contact.birthday || '')
  const [relationship, setRelationship] = useState(contact.relationship || '')
  const [phone,        setPhone]        = useState(contact.phone || '')
  const [email,        setEmail]        = useState(contact.email || '')
  const [hobbies,      setHobbies]      = useState(
    Array.isArray(contact.hobbies) ? contact.hobbies.join(', ') : (contact.hobbies || '')
  )
  const [notes,  setNotes]  = useState(contact.notes || '')
  const [error,  setError]  = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setError('')
    if (!name.trim()) { setError('נא להזין שם מלא'); return }
    if (!birthday)    { setError('נא להזין תאריך לידה'); return }

    setSaving(true)
    const { error: updateError } = await supabase
      .from('contacts')
      .update({
        name:         name.trim(),
        birthday,
        relationship: relationship.trim() || null,
        phone:        phone.trim()        || null,
        email:        email.trim()        || null,
        hobbies:      hobbies.trim()
          ? hobbies.split(',').map(s => s.trim()).filter(Boolean)
          : null,
        notes:        notes.trim()        || null,
      })
      .eq('id', contact.id)

    setSaving(false)
    if (updateError) {
      setError('שגיאה בעדכון: ' + updateError.message)
    } else {
      onSuccess()
    }
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100, padding: 'var(--space-4)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--color-surface)',
          borderRadius: 'var(--radius-modal)',
          padding: 'var(--space-8)',
          width: '100%', maxWidth: 480,
          maxHeight: '90vh', overflowY: 'auto',
          boxShadow: 'var(--shadow-modal)',
          direction: 'rtl',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontSize: 'var(--font-size-page-title-min)', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>
            עריכת איש קשר
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--color-text-muted)', lineHeight: 1, padding: 4 }}
          >✕</button>
        </div>

        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
            background: 'var(--color-error-bg)',
            border: '1px solid var(--color-border-error)',
            color: 'var(--color-error-text)',
            padding: '10px 12px', borderRadius: 'var(--radius-sm)',
            fontSize: 13, fontWeight: 600, marginBottom: 'var(--space-4)',
          }}>
            <span style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--color-error)', color: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>!</span>
            {error}
          </div>
        )}

        <label style={labelStyle}>שם מלא <span style={{ color: 'var(--color-error)' }}>*</span></label>
        <input type="text" dir="rtl" value={name} onChange={e => setName(e.target.value)}
          style={{ ...inputStyle, marginBottom: 'var(--space-4)' }} />

        <label style={labelStyle}>תאריך לידה <span style={{ color: 'var(--color-error)' }}>*</span></label>
        <input type="date" dir="ltr" value={birthday} onChange={e => setBirthday(e.target.value)}
          style={{ ...inputStyle, marginBottom: 'var(--space-4)' }} />

        <label style={labelStyle}>קשר</label>
        <input type="text" dir="rtl" placeholder="חבר, אחות, עמית לעבודה..." value={relationship} onChange={e => setRelationship(e.target.value)}
          style={{ ...inputStyle, marginBottom: 'var(--space-4)' }} />

        <label style={labelStyle}>טלפון</label>
        <input type="tel" dir="ltr" placeholder="050-1234567" value={phone} onChange={e => setPhone(e.target.value)}
          style={{ ...inputStyle, marginBottom: 'var(--space-4)' }} />

        <label style={labelStyle}>אימייל</label>
        <input type="email" dir="ltr" placeholder="name@email.com" value={email} onChange={e => setEmail(e.target.value)}
          style={{ ...inputStyle, marginBottom: 'var(--space-4)' }} />

        <label style={labelStyle}>תחביבים</label>
        <input type="text" dir="rtl" placeholder="ריצה, ציור, מוסיקה (מופרד בפסיקים)" value={hobbies} onChange={e => setHobbies(e.target.value)}
          style={{ ...inputStyle, marginBottom: 'var(--space-4)' }} />

        <label style={labelStyle}>הערות</label>
        <textarea dir="rtl" placeholder="פרטים נוספים..." rows={3} value={notes} onChange={e => setNotes(e.target.value)}
          style={{ ...inputStyle, resize: 'vertical', marginBottom: 'var(--space-6)' }} />

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: 1, padding: 13,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-primary)', color: 'var(--color-surface)',
              fontWeight: 700, fontSize: 'var(--font-size-body-min)',
              border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
              boxShadow: 'var(--shadow-btn-primary)',
            }}
          >{saving ? 'שומר...' : 'שמור שינויים'}</button>
          <button
            onClick={onClose}
            style={{
              padding: '13px 20px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
              fontWeight: 600, fontSize: 'var(--font-size-body-min)',
              cursor: 'pointer',
            }}
          >ביטול</button>
        </div>
      </div>
    </div>
  )
}

export default function ContactsPage() {
  const { user }   = useAuth()
  const [contacts,   setContacts]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [editTarget, setEditTarget] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  async function loadContacts() {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', user.id)
      .order('name')

    const enriched = (data ?? []).map((c, i) => ({
      ...c,
      days:        daysUntil(c.birthday),
      dateLabel:   birthdayLabel(c.birthday),
      initial:     (c.name || '?')[0],
      avatarBg:    AVATAR_SLOTS[i % AVATAR_SLOTS.length].bg,
      avatarColor: AVATAR_SLOTS[i % AVATAR_SLOTS.length].color,
    }))
    setContacts(enriched)
    setLoading(false)
  }

  useEffect(() => {
    if (!user) return
    loadContacts()
  }, [user])

  async function handleDelete(contactId) {
    setDeletingId(contactId)
    await supabase.from('contacts').delete().eq('id', contactId)
    setContacts(prev => prev.filter(c => c.id !== contactId))
    setDeletingId(null)
  }

  if (loading) {
    return (
      <main style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--space-8)', display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-body-min)' }}>טוען...</span>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--space-8)' }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
        <h1 style={{
          fontSize: 'var(--font-size-page-title-max)',
          fontWeight: 'var(--font-weight-page-title)',
          letterSpacing: 'var(--letter-spacing-page-title)',
          margin: 0, color: 'var(--color-text-primary)',
        }}>אנשי קשר</h1>
        <span style={{ fontSize: 'var(--font-size-label-max)', color: 'var(--color-text-muted)' }}>
          {contacts.length} סה״כ
        </span>
      </div>

      {contacts.length === 0 ? (
        <div style={{
          background: 'var(--color-surface)',
          border: '1px dashed var(--color-border-dashed)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-14) var(--space-6)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 36, marginBottom: 'var(--space-4)' }}>👤</div>
          <h3 style={{ fontSize: 'var(--font-size-card-title-max)', fontWeight: 700, margin: '0 0 var(--space-2)', color: 'var(--color-text-primary)' }}>
            אין אנשי קשר עדיין
          </h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-body-min)', margin: 0 }}>
            הוסף אנשי קשר מלוח הבקרה כדי שיופיעו כאן.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {contacts.map(c => (
            <div key={c.id} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
              background: 'var(--color-surface)',
              border: c.days === 0
                ? '1.5px solid var(--color-border-highlight)'
                : '1px solid var(--color-border-subtle)',
              borderRadius: 'var(--radius-md)',
              boxShadow: c.days === 0 ? 'var(--shadow-raised)' : 'var(--shadow-card)',
            }}>

              {/* Avatar */}
              <div style={{
                width: 44, height: 44, borderRadius: 'var(--radius-full)',
                background: c.avatarBg, color: c.avatarColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 'var(--font-size-card-title-min)', flexShrink: 0,
              }}>{c.initial}</div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span style={{ fontWeight: 700, fontSize: 'var(--font-size-card-title-min)', color: 'var(--color-text-primary)' }}>
                    {c.name}
                  </span>
                  {c.days === 0 && (
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      color: 'var(--color-accent-badge-text)',
                      background: 'var(--color-accent-badge-bg)',
                      padding: '3px var(--space-2)', borderRadius: 'var(--radius-full)',
                    }}>היום!</span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 3 }}>
                  {[
                    c.relationship,
                    c.dateLabel && `${c.dateLabel}`,
                    c.days > 0 && daysText(c.days),
                  ].filter(Boolean).join(' · ')}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexShrink: 0 }}>
                <button
                  onClick={() => setEditTarget(c)}
                  style={{
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-secondary)', color: 'var(--color-secondary-text)',
                    fontWeight: 600, fontSize: 13,
                    border: 'none', cursor: 'pointer',
                  }}
                >ערוך</button>
                <button
                  onClick={() => handleDelete(c.id)}
                  disabled={deletingId === c.id}
                  style={{
                    padding: 'var(--space-2) var(--space-3)',
                    borderRadius: 'var(--radius-sm)',
                    background: 'transparent',
                    border: '1px solid var(--color-border-error)',
                    color: 'var(--color-error)',
                    fontWeight: 600, fontSize: 13,
                    cursor: deletingId === c.id ? 'not-allowed' : 'pointer',
                    opacity: deletingId === c.id ? 0.6 : 1,
                  }}
                >{deletingId === c.id ? '...' : 'מחק'}</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editTarget && (
        <EditContactModal
          contact={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={() => {
            setEditTarget(null)
            loadContacts()
          }}
        />
      )}
    </main>
  )
}
