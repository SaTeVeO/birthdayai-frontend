import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../contexts/LanguageContext'
import BirthdayPicker from '../BirthdayPicker/BirthdayPicker'

const GENDERS = [
  { key: 'unknown', emoji: '❓' },
  { key: 'male',    emoji: '👨' },
  { key: 'female',  emoji: '👩' },
]

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
  const { t } = useLanguage()

  const [name,         setName]         = useState('')
  const [gender,       setGender]       = useState('unknown')
  const [birthday,     setBirthday]     = useState('')
  const [relationship, setRelationship] = useState('')
  const [phone,        setPhone]        = useState('')
  const [email,        setEmail]        = useState('')
  const [hobbies,      setHobbies]      = useState('')
  const [notes,        setNotes]        = useState('')
  const [error,        setError]        = useState('')
  const [saving,       setSaving]       = useState(false)

  // Restore draft on mount (handles iPhone app-switch resets)
  useEffect(() => {
    const draft = localStorage.getItem('draft_contact')
    if (draft) {
      try {
        const data = JSON.parse(draft)
        setName(data.name || '')
        setBirthday(data.birthday || '')
        setRelationship(data.relationship || '')
        setPhone(data.phone || '')
        setEmail(data.email || '')
        setHobbies(data.hobbies || '')
        setNotes(data.notes || '')
        setGender(data.gender || 'unknown')
      } catch {}
    }
  }, [])

  function saveDraft({ name, birthday, relationship, phone, email, hobbies, notes, gender }) {
    localStorage.setItem('draft_contact', JSON.stringify({ name, birthday, relationship, phone, email, hobbies, notes, gender }))
  }

  async function handleSubmit() {
    setError('')
    if (!name.trim()) { setError(t('contact.errorName'));     return }
    if (!birthday)    { setError(t('contact.errorBirthday')); return }

    setSaving(true)
    const { error: insertError } = await supabase
      .from('contacts')
      .insert({
        user_id:      user.id,
        name:         name.trim(),
        gender,
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
      setError(t('contact.errorSave') + insertError.message)
    } else {
      localStorage.removeItem('draft_contact')
      onSuccess()
    }
  }

  const genderLabels = {
    unknown: t('contact.genderUnknown'),
    male:    t('contact.male'),
    female:  t('contact.female'),
  }

  return (
    <div
      onClick={() => { localStorage.removeItem('draft_contact'); onClose() }}
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
            {t('contact.addTitle')}
          </h2>
          <button
            onClick={() => { localStorage.removeItem('draft_contact'); onClose() }}
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
          {t('contact.name')} <span style={{ color: 'var(--color-error)' }}>*</span>
        </label>
        <input
          type="text" dir="rtl" placeholder={t('contact.namePlaceholder')}
          value={name} onChange={e => { setName(e.target.value); saveDraft({ name: e.target.value, birthday, relationship, phone, email, hobbies, notes, gender }) }}
          style={{ ...inputStyle, marginBottom: 'var(--space-3)' }}
        />

        {/* Gender */}
        <label style={{ ...labelStyle, marginBottom: 8 }}>{t('contact.gender')}</label>
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          {GENDERS.map(g => (
            <button
              key={g.key}
              type="button"
              onClick={() => { setGender(g.key); saveDraft({ name, birthday, relationship, phone, email, hobbies, notes, gender: g.key }) }}
              style={{
                flex: 1, padding: '8px 4px',
                borderRadius: 'var(--radius-sm)',
                border: gender === g.key ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                background: gender === g.key ? 'var(--color-secondary)' : 'transparent',
                color: gender === g.key ? 'var(--color-secondary-text)' : 'var(--color-text-muted)',
                fontWeight: gender === g.key ? 700 : 600,
                fontSize: 13, cursor: 'pointer',
              }}
            >{g.emoji} {genderLabels[g.key]}</button>
          ))}
        </div>

        {/* Birthday */}
        <label style={labelStyle}>
          {t('contact.birthday')} <span style={{ color: 'var(--color-error)' }}>*</span>
        </label>
        <BirthdayPicker
          value={birthday}
          onChange={val => { setBirthday(val); saveDraft({ name, birthday: val, relationship, phone, email, hobbies, notes, gender }) }}
          inputStyle={inputStyle}
          style={{ marginBottom: 'var(--space-4)' }}
        />

        {/* Relationship */}
        <label style={labelStyle}>{t('contact.relationship')}</label>
        <input
          type="text" dir="rtl" placeholder={t('contact.relPlaceholder')}
          value={relationship} onChange={e => { setRelationship(e.target.value); saveDraft({ name, birthday, relationship: e.target.value, phone, email, hobbies, notes, gender }) }}
          style={{ ...inputStyle, marginBottom: 'var(--space-4)' }}
        />

        {/* Phone */}
        <label style={labelStyle}>{t('contact.phone')}</label>
        <input
          type="tel" dir="ltr" placeholder={t('contact.phonePlaceholder')}
          value={phone} onChange={e => { setPhone(e.target.value); saveDraft({ name, birthday, relationship, phone: e.target.value, email, hobbies, notes, gender }) }}
          style={{ ...inputStyle, marginBottom: 'var(--space-4)' }}
        />

        {/* Email */}
        <label style={labelStyle}>{t('contact.email')}</label>
        <input
          type="email" dir="ltr" placeholder="name@email.com"
          value={email} onChange={e => { setEmail(e.target.value); saveDraft({ name, birthday, relationship, phone, email: e.target.value, hobbies, notes, gender }) }}
          style={{ ...inputStyle, marginBottom: 'var(--space-4)' }}
        />

        {/* Hobbies */}
        <label style={labelStyle}>{t('contact.hobbies')}</label>
        <input
          type="text" dir="rtl" placeholder={t('contact.hobbiesPlaceholder')}
          value={hobbies} onChange={e => { setHobbies(e.target.value); saveDraft({ name, birthday, relationship, phone, email, hobbies: e.target.value, notes, gender }) }}
          style={{ ...inputStyle, marginBottom: 'var(--space-4)' }}
        />

        {/* Notes */}
        <label style={labelStyle}>{t('contact.notes')}</label>
        <textarea
          dir="rtl" placeholder={t('contact.notesPlaceholder')} rows={3}
          value={notes} onChange={e => { setNotes(e.target.value); saveDraft({ name, birthday, relationship, phone, email, hobbies, notes: e.target.value, gender }) }}
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
          >{saving ? t('contact.saving') : t('contact.addBtn')}</button>
          <button
            onClick={() => { localStorage.removeItem('draft_contact'); onClose() }}
            style={{
              padding: '13px 20px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
              fontWeight: 600, fontSize: 'var(--font-size-body-min)',
              cursor: 'pointer',
            }}
          >{t('contact.cancel')}</button>
        </div>
      </div>
    </div>
  )
}
