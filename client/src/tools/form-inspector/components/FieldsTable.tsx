import { useLanguage } from '../../../i18n/LanguageContext'
import type { FormField, SelectOption } from '../types'

interface FieldsTableProps {
  fields: FormField[]
}

const displayValue = (value: string | null, emptyLabel: string) => {
  if (value == null) {
    return '—'
  }

  if (value.length === 0) {
    return emptyLabel
  }

  return value
}

const formatBoolean = (value: boolean, language: 'en' | 'es') => {
  if (language === 'es') {
    return value ? 'Sí' : 'No'
  }

  return value ? 'Yes' : 'No'
}

const formatOptions = (options: SelectOption[], language: 'en' | 'es') => {
  if (options.length === 0) {
    return '—'
  }

  return options
    .map((option) => {
      const value = option.value == null ? (language === 'es' ? 'sin valor' : 'no value') : option.value
      const flags = [
        option.selected ? (language === 'es' ? 'seleccionada' : 'selected') : null,
        option.disabled ? (language === 'es' ? 'deshabilitada' : 'disabled') : null,
      ].filter(Boolean)
      const label =
        option.label || (language === 'es' ? '(etiqueta vacía)' : '(empty label)')
      return `${label} (${value})${
        flags.length > 0 ? `, ${flags.join(', ')}` : ''
      }`
    })
    .join('; ')
}

function FieldsTable({ fields }: FieldsTableProps) {
  const { language } = useLanguage()
  const copy = {
    empty: language === 'es' ? 'Este formulario no contiene campos detectados.' : 'This form does not contain detected fields.',
    emptyValue: language === 'es' ? '(vacío)' : '(empty)',
    tag: language === 'es' ? 'Etiqueta' : 'Tag',
    type: language === 'es' ? 'Tipo' : 'Type',
    name: language === 'es' ? 'Nombre' : 'Name',
    label: language === 'es' ? 'Etiqueta visible' : 'Label',
    placeholder: language === 'es' ? 'Placeholder' : 'Placeholder',
    value: language === 'es' ? 'Valor' : 'Value',
    required: language === 'es' ? 'Obligatorio' : 'Required',
    disabled: language === 'es' ? 'Deshabilitado' : 'Disabled',
    readonly: language === 'es' ? 'Solo lectura' : 'Readonly',
    options: language === 'es' ? 'Opciones' : 'Options',
  }

  if (fields.length === 0) {
    return <p className="fields-empty">{copy.empty}</p>
  }

  return (
    <div className="fields-table-wrap">
      <table className="fields-table">
        <thead>
          <tr>
            <th>#</th>
            <th>{copy.tag}</th>
            <th>{copy.type}</th>
            <th>{copy.name}</th>
            <th>ID</th>
            <th>{copy.label}</th>
            <th>{copy.placeholder}</th>
            <th>{copy.value}</th>
            <th>{copy.required}</th>
            <th>{copy.disabled}</th>
            <th>{copy.readonly}</th>
            <th>{copy.options}</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((field, index) => (
            <tr key={`${field.tag}-${field.name ?? field.id ?? index}`}>
              <td>{index + 1}</td>
              <td>
                <span className="field-tag">{field.tag}</span>
              </td>
              <td>{displayValue(field.type, copy.emptyValue)}</td>
              <td>{displayValue(field.name, copy.emptyValue)}</td>
              <td>{displayValue(field.id, copy.emptyValue)}</td>
              <td>{displayValue(field.label, copy.emptyValue)}</td>
              <td>{displayValue(field.placeholder, copy.emptyValue)}</td>
              <td>{displayValue(field.value, copy.emptyValue)}</td>
              <td>{formatBoolean(field.required, language)}</td>
              <td>{formatBoolean(field.disabled, language)}</td>
              <td>{formatBoolean(field.readonly, language)}</td>
              <td>{formatOptions(field.options, language)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default FieldsTable
