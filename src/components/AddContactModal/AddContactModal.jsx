import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import BirthdayPicker from '../BirthdayPicker/BirthdayPicker'

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

export default function AddContactModal({ onClose, onSuccess }) {
  const { user } = useAuth()

  const [name,         setName]         = useState('')
  const [birthday,     setBirthday]     = useState('')
  const [relationship, setRelationship] = useState('')
  const [phone,        setPhone]        = useState('')
  const [email,        setEmail]        = useState('')
  const [hobbies,      setHobbies]      = useState('')
  const [notes,        setNotes]        = useState('')
  const [error,        setError]        = useState('')
  const [saving,       setSaving]       = useState(false)

  async function handleSubmit() {
    setError('')
    if (!name.trim()) { setError('נא להזין שם מלא'); return }
    if (!birthday)    { setError('נא להזין תאריך לידה'); return }

    setSaving(true)
    const { error: insertError } = await supabase
      .from('contacts')
      .insert({
        user_id:      user.id,
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

    setSaving(false)
    if (insertError) {
      setError('שגיאה בהוספת איש קשר: ' + insertError.message)
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
        zIndex: 100,
        padding: 'var(--space-4)',
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
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontSize: 'var(--font-size-page-title-min)', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>
            הוסף איש קשר
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--color-text-muted)', lineHeight: 1, padding: 4 }}
          >✕</button>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
            background: 'var(--color-error-bg)',
            border: '1px solid var(--color-border-error)',
            color: 'var(--color-error-text)',
            padding: '10px 12px', borderRadius: 'var(--radius-sm)',
            fontSize: 13, fontWeight: 600, marginBottom: 'var(--space-4)',
          }}>
            <span style={{
              width: 16, height: 16, borderRadius: '50%',
              background: 'var(--color-error)', color: 'var(--color-surface)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, flexShrink: 0,
            }}>!</span>
            {error}
          </div>
        )}

        {/* Name */}
        <label style={labelStyle}>
          שם מלא <span style={{ color: 'var(--color-error)' }}>*</span>
        </label>
        <input
          type="text" dir="rtl" placeholder="ישראל ישראלי"
          value={name} onChange={e => setName(e.target.value)}
          style={{ ...inputStyle, marginBottom: 'var(--space-4)' }}
        />

        {/* Birthday */}
        <label style={labelStyle}>
          תאריך לידה <span style={{ color: 'var(--color-error)' }}>*</span>
        </label>
        <BirthdayPicker
          value={birthday}
          onChange={setBirthday}
          inputStyle={inputStyle}
          style={{ marginBottom: 'var(--space-4)' }}
        />

        {/* Relationship */}
        <label style={labelStyle}>קשר</label>
        <input
          type="text" dir="rtl" placeholder="חבר, אחות, עמית לעבודה..."
          value={relationship} onChange={e => setRelationship(e.target.value)}
          style={{ ...inputStyle, marginBottom: 'var(--space-4)' }}
        />

        {/* Phone */}
        <label style={labelStyle}>טלפון</label>
        <input
          type="tel" dir="ltr" placeholder="050-1234567"
          value={phone} onChange={e => setPhone(e.target.value)}
          style={{ ...inputStyle, marginBottom: 'var(--space-4)' }}
        />

        {/* Email */}
        <label style={labelStyle}>אימייל</label>
        <input
          type="email" dir="ltr" placeholder="name@email.com"
          value={email} onChange={e => setEmail(e.target.value)}
          style={{ ...inputStyle, marginBottom: 'var(--space-4)' }}
        />

        {/* Hobbies */}
        <label style={labelStyle}>תחביבים</label>
        <input
          type="text" dir="rtl" placeholder="ריצה, ציור, מוסיקה (מופרד בפסיקים)"
          value={hobbies} onChange={e => setHobbies(e.target.value)}
          style={{ ...inputStyle, marginBottom: 'var(--space-4)' }}
        />

        {/* Notes */}
        <label style={labelStyle}>הערות</label>
        <textarea
          dir="rtl" placeholder="פרטים נוספים..." rows={3}
          value={notes} onChange={e => setNotes(e.target.value)}
          style={{ ...inputStyle, resize: 'vertical', marginBottom: 'var(--space-6)' }}
        />

        {/* Actions */}
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button
            onClick={handleSubmit}
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
          >{saving ? 'שומר...' : 'הוסף איש קשר'}</button>
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
