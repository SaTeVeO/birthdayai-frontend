import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../Navbar/Navbar'
import Footer from '../Footer/Footer'
import { useLanguage } from '../../contexts/LanguageContext'

const navVariant = {
  '/':               'landing',
  '/login':          'login',
  '/register':       'login',
  '/dashboard':      'dashboard',
  '/edit-greeting':  'edit',
  '/settings':          'settings',
  '/greeting-history':  'edit',
  '/contacts':          'dashboard',
}

const pageBg = {
  '/':                  'var(--color-surface)',
  '/login':             'var(--color-bg)',
  '/register':          'var(--color-bg)',
  '/dashboard':         'var(--color-bg)',
  '/edit-greeting':     'var(--color-bg)',
  '/settings':          'var(--color-bg)',
  '/greeting-history':  'var(--color-bg)',
  '/contacts':          'var(--color-bg)',
}

export default function Layout() {
  const { pathname } = useLocation()
  const { dir } = useLanguage()
  const variant = navVariant[pathname] ?? 'landing'
  const bg      = pageBg[pathname]    ?? 'var(--color-bg)'

  return (
    <div
      dir={dir}
      style={{
        minHeight: '100vh',
        fontFamily: 'var(--font-family)',
        color: 'var(--color-text-primary)',
        background: bg,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Navbar variant={variant} />
      <Outlet />
      {pathname === '/' && <Footer />}
    </div>
  )
}
