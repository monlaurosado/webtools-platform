import { createContext, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'

interface RuntimeConfig {
  /** API namespace including /api, without the /tools suffix. */
  apiBasePath: string
  /** An ordinary document link that leaves this module's router. */
  hostHref?: string
}

const RuntimeContext = createContext<RuntimeConfig>({ apiBasePath: '/api' })

export function RuntimeProvider({
  apiBasePath,
  hostHref,
  children,
}: RuntimeConfig & { children: ReactNode }) {
  const value = useMemo(
    () => ({ apiBasePath: apiBasePath.replace(/\/+$/, ''), hostHref }),
    [apiBasePath, hostHref],
  )

  return <RuntimeContext.Provider value={value}>{children}</RuntimeContext.Provider>
}

export function useRuntime() {
  return useContext(RuntimeContext)
}
