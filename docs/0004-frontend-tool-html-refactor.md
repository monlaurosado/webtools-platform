# 0004 - Frontend Tool: HTML Attribute Refactor UX

## Objetivo

Definir la especificacion funcional y visual del frontend para la herramienta
**HTML Attribute Refactor**, integrada dentro de WebTools Platform.

Esta version se enfoca en una experiencia simple para publico general:
- Cargar o pegar HTML
- Extraer `href` o `src`
- Decidir que enlaces reemplazar y cuales omitir
- Aplicar cambios
- Descargar, copiar y previsualizar el resultado

---

## Alcance

Incluye:
- Flujo completo de UI de la herramienta
- Estados de pantalla
- Reglas de interaccion
- Contrato frontend-backend esperado

No incluye:
- Implementacion tecnica final (se hara en la siguiente fase)
- Nuevas reglas de parsing en backend fuera de esta tool

---

## Ruta y registro

La herramienta vive en:
- Ruta: `/tools/html-refactor`
- Registro: `client/src/registry/tools.ts`

---

## Flujo funcional (paso a paso)

1. Entrada de HTML
- El usuario puede:
  - Subir un archivo `.html`
  - Pegar HTML en un textarea
- Si sube archivo, su contenido se carga automaticamente en el textarea.
- El selector de atributo permite elegir:
  - `href`
  - `src`

2. Extraccion automatica
- Cuando hay HTML y un atributo seleccionado, se ejecuta extraccion.
- Se muestran valores unicos detectados en orden de aparicion.
- Si no hay coincidencias, mostrar estado vacio claro.

3. Mapeo de reemplazos
- Se muestra una lista por cada URL/valor detectado.
- Cada fila tiene:
  - Columna izquierda: valor original (readonly)
  - Columna derecha: input para nuevo valor
  - Accion para omitir ese enlace (toggle o boton)
- Si una fila esta marcada como omitida:
  - No se requiere valor nuevo
  - No debe enviarse como reemplazo activo

4. Aplicar cambios
- Boton principal: `Aplicar cambios`
- Al hacer click:
  - Se envia el HTML original
  - Se envia el atributo seleccionado
  - Se envia solo el mapa de reemplazos activos
  - Se envia opcionalmente la lista de enlaces omitidos

5. Resultado
Tras respuesta exitosa, mostrar:
- Boton `Descargar .html`
- Bloque con textarea de HTML resultante + boton `Copiar`
- Preview renderizada del HTML (debajo)

---

## Reglas de negocio de UI

- No bloquear al usuario si deja algunas filas sin reemplazar.
- Debe ser valido aplicar cambios aunque:
  - No se reemplace ninguna URL
  - Se omitan 1 o mas URLs
- Si un input de reemplazo esta vacio, se considera "sin cambio".
- El reemplazo siempre es literal (sin normalizacion de URL).
- Debe existir feedback visual de:
  - Cargando
  - Exito
  - Error

---

## Contrato API esperado

### 1) Extraer atributos

POST `/api/tools/html-refactor/extract`

Request:
```json
{
  "html": "<a href=\"https://example.com\">Link</a>",
  "attribute": "href"
}
```

Response:
```json
{
  "values": ["https://example.com"]
}
```

### 2) Reemplazar atributos

POST `/api/tools/html-refactor/replace`

Request recomendado:
```json
{
  "html": "<a href=\"https://example.com\">Link</a>",
  "attribute": "href",
  "replacements": {
    "https://example.com": "https://newdomain.com"
  },
  "ignoredValues": ["https://keep-this.com"]
}
```

Response:
```json
{
  "html": "<a href=\"https://newdomain.com\">Link</a>"
}
```

Notas de compatibilidad backend:
- Si `ignoredValues` no se implementa aun, el backend debe al menos respetar que
  solo se reemplacen claves presentes en `replacements`.
- Cualquier valor no presente en `replacements` debe permanecer intacto.

---

## Estructura sugerida de frontend (tool)

```
client/src/tools/html-refactor/
  HtmlRefactorPage.tsx
  components/
    HtmlInputPanel.tsx
    AttributeSelector.tsx
    ReplacementList.tsx
    ResultPanel.tsx
  hooks/
    useHtmlRefactor.ts
  types.ts
```

---

## Requisitos visuales (consistente con 0003)

- Estilo SaaS moderno, limpio, claro.
- Jerarquia visual fuerte pero simple.
- Sin recargar con graficos innecesarios.
- Responsive en desktop y mobile.
- CTA principal siempre visible para aplicar cambios.

---

## Criterios de aceptacion

- El usuario puede cargar archivo o pegar HTML.
- Puede elegir `href` o `src`.
- La extraccion se refleja automaticamente en la lista.
- Puede omitir enlaces individuales sin romper el flujo.
- Puede aplicar cambios y obtener HTML final.
- Puede descargar, copiar y previsualizar el HTML modificado.
- El flujo funciona aunque solo cambie algunas URLs.

---

Documento 0004 - Frontend Tool HTML Attribute Refactor UX.
