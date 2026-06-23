import { useState, useEffect, useRef } from 'react'
import * as XLSX from 'xlsx'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../contexts/LanguageContext'
import { getBirthdayLabel } from '../../translations/translations'
import BirthdayPicker from '../../components/BirthdayPicker/BirthdayPicker'
import AddContactModal from '../../components/AddContactModal/AddContactModal'

const AVATAR_SLOTS = [
  { bg: 'var(--avatar-1-bg)', color: 'var(--avatar-1-text)' },
  { bg: 'var(--avatar-2-bg)', color: 'var(--avatar-2-text)' },
  { bg: 'var(--avatar-3-bg)', color: 'var(--avatar-3-text)' },
  { bg: 'var(--avatar-4-bg)', color: 'var(--avatar-4-text)' },
  { bg: 'var(--avatar-5-bg)', color: 'var(--avatar-5-text)' },
]

const GENDERS = [
  { key: 'unknown', emoji: '❓' },
  { key: 'male',    emoji: '👨' },
  { key: 'female',  emoji: '👩' },
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

function formatDisplayDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function expandYear(yStr) {
  const n = parseInt(yStr, 10)
  if (yStr.length <= 2) return n < 30 ? 2000 + n : 1900 + n
  return n
}

function parseImportDate(val) {
  if (val == null || val === '') return ''
  if (typeof val === 'number') {
    const date = new Date(Math.round((val - 25569) * 86400 * 1000))
    const y = date.getUTCFullYear()
    const m = String(date.getUTCMonth() + 1).padStart(2, '0')
    const d = String(date.getUTCDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  const s = String(val).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  const match = s.match(/^(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4})$/)
  if (match) {
    const d = match[1].padStart(2, '0')
    const m = match[2].padStart(2, '0')
    const y = String(expandYear(match[3])).padStart(4, '0')
    return `${y}-${m}-${d}`
  }
  return ''
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

function EditableCell({ value, onChange, dir = 'rtl', placeholder = '', disabled = false }) {
  const [focused, setFocused] = useState(false)
  return (
    <td style={{ padding: '2px 4px', borderBottom: '1px solid var(--color-border-subtle)', verticalAlign: 'middle' }}>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        dir={dir}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', padding: '5px 7px',
          border: focused ? '1.5px solid var(--color-primary)' : '1.5px solid transparent',
          borderRadius: 4,
          background: focused ? 'var(--color-bg)' : 'transparent',
          fontSize: 13,
          color: disabled ? 'var(--color-text-faint)' : 'var(--color-text-primary)',
          fontFamily: 'inherit', outline: 'none',
          cursor: disabled ? 'default' : 'text',
          boxSizing: 'border-box',
        }}
      />
    </td>
  )
}

function ImportPreviewModal({ contacts: initialContacts, onClose, onConfirm, saving }) {
  const [rows, setRows] = useState(() =>
    initialContacts.map(c => ({
      name:            c.name || '',
      birthdayDisplay: formatDisplayDate(c.birthday),
      relationship:    c.relationship || '',
      phone:           c.phone || '',
      email:           c.email || '',
      hobbiesStr:      Array.isArray(c.hobbies) ? c.hobbies.join(', ') : (c.hobbies || ''),
      notes:           c.notes || '',
    }))
  )
  const [checked, setChecked] = useState(() => initialContacts.map(() => true))

  const checkedCount = checked.filter(Boolean).length
  const allChecked   = rows.length > 0 && checked.every(Boolean)
  const someChecked  = checked.some(Boolean) && !allChecked

  function updateRow(i, field, value) {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r))
  }

  function handleConfirm() {
    const selected = rows
      .filter((_, i) => checked[i])
      .map(r => ({
        name:         r.name.trim(),
        birthday:     parseImportDate(r.birthdayDisplay),
        relationship: r.relationship.trim() || null,
        phone:        r.phone.trim()        || null,
        email:        r.email.trim()        || null,
        hobbies:      r.hobbiesStr.trim()
          ? r.hobbiesStr.split(',').map(s => s.trim()).filter(Boolean)
          : null,
        notes:        r.notes.trim() || null,
      }))
      .filter(r => r.name)
    onConfirm(selected)
  }

  const thStyle = {
    padding: '8px 10px', fontWeight: 700, fontSize: 12,
    color: 'var(--color-text-muted)',
    borderBottom: '1px solid var(--color-border)',
    whiteSpace: 'nowrap', textAlign: 'right',
    background: 'var(--color-bg)',
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
          width: '100%', maxWidth: 900,
          maxHeight: '85vh', overflowY: 'auto',
          boxShadow: 'var(--shadow-modal)',
          direction: 'rtl',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <h2 style={{ fontSize: 'var(--font-size-page-title-min)', fontWeight: 800, margin: 0, color: 'var(--color-text-primary)' }}>
            תצוגה מקדימה – ייבוא אנשי קשר
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--color-text-muted)', lineHeight: 1, padding: 4 }}>✕</button>
        </div>

        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0 0 var(--space-4)' }}>
          נמצאו <strong style={{ color: 'var(--color-text-primary)' }}>{rows.length}</strong> אנשי קשר · לחץ על תא לעריכה לפני הייבוא
        </p>

        <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', direction: 'ltr', tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: 40 }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '14%' }} />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th style={{ ...thStyle, textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={el => { if (el) el.indeterminate = someChecked }}
                    onChange={() => setChecked(prev => prev.map(() => !allChecked))}
                    style={{ cursor: 'pointer', width: 15, height: 15 }}
                  />
                </th>
                <th style={thStyle}>שם</th>
                <th style={thStyle}>תאריך לידה</th>
                <th style={thStyle}>קרבה</th>
                <th style={thStyle}>טלפון</th>
                <th style={thStyle}>אימייל</th>
                <th style={thStyle}>תחביבים</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} style={{ opacity: checked[i] ? 1 : 0.45 }}>
                  <td style={{ textAlign: 'center', padding: '4px', borderBottom: '1px solid var(--color-border-subtle)', verticalAlign: 'middle' }}>
                    <input
                      type="checkbox"
                      checked={checked[i]}
                      onChange={() => setChecked(prev => prev.map((v, idx) => idx === i ? !v : v))}
                      style={{ cursor: 'pointer', width: 15, height: 15 }}
                    />
                  </td>
                  <EditableCell value={row.name}            onChange={v => updateRow(i, 'name', v)}            dir="rtl" placeholder="שם מלא"     disabled={!checked[i]} />
                  <EditableCell value={row.birthdayDisplay} onChange={v => updateRow(i, 'birthdayDisplay', v)} dir="ltr" placeholder="DD/MM/YYYY" disabled={!checked[i]} />
                  <EditableCell value={row.relationship}    onChange={v => updateRow(i, 'relationship', v)}    dir="rtl" placeholder="—"           disabled={!checked[i]} />
                  <EditableCell value={row.phone}           onChange={v => updateRow(i, 'phone', v)}           dir="ltr" placeholder="—"           disabled={!checked[i]} />
                  <EditableCell value={row.email}           onChange={v => updateRow(i, 'email', v)}           dir="ltr" placeholder="—"           disabled={!checked[i]} />
                  <EditableCell value={row.hobbiesStr}      onChange={v => updateRow(i, 'hobbiesStr', v)}      dir="rtl" placeholder="—"           disabled={!checked[i]} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
          <button
            onClick={handleConfirm}
            disabled={saving || checkedCount === 0}
            style={{
              flex: 1, padding: 13,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-primary)', color: 'var(--color-surface)',
              fontWeight: 700, fontSize: 'var(--font-size-body-min)',
              border: 'none',
              cursor: (saving || checkedCount === 0) ? 'not-allowed' : 'pointer',
              opacity: (saving || checkedCount === 0) ? 0.7 : 1,
              boxShadow: 'var(--shadow-btn-primary)',
            }}
          >{saving ? 'מייבא...' : `ייבא ${checkedCount} אנשי קשר`}</button>
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

