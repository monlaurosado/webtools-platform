import type { Language } from '../../i18n/LanguageContext'
import type { FormWarningCode } from './types'

const FORM_WARNING_TEXT: Record<FormWarningCode, Record<Language, string>> = {
  missing_action: {
    en: 'Form does not define an action attribute.',
    es: 'El formulario no define un atributo action.',
  },
  empty_action: {
    en: 'Form action is empty.',
    es: 'La acción del formulario está vacía.',
  },
  hash_action: {
    en: 'Form action points to #.',
    es: 'La acción del formulario apunta a #.',
  },
  missing_method: {
    en: 'Form does not define a method attribute.',
    es: 'El formulario no define un atributo method.',
  },
  invalid_method: {
    en: 'Form method should be get or post.',
    es: 'El método del formulario debería ser get o post.',
  },
  input_missing_name: {
    en: 'Field does not define a name attribute.',
    es: 'El campo no define un atributo name.',
  },
  hidden_missing_name: {
    en: 'Hidden field does not define a name attribute.',
    es: 'El campo oculto no define un atributo name.',
  },
  required_missing_name: {
    en: 'Required field does not define a name attribute.',
    es: 'El campo obligatorio no define un atributo name.',
  },
  missing_submit_button: {
    en: 'Form does not contain a submit button.',
    es: 'El formulario no contiene un botón de envío.',
  },
  duplicate_action_method: {
    en: 'Another form uses the same action and method.',
    es: 'Otro formulario usa la misma acción y el mismo método.',
  },
}

export const getFormWarningText = (
  code: FormWarningCode,
  language: Language,
  fallback: string,
) => FORM_WARNING_TEXT[code]?.[language] ?? fallback
