import { createContext, useContext, useState } from 'react'
import { translations } from '../translations/translations'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLang] = useState(
    () => localStorage.getItem('ui-language') || 'he'
  )

  function setLanguage(lang) {
    setLang(lang)
    localStorage.setItem('ui-language', lang)
  }

  function t(key, vars = {}) {
    const parts = key.split('.')
    let node = translations[language]
    for (const p of parts) { node = node?.[p]; if (node === undefined) break }
    if (typeof node !== 'string') {
      node = translations.he
      for (const p of parts) node = node?.[p]
    }
    if (typeof node !== 'string') return key
    return Object.entries(vars).reduce(
      (s, [k, v]) => s.replace(`{${k}}`, String(v)), node
    )
  }

  const dir = translations[language]?.dir ?? 'rtl'

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
