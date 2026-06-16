import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type Language = 'en' | 'es'

interface LanguageContextValue {
  language: Language
  setLanguage: (language: Language) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

const readInitialLanguage = (): Language => {
  const stored = window.localStorage.getItem('webtools-language')
  return stored === 'es' || stored === 'en' ? stored : 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readInitialLanguage)

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage(nextLanguage) {
        window.localStorage.setItem('webtools-language', nextLanguage)
        setLanguageState(nextLanguage)
      },
    }),
    [language],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider.')
  }

  return context
}
