import type { Language } from './LanguageContext'

const SERVER_MESSAGES_ES: Record<string, string> = {
  'Invalid html. Expected string.': 'HTML inválido. Se esperaba texto.',
  'HTML input exceeds the 1 MB limit.': 'El HTML supera el límite de 1 MB.',
  'Invalid csv. Expected string.': 'CSV inválido. Se esperaba texto.',
  'Invalid keyColumn. Expected existing CSV header.':
    'Columna clave inválida. Debe existir en la cabecera del CSV.',
  'Invalid keyColumn. Expected existing CSV header in both files.':
    'Columna clave inválida. Debe existir en la cabecera de ambos CSV.',
  'CSV input exceeds the 1 MB limit.': 'El CSV supera el límite de 1 MB.',
  'CSV must include a header row.': 'El CSV debe incluir una fila de cabecera.',
  'Malformed CSV input.': 'CSV mal formado.',
  'Invalid json. Expected string.': 'JSON inválido. Se esperaba texto.',
  'JSON input exceeds the 1 MB limit.': 'El JSON supera el límite de 1 MB.',
  'Malformed JSON input.': 'JSON mal formado.',
  'Invalid urls. Expected array of strings.':
    'URLs inválidas. Se esperaba una lista de textos.',
  'Too many URLs. Maximum is 50.': 'Demasiadas URLs. El máximo es 50.',
  'Invalid URL.': 'URL inválida.',
  'Only http and https URLs are allowed.': 'Solo se permiten URLs http y https.',
  'Blocked internal or private URL.': 'URL interna o privada bloqueada.',
  'Too many redirects.': 'Demasiadas redirecciones.',
  'Request timed out.': 'La petición agotó el tiempo de espera.',
  'Request failed.': 'La petición falló.',
  'Invalid response from server.': 'Respuesta inválida del servidor.',
  'Unexpected error.': 'Error inesperado.',
}

export const translateServerMessage = (message: string, language: Language): string => {
  if (language === 'en') {
    return message
  }

  const trimmedMessage = message.trim()
  const requestStatusMatch = /^Request failed with status (\d+)\.$/.exec(trimmedMessage)
  if (requestStatusMatch) {
    return `La petición falló con estado ${requestStatusMatch[1]}.`
  }

  const statusMatch = /^Status (\d+)$/.exec(trimmedMessage)
  if (statusMatch) {
    return `Estado ${statusMatch[1]}`
  }

  return SERVER_MESSAGES_ES[trimmedMessage] ?? message
}

export const readApiErrorMessage = async (
  response: Response,
  language: Language,
): Promise<string> => {
  try {
    const payload = (await response.json()) as { error?: unknown }
    if (typeof payload.error === 'string' && payload.error.trim().length > 0) {
      return translateServerMessage(payload.error, language)
    }
  } catch {
    // no-op
  }

  return language === 'es'
    ? `La petición falló con estado ${response.status}.`
    : `Request failed with status ${response.status}.`
}

export const translateUrlError = (value: string | null, language: Language) => {
  if (value == null) {
    return value
  }

  return translateServerMessage(value, language)
}
