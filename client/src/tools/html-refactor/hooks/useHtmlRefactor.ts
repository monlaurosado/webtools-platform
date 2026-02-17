import { useEffect, useMemo, useRef, useState } from 'react'
import type {
  CopyState,
  ExtractResponse,
  HtmlAttribute,
  ReplaceResponse,
  ReplacementEntry,
  ReplacementRowState,
} from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

const DEFAULT_ROW_STATE: ReplacementRowState = {
  replacement: '',
  ignored: false,
}

const readFileAsText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const value = reader.result
      if (typeof value !== 'string') {
        reject(new Error('No se pudo leer el archivo HTML.'))
        return
      }
      resolve(value)
    }
    reader.onerror = () => reject(new Error('No se pudo leer el archivo HTML.'))
    reader.readAsText(file)
  })

const readErrorMessage = async (response: Response): Promise<string> => {
  try {
    const payload = (await response.json()) as { error?: unknown }
    if (typeof payload.error === 'string' && payload.error.trim().length > 0) {
      return payload.error
    }
  } catch {
    // no-op
  }

  return `Request failed with status ${response.status}.`
}

const normalizeValues = (values: unknown): string[] => {
  if (!Array.isArray(values)) {
    return []
  }

  return values.filter((value): value is string => typeof value === 'string')
}

export const useHtmlRefactor = () => {
  const [html, setHtmlState] = useState('')
  const [attribute, setAttribute] = useState<HtmlAttribute>('href')
  const [extractedValues, setExtractedValues] = useState<string[]>([])
  const [rows, setRows] = useState<Record<string, ReplacementRowState>>({})
  const [resultHtml, setResultHtml] = useState('')

  const [isExtracting, setIsExtracting] = useState(false)
  const [isApplying, setIsApplying] = useState(false)
  const [extractError, setExtractError] = useState<string | null>(null)
  const [applyError, setApplyError] = useState<string | null>(null)
  const [copyState, setCopyState] = useState<CopyState>('idle')

  const copyResetTimerRef = useRef<number | null>(null)

  const setHtml = (nextHtml: string) => {
    setHtmlState(nextHtml)
    setResultHtml('')
    setApplyError(null)
    setCopyState('idle')
  }

  useEffect(() => {
    return () => {
      if (copyResetTimerRef.current !== null) {
        window.clearTimeout(copyResetTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    if (html.trim().length === 0) {
      setExtractedValues([])
      setRows({})
      setIsExtracting(false)
      setExtractError(null)
      return
    }

    const controller = new AbortController()
    let isActive = true

    setIsExtracting(true)
    setExtractError(null)

    const timerId = window.setTimeout(() => {
      void (async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/tools/html-refactor/extract`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              html,
              attribute,
            }),
            signal: controller.signal,
          })

          if (!response.ok) {
            throw new Error(await readErrorMessage(response))
          }

          const payload = (await response.json()) as ExtractResponse
          if (!isActive) {
            return
          }

          setExtractedValues(normalizeValues(payload.values))
        } catch (error) {
          if (!isActive || controller.signal.aborted) {
            return
          }

          const message =
            error instanceof Error ? error.message : 'No se pudieron extraer enlaces.'
          setExtractError(message)
          setExtractedValues([])
        } finally {
          if (isActive) {
            setIsExtracting(false)
          }
        }
      })()
    }, 320)

    return () => {
      isActive = false
      controller.abort()
      window.clearTimeout(timerId)
    }
  }, [html, attribute])

  useEffect(() => {
    setRows((previousRows) => {
      const nextRows: Record<string, ReplacementRowState> = {}

      for (const value of extractedValues) {
        nextRows[value] = previousRows[value] ?? DEFAULT_ROW_STATE
      }

      return nextRows
    })
  }, [extractedValues])

  const replacementEntries = useMemo<ReplacementEntry[]>(() => {
    return extractedValues.map((original) => {
      const current = rows[original] ?? DEFAULT_ROW_STATE
      return {
        original,
        replacement: current.replacement,
        ignored: current.ignored,
      }
    })
  }, [extractedValues, rows])

  const setReplacement = (original: string, replacement: string) => {
    setRows((previousRows) => ({
      ...previousRows,
      [original]: {
        ...(previousRows[original] ?? DEFAULT_ROW_STATE),
        replacement,
      },
    }))
  }

  const toggleIgnored = (original: string) => {
    setRows((previousRows) => {
      const currentRow = previousRows[original] ?? DEFAULT_ROW_STATE

      return {
        ...previousRows,
        [original]: {
          ...currentRow,
          ignored: !currentRow.ignored,
        },
      }
    })
  }

  const setHtmlFromFile = async (file: File | null) => {
    if (!file) {
      return
    }

    try {
      const nextHtml = await readFileAsText(file)
      setHtml(nextHtml)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudo cargar el archivo.'
      setExtractError(message)
    }
  }

  const applyChanges = async () => {
    if (html.trim().length === 0) {
      setApplyError('Debes cargar o pegar un HTML antes de aplicar cambios.')
      return
    }

    const replacements: Record<string, string> = {}

    for (const original of extractedValues) {
      const row = rows[original]
      if (!row || row.ignored) {
        continue
      }

      if (row.replacement.trim().length === 0) {
        continue
      }

      replacements[original] = row.replacement
    }

    setIsApplying(true)
    setApplyError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/tools/html-refactor/replace`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html,
          attribute,
          replacements,
        }),
      })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response))
      }

      const payload = (await response.json()) as ReplaceResponse
      if (typeof payload.html !== 'string') {
        throw new Error('Invalid response from server.')
      }

      setResultHtml(payload.html)
      setCopyState('idle')
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No se pudieron aplicar los cambios.'
      setApplyError(message)
    } finally {
      setIsApplying(false)
    }
  }

  const copyResult = async () => {
    if (!resultHtml) {
      return
    }

    if (!navigator.clipboard) {
      setCopyState('error')
      return
    }

    try {
      await navigator.clipboard.writeText(resultHtml)
      setCopyState('copied')

      if (copyResetTimerRef.current !== null) {
        window.clearTimeout(copyResetTimerRef.current)
      }

      copyResetTimerRef.current = window.setTimeout(() => {
        setCopyState('idle')
      }, 2000)
    } catch {
      setCopyState('error')
    }
  }

  const downloadResult = () => {
    if (!resultHtml) {
      return
    }

    const blob = new Blob([resultHtml], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'html-refactor-output.html'
    document.body.append(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  return {
    html,
    attribute,
    isExtracting,
    isApplying,
    extractError,
    applyError,
    replacementEntries,
    resultHtml,
    copyState,
    setHtml,
    setAttribute,
    setHtmlFromFile,
    setReplacement,
    toggleIgnored,
    applyChanges,
    copyResult,
    downloadResult,
  }
}