function EditContactModal({ contact, onClose, onSuccess }) {
  const { t } = useLanguage()

  const [name,         setName]         = useState(contact.name || '')
  const [gender,       setGender]       = useState(contact.gender || 'unknown')
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

  const genderLabels = {
    unknown: t('contact.genderUnknown'),
    male:    t('contact.male'),
    female:  t('contact.female'),
  }

  async function handleSave() {
    setError('')
    if (!name.trim()) { setError(t('contact.errorName')); return }
    if (!birthday)    { setError(t('contact.errorBirthday')); return }

    setSaving(true)
    const { error: updateError } = await supabase
      .from('contacts')
      .update({
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
      .eq('id', contact.id)

    setSaving(false)
    if (updateError) {
      setError(t('contact.errorSave') + updateError.message)
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
            {t('contact.editTitle')}
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

        {/* Name */}
        <label style={labelStyle}>
          {t('contact.name')} <span style={{ color: 'var(--color-error)' }}>*</span>
        </label>
        <input type="text" dir="rtl" value={name} onChange={e => setName(e.target.value)}
          style={{ ...inputStyle, marginBottom: 'var(--space-3)' }} />

        {/* Gender */}
        <label style={{ ...labelStyle, marginBottom: 8 }}>{t('contact.gender')}</label>
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          {GENDERS.map(g => (
            <button
              key={g.key}
              type="button"
              onClick={() => setGender(g.key)}
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
          onChange={setBirthday}
          inputStyle={inputStyle}
          style={{ marginBottom: 'var(--space-4)' }}
        />

        {/* Relationship */}
        <label style={labelStyle}>{t('contact.relationship')}</label>
        <input type="text" dir="rtl" placeholder={t('contact.relPlaceholder')} value={relationship} onChange={e => setRelationship(e.target.value)}
          style={{ ...inputStyle, marginBottom: 'var(--space-4)' }} />

        {/* Phone */}
        <label style={labelStyle}>{t('contact.phone')}</label>
        <input type="tel" dir="ltr" placeholder={t('contact.phonePlaceholder')} value={phone} onChange={e => setPhone(e.target.value)}
          style={{ ...inputStyle, marginBottom: 'var(--space-4)' }} />

        {/* Email */}
        <label style={labelStyle}>{t('contact.email')}</label>
        <input type="email" dir="ltr" placeholder="name@email.com" value={email} onChange={e => setEmail(e.target.value)}
          style={{ ...inputStyle, marginBottom: 'var(--space-4)' }} />

        {/* Hobbies */}
        <label style={labelStyle}>{t('contact.hobbies')}</label>
        <input type="text" dir="rtl" placeholder={t('contact.hobbiesPlaceholder')} value={hobbies} onChange={e => setHobbies(e.target.value)}
          style={{ ...inputStyle, marginBottom: 'var(--space-4)' }} />

        {/* Notes */}
        <label style={labelStyle}>{t('contact.notes')}</label>
        <textarea dir="rtl" placeholder={t('contact.notesPlaceholder')} rows={3} value={notes} onChange={e => setNotes(e.target.value)}
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
          >{saving ? t('contact.saving') : t('contact.saveBtn')}</button>
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
          >{t('contact.cancel')}</button>
        </div>
      </div>
    </div>
  )
}

export default function ContactsPage() {
  const { user }   = useAuth()
  const { language, t } = useLanguage()

  const [contacts,      setContacts]      = useState([])
  const [loading,       setLoading]       = useState(true)
  const [editTarget,    setEditTarget]    = useState(null)
  const [deletingId,    setDeletingId]    = useState(null)
  const [showAddModal,  setShowAddModal]  = useState(false)
  const [importPreview, setImportPreview] = useState(null)
  const [importing,     setImporting]     = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const handler = () => setShowAddModal(true)
    window.addEventListener('openAddContact', handler)
    return () => window.removeEventListener('openAddContact', handler)
  }, [])

  function daysText(days) {
    if (days === 1) return t('dashboard.tomorrow')
    return t('dashboard.inDays', { n: days })
  }

  function handleExport() {
    const rows = contacts.map(c => ({
      'שם':         c.name,
      'תאריך לידה': formatDisplayDate(c.birthday),
      'קרבה':       c.relationship || '',
      'טלפון':      c.phone        || '',
      'אימייל':     c.email        || '',
      'תחביבים':    Array.isArray(c.hobbies) ? c.hobbies.join(', ') : (c.hobbies || ''),
      'הערות':      c.notes        || '',
    }))
    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'אנשי קשר')
    XLSX.writeFile(wb, 'אנשי-קשר-BirthdayAI.xlsx')
  }

  function handleTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([['שם', 'תאריך לידה', 'קרבה', 'טלפון', 'אימייל', 'תחביבים', 'הערות']])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'אנשי קשר')
    XLSX.writeFile(wb, 'תבנית-אנשי-קשר.xlsx')
  }

  function handleImportFile(e) {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onerror = err => console.error('FileReader error:', err)
    reader.onload = evt => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'array' })
        const ws = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(ws, { raw: true })

        const parsed = rows
          .map(row => ({
            name:         String(row['שם']         || '').trim(),
            birthday:     parseImportDate(row['תאריך לידה']),
            relationship: String(row['קרבה']       || '').trim() || null,
            phone:        String(row['טלפון']      || '').trim() || null,
            email:        String(row['אימייל']     || '').trim() || null,
            hobbies:      row['תחביבים']
              ? String(row['תחביבים']).split(',').map(s => s.trim()).filter(Boolean)
              : null,
            notes:        String(row['הערות']      || '').trim() || null,
          }))
          .filter(r => r.name)

        if (parsed.length === 0) {
          alert('לא נמצאו אנשי קשר. בדוק שכותרות העמודות תואמות בדיוק: שם, תאריך לידה, קרבה, טלפון, אימייל, תחביבים, הערות')
        }
        setImportPreview(parsed)
      } catch (err) {
        console.error('XLSX parse error:', err)
        alert('שגיאה בקריאת הקובץ: ' + err.message)
      }
    }
    reader.readAsArrayBuffer(file)
    e.target.value = ''
  }

  async function handleConfirmImport(selectedRows) {
    if (!selectedRows?.length) return
    setImporting(true)
    const { error } = await supabase.from('contacts').insert(
      selectedRows.map(c => ({ ...c, user_id: user.id }))
    )
    setImporting(false)
    if (!error) {
      setImportPreview(null)
      loadContacts()
    }
  }

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
      dateLabel:   getBirthdayLabel(c.birthday, language),
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
  }, [user, language])

  async function handleDelete(contactId) {
    setDeletingId(contactId)
    await supabase.from('contacts').delete().eq('id', contactId)
    setContacts(prev => prev.filter(c => c.id !== contactId))
    setDeletingId(null)
  }

  if (loading) {
    return (
      <main style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--space-8)', display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-body-min)' }}>{t('contacts.loading')}</span>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: 'var(--space-8)' }}>

      <div style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
          <h1 style={{
            fontSize: 'var(--font-size-page-title-max)',
            fontWeight: 'var(--font-weight-page-title)',
            letterSpacing: 'var(--letter-spacing-page-title)',
            margin: 0, color: 'var(--color-text-primary)',
          }}>{t('contacts.title')}</h1>
          <span style={{ fontSize: 'var(--font-size-label-max)', color: 'var(--color-text-muted)' }}>
            {t('contacts.total', { n: contacts.length })}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <button
            onClick={handleTemplate}
            style={{
              padding: '8px var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              background: 'transparent',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}
          >{t('contacts.downloadTemplate')}</button>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '8px var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              background: 'transparent',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
              fontWeight: 600, fontSize: 13, cursor: 'pointer',
            }}
          >{t('contacts.importExcel')}</button>
          <button
            onClick={handleExport}
            disabled={contacts.length === 0}
            style={{
              padding: '8px var(--space-3)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-secondary)',
              border: 'none',
              color: 'var(--color-secondary-text)',
              fontWeight: 600, fontSize: 13,
              cursor: contacts.length === 0 ? 'not-allowed' : 'pointer',
              opacity: contacts.length === 0 ? 0.5 : 1,
            }}
          >{t('contacts.exportExcel')}</button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
            onChange={handleImportFile}
          />
        </div>
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
            {t('contacts.noContacts')}
          </h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-body-min)', margin: 0 }}>
            {t('contacts.noContactsDesc')}
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
                    }}>{t('dashboard.today')}</span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 3 }}>
                  {[
                    c.relationship,
                    c.dateLabel,
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
                >{t('contacts.edit')}</button>
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
                >{deletingId === c.id ? '...' : t('contacts.delete')}</button>
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

      {showAddModal && (
        <AddContactModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false)
            loadContacts()
          }}
        />
      )}

      {importPreview && (
        <ImportPreviewModal
          contacts={importPreview}
          onClose={() => setImportPreview(null)}
          onConfirm={handleConfirmImport}
          saving={importing}
        />
      )}
    </main>
  )
}
