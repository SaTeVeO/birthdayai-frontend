import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useLanguage } from '../../contexts/LanguageContext'
import { generateGreeting } from '../../lib/openai'

const LANGUAGES = [
  { key: 'he', flag: '🇮🇱', label: 'עברית'  },
  { key: 'en', flag: '🇺🇸', label: 'English' },
  { key: 'ru', flag: '🇷🇺', label: 'Русский' },
]

const STYLES = [
  { key: 'warm',   emoji: '🤗' },
  { key: 'funny',  emoji: '😄' },
  { key: 'formal', emoji: '👔' },
  { key: 'short',  emoji: '✨' },
  { key: 'poetic', emoji: '🌹' },
]

const LENGTHS = [
  { key: 'short',  emoji: '📝', words: 50,  maxChars: 200 },
  { key: 'medium', emoji: '📄', words: 100, maxChars: 400 },
  { key: 'long',   emoji: '📃', words: 200, maxChars: 800 },
]

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
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { t }    = useLanguage()
  const contact  = location.state?.contact

  const [text,             setText]           = useState('')
  const [textSource,       setTextSource]     = useState(null)
  const [autoSaveStatus,   setAutoSave]       = useState('idle')
  const [copied,           setCopied]         = useState(false)
  const [success,          setSuccess]        = useState('')
  const [actionError,      setActionError]    = useState('')
  const [existingId,       setExistingId]     = useState(null)
  const [selectedChannel,  setSelectedChannel] = useState('whatsapp')
  const [style,            setStyle]          = useState('warm')
  const [greetingLang,     setGreetingLang]   = useState('he')
  const [length,           setLength]         = useState('medium')
  const [aiLoading,        setAiLoading]      = useState(true)
  const [aiError,          setAiError]        = useState('')
  const [sigMode,          setSigMode]        = useState('single') // 'single' | 'couple'
  const [includeSignature, setIncludeSign]    = useState(true)
  const [partnerName,      setPartnerName]    = useState('')

  const langChangedRef    = useRef(false)
  const sigChangedRef     = useRef(false)
  const hasGenerated      = useRef(false)
  const debounceRef       = useRef(null)
  const partnerDebounceRef = useRef(null)
  const mountedRef        = useRef(true)
  const senderNameRef     = useRef('')
  const senderGenderRef   = useRef('male')

  useEffect(() => () => {
    mountedRef.current = false
    if (debounceRef.current)        clearTimeout(debounceRef.current)
    if (partnerDebounceRef.current) clearTimeout(partnerDebounceRef.current)
  }, [])

  const lengthEntry = LENGTHS.find(l => l.key === length) ?? LENGTHS[1]
  const MAX = lengthEntry.maxChars

  const styleLabels = {
    warm:   t('editGreeting.styleWarm'),
    funny:  t('editGreeting.styleFunny'),
    formal: t('editGreeting.styleFormal'),
    short:  t('editGreeting.styleShort'),
    poetic: t('editGreeting.stylePoetic'),
  }

  const lengthLabels = {
    short:  t('editGreeting.lengthShort'),
    medium: t('editGreeting.lengthMedium'),
    long:   t('editGreeting.lengthLong'),
  }

  // ── Save draft: check then update or insert ───────────────────
  async function saveGreeting(greetingText, channelOverride) {
    if (!user?.id || !contact?.id) return
    const ch = channelOverride ?? selectedChannel
    if (mountedRef.current) setAutoSave('saving')

    const { data: existing } = await supabase
      .from('greetings')
      .select('id')
      .eq('user_id', user.id)
      .eq('contact_id', contact.id)
      .eq('status', 'draft')
      .maybeSingle()

    if (existing?.id) {
      const { error } = await supabase
        .from('greetings')
        .update({ greeting_text: greetingText, channel: ch })
        .eq('id', existing.id)
      console.log('updated draft:', existing.id, error)
      if (!mountedRef.current) return
      setExistingId(existing.id)
    } else {
      const { data, error } = await supabase
        .from('greetings')
        .insert({
          user_id:       user.id,
          contact_id:    contact.id,
          greeting_text: greetingText,
          channel:       ch,
          status:        'draft',
        })
        .select()
        .single()
      console.log('inserted new draft:', data, error)
      if (!mountedRef.current) return
      if (data?.id) setExistingId(data.id)
    }

    if (!mountedRef.current) return
    setTextSource('draft')
    setAutoSave('saved')
    setTimeout(() => {
      if (mountedRef.current) setAutoSave(s => s === 'saved' ? 'idle' : s)
    }, 3000)
  }

  // ── Debounced save triggered by textarea edits ────────────────
  function handleTextChange(e) {
    const newText = e.target.value
    setText(newText)
    setAutoSave('idle')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      saveGreeting(newText)
    }, 1500)
  }

  // ── Signature mode → { type, name, partnerName? } ───────────
  function buildSignatureMode() {
    if (sigMode === 'couple') {
      return { type: 'couple', name: senderNameRef.current, partnerName }
    }
    if (!includeSignature) return { type: 'none' }
    return { type: 'single', name: senderNameRef.current }
  }

  // ── Signature toggle (mode or checkbox) → regenerate ─────────
  useEffect(() => {
    if (!sigChangedRef.current) { sigChangedRef.current = true; return }
    if (!contact?.id) return
    setAiLoading(true)
    setAiError('')
    let cancelled = false
    generateGreeting(contact, style, greetingLang, length, buildSignatureMode(), selectedChannel, senderGenderRef.current)
      .then(async result => {
        if (cancelled) return
        setText(result); setTextSource('new')
        await saveGreeting(result)
      })
      .catch(() => { if (!cancelled) setAiError(t('editGreeting.errorRetry')) })
      .finally(() => { if (!cancelled) setAiLoading(false) })
    return () => { cancelled = true }
  }, [sigMode, includeSignature])

  // ── Partner name → debounced regenerate ──────────────────────
  useEffect(() => {
    if (sigMode !== 'couple' || !sigChangedRef.current) return
    if (partnerDebounceRef.current) clearTimeout(partnerDebounceRef.current)
    partnerDebounceRef.current = setTimeout(() => {
      if (!contact?.id || !mountedRef.current) return
      setAiLoading(true)
      setAiError('')
      generateGreeting(contact, style, greetingLang, length, buildSignatureMode(), selectedChannel, senderGenderRef.current)
        .then(async result => {
          if (!mountedRef.current) return
          setText(result); setTextSource('new')
          await saveGreeting(result)
        })
        .catch(() => { if (mountedRef.current) setAiError(t('editGreeting.errorRetry')) })
        .finally(() => { if (mountedRef.current) setAiLoading(false) })
    }, 1500)
    return () => { if (partnerDebounceRef.current) clearTimeout(partnerDebounceRef.current) }
  }, [partnerName])

  // ── Redirect if opened without a contact ─────────────────────
  useEffect(() => {
    if (!contact) navigate('/dashboard', { replace: true })
  }, [])

  // ── Init: load existing draft OR generate once ────────────────
  useEffect(() => {
    if (!contact?.id || !user?.id) return
    let cancelled = false

    console.log('=== EditGreeting loaded ===')
    console.log('contact.id:', contact?.id)
    console.log('user.id:', user?.id)

    async function init() {
      // Fetch sender's profile name and gender once
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, preferred_channel, gender')
        .eq('user_id', user.id)
        .maybeSingle()
      senderNameRef.current   = profile?.name || user?.email?.split('@')[0] || ''
      senderGenderRef.current = profile?.gender || 'male'
      if (profile?.preferred_channel) setSelectedChannel(profile.preferred_channel)

      const { data: existingDraft, error } = await supabase
        .from('greetings')
        .select('*')
        .eq('contact_id', contact.id)
        .eq('user_id', user.id)
        .eq('status', 'draft')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      console.log('existing draft query result:', existingDraft)
      console.log('query error:', error)

      if (cancelled) return

      const draft = existingDraft
      if (draft) {
        // Draft found → restore it, stop here (no OpenAI call)
        setExistingId(draft.id)
        setText(draft.greeting_text)
        setTextSource('draft')
        setAiLoading(false)
        return
      }

      // No draft → generate exactly once then auto-save
      if (hasGenerated.current) {
        // Strict Mode second run: first run's generation is already in flight
        if (!cancelled) setAiLoading(false)
        return
      }
      hasGenerated.current = true

      setAiError('')
      try {
        const result = await generateGreeting(contact, 'warm', 'he', 'medium', buildSignatureMode(), selectedChannel, senderGenderRef.current)
        if (cancelled) return
        setText(result)
        setTextSource('new')
        await saveGreeting(result, 'whatsapp')
      } catch (err) {
        if (!cancelled) {
          console.error('AI auto-generate error:', err)
          setAiError(t('editGreeting.errorGenerate'))
          setText(defaultGreeting(contact))
          setTextSource('new')
        }
      } finally {
        if (!cancelled) setAiLoading(false)
      }
    }

    init()
    return () => { cancelled = true }
  }, [contact?.id, user?.id])

  // ── Language change → regenerate + auto-save ─────────────────
  useEffect(() => {
    if (!langChangedRef.current) { langChangedRef.current = true; return }
    setAiLoading(true)
    setAiError('')
    let cancelled = false
    generateGreeting(contact, style, greetingLang, length, buildSignatureMode(), selectedChannel, senderGenderRef.current)
      .then(async result => {
        if (cancelled) return
        setText(result)
        setTextSource('new')
        await saveGreeting(result)
      })
      .catch(err => {
        if (!cancelled) {
          console.error('Language change AI error:', err)
          setAiError(t('editGreeting.errorRetry'))
        }
      })
      .finally(() => { if (!cancelled) setAiLoading(false) })
    return () => { cancelled = true }
  }, [greetingLang])

  // ── Manual regenerate button ──────────────────────────────────
  async function handleGenerate() {
    setAiLoading(true)
    setAiError('')
    try {
      const result = await generateGreeting(contact, style, greetingLang, length, buildSignatureMode(), selectedChannel, senderGenderRef.current)
      setText(result)
      setTextSource('new')
      await saveGreeting(result)
    } catch (err) {
      console.error('AI generate error:', err)
      setAiError(t('editGreeting.errorRetry'))
    } finally {
      setAiLoading(false)
    }
  }

  if (!contact) return null

  // ── Mark draft as sent (shared helper) ───────────────────────
  async function markSent(sentChannel) {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const update = { status: 'sent', sent_at: new Date().toISOString(), channel: sentChannel, greeting_text: text }
    if (existingId) {
      await supabase.from('greetings').update(update).eq('id', existingId)
    } else {
      await supabase.from('greetings').update(update)
        .eq('contact_id', contact.id).eq('user_id', user.id).eq('status', 'draft')
    }
  }

  // ── WhatsApp ──────────────────────────────────────────────────
  async function handleSendWhatsApp() {
    const phone = contact.phone?.replace(/[^0-9]/g, '')
    if (!phone) return
    let intlPhone = phone.startsWith('0') ? '972' + phone.slice(1) : phone
    window.open(`https://wa.me/${intlPhone}?text=${encodeURIComponent(text)}`, '_blank')
    await markSent('whatsapp')
    setSuccess('הברכה נשלחה בוואטסאפ!')
    setTimeout(() => navigate('/dashboard'), 2000)
  }

  // ── Email ─────────────────────────────────────────────────────
  async function handleSendEmail() {
    const email = contact.email
    if (!email) return
    const subject = encodeURIComponent(`יום הולדת שמח ${contact.name}!`)
    window.open(`mailto:${email}?subject=${subject}&body=${encodeURIComponent(text)}`, '_blank')
    await markSent('email')
    setSuccess('נפתח המייל שלך עם הברכה!')
    setTimeout(() => navigate('/dashboard'), 2000)
  }

  // ── Copy ──────────────────────────────────────────────────────
  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const firstName     = contact.name?.split(' ')[0] ?? contact.name
  const over          = text.length > MAX
  const isHebrew      = greetingLang === 'he' || greetingLang === 'hebrew' || greetingLang === 'עברית'
  const textDirection = isHebrew ? 'rtl' : 'ltr'
  const textAlign     = isHebrew ? 'right' : 'left'
  console.log('language:', greetingLang, 'direction:', textDirection)
  const hasPhone  = !!contact.phone?.replace(/[^0-9]/g, '')
  const hasEmail  = !!contact.email

  const hobbies = Array.isArray(contact.hobbies) ? contact.hobbies : []

  return (
    <main className="edit-main" style={{ maxWidth: 680, margin: '0 auto', padding: 'var(--space-8)' }}>

      {/* ── Success / error banners ──────────────────────── */}
      {success && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
          background: 'var(--color-success-bg)', border: '1px solid var(--color-border-success)',
          color: 'var(--color-success-text)',
          padding: '14px var(--space-4)', borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-5)',
        }}>
          <span style={{
            width: 22, height: 22, borderRadius: '50%', background: 'var(--color-success)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-surface)', fontSize: 13, flexShrink: 0,
          }}>✓</span>
          <span style={{ fontWeight: 600, fontSize: 'var(--font-size-label-max)' }}>{success}</span>
        </div>
      )}
      {actionError && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
          background: 'var(--color-error-bg)', border: '1px solid var(--color-border-error)',
          color: 'var(--color-error-text)',
          padding: '14px var(--space-4)', borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-5)',
        }}>
          <span style={{ fontWeight: 600, fontSize: 'var(--font-size-label-max)' }}>{actionError}</span>
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
            {[
              contact.relationship,
              contact.dateLabel && t('editGreeting.birthdayOn', { date: contact.dateLabel }),
            ].filter(Boolean).join(' · ')}
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

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <span style={{ fontWeight: 700, fontSize: 'var(--font-size-body-min)' }}>{t('editGreeting.heading')}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {textSource === 'draft' && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 'var(--font-size-label-min)', fontWeight: 700,
                color: '#166534', background: '#dcfce7',
                padding: '5px 10px', borderRadius: 'var(--radius-full)',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                {t('editGreeting.savedDraft')}
              </span>
            )}
            {textSource === 'new' && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 'var(--font-size-label-min)', fontWeight: 700,
                color: 'var(--color-secondary-text)', background: 'var(--color-secondary)',
                padding: '5px 10px', borderRadius: 'var(--radius-full)',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-primary)' }} />
                {t('editGreeting.newGreeting')}
              </span>
            )}
          </div>
        </div>

        {/* Language selector */}
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6 }}>{t('editGreeting.language')}</div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {LANGUAGES.map(lang => (
              <button
                key={lang.key}
                onClick={() => setGreetingLang(lang.key)}
                style={{
                  padding: '6px 14px', borderRadius: 'var(--radius-full)',
                  border: greetingLang === lang.key ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                  background: greetingLang === lang.key ? 'var(--color-secondary)' : 'transparent',
                  color: greetingLang === lang.key ? 'var(--color-secondary-text)' : 'var(--color-text-muted)',
                  fontWeight: greetingLang === lang.key ? 700 : 600,
                  fontSize: 13, cursor: 'pointer',
                }}
              >{lang.flag} {lang.label}</button>
            ))}
          </div>
        </div>

        {/* Style selector */}
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6 }}>{t('editGreeting.style')}</div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {STYLES.map(s => (
              <button
                key={s.key}
                onClick={() => setStyle(s.key)}
                style={{
                  padding: '6px 12px', borderRadius: 'var(--radius-full)',
                  border: style === s.key ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                  background: style === s.key ? 'var(--color-secondary)' : 'transparent',
                  color: style === s.key ? 'var(--color-secondary-text)' : 'var(--color-text-muted)',
                  fontWeight: style === s.key ? 700 : 600,
                  fontSize: 13, cursor: 'pointer',
                }}
              >{s.emoji} {styleLabels[s.key]}</button>
            ))}
          </div>
        </div>

        {/* Length selector */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6 }}>{t('editGreeting.length')}</div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {LENGTHS.map(l => (
              <button
                key={l.key}
                onClick={() => setLength(l.key)}
                style={{
                  padding: '6px 14px', borderRadius: 'var(--radius-full)',
                  border: length === l.key ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                  background: length === l.key ? 'var(--color-secondary)' : 'transparent',
                  color: length === l.key ? 'var(--color-secondary-text)' : 'var(--color-text-muted)',
                  fontWeight: length === l.key ? 700 : 600,
                  fontSize: 13, cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                }}
              >
                <span>{l.emoji} {lengthLabels[l.key]}</span>
                <span style={{ fontSize: 10, opacity: 0.75 }}>{t('editGreeting.wordsUpTo', { n: l.words })}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {aiError && (
          <div style={{
            background: 'var(--color-error-bg)',
            border: '1px solid var(--color-border-error)',
            color: 'var(--color-error-text)',
            padding: '10px 12px', borderRadius: 'var(--radius-sm)',
            fontSize: 13, fontWeight: 600, marginBottom: 'var(--space-3)',
          }}>{aiError}</div>
        )}

        {/* Textarea or spinner */}
        {aiLoading ? (
          <div style={{
            minHeight: 150, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 12,
            borderRadius: 8, border: '1px solid var(--color-border)',
            background: 'var(--color-bg)',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              border: '3px solid var(--color-border)',
              borderTopColor: 'var(--color-primary)',
              animation: 'spin 0.8s linear infinite',
            }} />
            <span style={{ fontSize: 14, color: 'var(--color-text-muted)', fontWeight: 600 }}>
              {t('editGreeting.generating')}
            </span>
          </div>
        ) : (
          <textarea
            value={text}
            onChange={handleTextChange}
            dir={isHebrew ? 'rtl' : 'ltr'}
            className={isHebrew ? 'greeting-rtl' : 'greeting-ltr'}
            style={{
              width: '100%',
              minHeight: '150px',
              padding: '14px',
              fontSize: '15px',
              lineHeight: '1.6',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)',
              background: 'var(--color-surface)',
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
              direction: isHebrew ? 'rtl' : 'ltr',
              textAlign: isHebrew ? 'right' : 'left',
              unicodeBidi: 'isolate',
            }}
          />
        )}

        {/* Bottom row: regenerate + char counter + auto-save status */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--space-3)' }}>
          <button
            onClick={handleGenerate}
            disabled={aiLoading}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
              padding: '9px var(--space-4)', borderRadius: 'var(--radius-sm)',
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              color: 'var(--color-text-body)', fontWeight: 600, fontSize: 'var(--font-size-label-max)',
              cursor: aiLoading ? 'not-allowed' : 'pointer',
              opacity: aiLoading ? 0.6 : 1,
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-primary)' }} />
            {t('editGreeting.regenerate')}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Auto-save status */}
            {autoSaveStatus === 'saving' && (
              <span style={{ fontSize: 12, color: 'var(--color-text-faint)', fontWeight: 500 }}>
                {t('editGreeting.autoSaving')}
              </span>
            )}
            {autoSaveStatus === 'saved' && (
              <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>
                {t('editGreeting.autoSaved')}
              </span>
            )}
            {/* Char counter */}
            <span style={{
              fontSize: 'var(--font-size-label-min)', fontWeight: 600,
              color: over ? 'var(--color-error)' : 'var(--color-text-faint)',
            }}>{text.length}/{MAX}</span>
          </div>
        </div>
      </div>

      {/* ── Signature settings ───────────────────────────── */}
      <div style={{
        background: 'var(--color-surface)', border: '1px solid var(--color-border-subtle)',
        borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)',
        marginBottom: 'var(--space-4)', boxShadow: 'var(--shadow-card)',
      }}>
        <div style={{ fontWeight: 700, fontSize: 'var(--font-size-label-max)', marginBottom: 12 }}>חתימה</div>

        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {[
            { key: 'single', label: 'חתימה בודדת' },
            { key: 'couple', label: 'חתימה זוגית' },
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => setSigMode(opt.key)}
              style={{
                padding: '7px 16px', borderRadius: 'var(--radius-full)',
                border: sigMode === opt.key ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                background: sigMode === opt.key ? 'var(--color-secondary)' : 'transparent',
                color: sigMode === opt.key ? 'var(--color-secondary-text)' : 'var(--color-text-muted)',
                fontWeight: sigMode === opt.key ? 700 : 600,
                fontSize: 13, cursor: 'pointer',
              }}
            >{opt.label}</button>
          ))}
        </div>

        {/* Single mode: checkbox */}
        {sigMode === 'single' && (
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 'var(--font-size-label-max)', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={includeSignature}
              onChange={e => setIncludeSign(e.target.checked)}
              style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--color-primary)' }}
            />
            הוסף חתימה
          </label>
        )}

        {/* Couple mode: partner name input */}
        {sigMode === 'couple' && (
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
              שם בן/בת הזוג
            </label>
            <input
              type="text"
              dir="rtl"
              value={partnerName}
              onChange={e => setPartnerName(e.target.value)}
              placeholder="לדוגמה: מיכל"
              style={{
                padding: '9px 12px', borderRadius: 'var(--radius-sm)',
                border: '1.5px solid var(--color-border)',
                fontSize: 'var(--font-size-label-max)', outline: 'none',
                background: 'var(--color-surface)', color: 'var(--color-text-primary)',
                width: 200,
              }}
            />
            {senderNameRef.current && partnerName && (
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 6 }}>
                חתימה: {senderNameRef.current} ו{partnerName}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Actions ──────────────────────────────────────── */}
      <div className="edit-actions" style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center', flexWrap: 'wrap' }}>

        {/* WhatsApp */}
        <span title={!hasPhone ? 'לא הוזן מספר טלפון לאיש קשר זה' : undefined}>
          <button
            onClick={handleSendWhatsApp}
            disabled={!hasPhone || !!success}
            style={{
              padding: '13px 18px', borderRadius: 'var(--radius-sm)',
              background: hasPhone ? '#25D366' : 'var(--color-bg)',
              color: hasPhone ? '#fff' : 'var(--color-text-faint)',
              fontWeight: 700, fontSize: 'var(--font-size-body-min)',
              border: hasPhone ? 'none' : '1px solid var(--color-border)',
              cursor: hasPhone && !success ? 'pointer' : 'not-allowed',
              opacity: success ? 0.6 : 1,
              boxShadow: hasPhone ? 'var(--shadow-btn-primary)' : 'none',
              whiteSpace: 'nowrap',
            }}
          >💬 שלח בוואטסאפ</button>
        </span>

        {/* Email */}
        <span title={!hasEmail ? 'לא הוזנה כתובת מייל לאיש קשר זה' : undefined}>
          <button
            onClick={handleSendEmail}
            disabled={!hasEmail || !!success}
            style={{
              padding: '13px 18px', borderRadius: 'var(--radius-sm)',
              background: hasEmail ? 'var(--color-primary)' : 'var(--color-bg)',
              color: hasEmail ? 'var(--color-surface)' : 'var(--color-text-faint)',
              fontWeight: 700, fontSize: 'var(--font-size-body-min)',
              border: hasEmail ? 'none' : '1px solid var(--color-border)',
              cursor: hasEmail && !success ? 'pointer' : 'not-allowed',
              opacity: success ? 0.6 : 1,
              boxShadow: hasEmail ? 'var(--shadow-btn-primary)' : 'none',
              whiteSpace: 'nowrap',
            }}
          >📧 שלח במייל</button>
        </span>

        {/* Copy */}
        <button
          onClick={handleCopy}
          style={{
            padding: '13px 18px', borderRadius: 'var(--radius-sm)',
            background: copied ? '#dcfce7' : 'var(--color-surface)',
            color: copied ? '#166534' : 'var(--color-text-body)',
            fontWeight: 700, fontSize: 'var(--font-size-body-min)',
            border: `1px solid ${copied ? '#22c55e' : 'var(--color-border)'}`,
            cursor: 'pointer', whiteSpace: 'nowrap',
          }}
        >{copied ? '✓ הועתק!' : '📋 העתק ברכה'}</button>

        {/* Cancel */}
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '13px var(--space-5)', borderRadius: 'var(--radius-sm)',
            background: 'transparent', color: 'var(--color-text-muted)',
            fontWeight: 600, fontSize: 'var(--font-size-body-min)',
            border: 'none', cursor: 'pointer',
          }}
        >{t('editGreeting.cancel')}</button>
      </div>
    </main>
  )
}
