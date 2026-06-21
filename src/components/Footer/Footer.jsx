export default function Footer() {
  return (
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
          <span style={{ cursor: 'pointer' }}>פרטיות</span>
          <span style={{ cursor: 'pointer' }}>תנאי שימוש</span>
          <span style={{ cursor: 'pointer' }}>צור קשר</span>
        </div>
      </div>
    </footer>
  )
}
