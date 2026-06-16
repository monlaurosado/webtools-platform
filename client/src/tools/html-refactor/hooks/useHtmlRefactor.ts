import { useEffect, useMemo, useRef, useState } from 'react'
import { useLanguage } from '../../../i18n/LanguageContext'
import { readApiErrorMessage } from '../../../i18n/messages'
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

const COPY = {
  en: {
    readFileError: 'Could not read the HTML file.',
    extractError: 'Could not extract links.',
    loadFileError: 'Could not load the file.',
    emptyApplyError: 'Load or paste HTML before applying changes.',
    invalidResponse: 'Invalid response from server.',
    applyError: 'Could not apply changes.',
  },
  es: {
    readFileError: 'No se pudo leer el archivo HTML.',
    extractError: 'No se pudieron extraer enlaces.',
    loadFileError: 'No se pudo cargar el archivo.',
    emptyApplyError: 'Debes cargar o pegar HTML antes de aplicar cambios.',
    invalidResponse: 'Respuesta inválida del servidor.',
    applyError: 'No se pudieron aplicar los cambios.',
  },
} as const

const readFileAsText = (file: File, errorMessage: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const value = reader.result
      if (typeof value !== 'string') {
        reject(new Error(errorMessage))
        return
      }
      resolve(value)
    }
    reader.onerror = () => reject(new Error(errorMessage))
    reader.readAsText(file)
  })

const normalizeValues = (values: unknown): string[] => {
  if (!Array.isArray(values)) {
    return []
  }

  return values.filter((value): value is string => typeof value === 'string')
}

export const useHtmlRefactor = () => {
  const { language } = useLanguage()
  const copy = COPY[language]
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
            throw new Error(await readApiErrorMessage(response, language))
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
            error instanceof Error ? error.message : copy.extractError
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
  }, [attribute, copy.extractError, html, language])

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
      const nextHtml = await readFileAsText(file, copy.readFileError)
      setHtml(nextHtml)
    } catch (error) {
      const message = error instanceof Error ? error.message : copy.loadFileError
      setExtractError(message)
    }
  }

  const applyChanges = async () => {
    if (html.trim().length === 0) {
      setApplyError(copy.emptyApplyError)
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
        throw new Error(await readApiErrorMessage(response, language))
      }

      const payload = (await response.json()) as ReplaceResponse
      if (typeof payload.html !== 'string') {
        throw new Error(copy.invalidResponse)
      }

      setResultHtml(payload.html)
      setCopyState('idle')
    } catch (error) {
      const message = error instanceof Error ? error.message : copy.applyError
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
