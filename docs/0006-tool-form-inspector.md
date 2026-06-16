# 0006 - Tool Form Inspector

## Objetivo

**Form Inspector** permite pegar HTML y extraer informacion estructurada sobre
formularios. Esta orientada a QA tecnico, landings, captacion de leads,
debugging de formularios e integraciones.

La tool debe analizar HTML de forma determinista, sin ejecutar ni renderizar el
contenido enviado por el usuario.

---

## Alcance

Incluye:

- detectar todos los elementos `<form>`;
- mantener el orden de aparicion de los formularios;
- extraer `action` y `method`;
- extraer campos `input`, `select`, `textarea` y `button`;
- mantener el orden de aparicion de los campos dentro de cada formulario;
- calcular resumen por formulario;
- detectar warnings objetivos;
- exponer un endpoint REST;
- mostrar resultados en frontend con una UI clara.

No incluye:

- validar si las URLs de `action` existen;
- hacer peticiones externas;
- corregir HTML;
- enviar formularios;
- ejecutar scripts;
- renderizar HTML pegado con `dangerouslySetInnerHTML`;
- guardar historico;
- autenticacion;
- base de datos;
- monetizacion.

---

## Reglas de negocio

1. El backend debe usar Cheerio para parsear HTML.
2. No se debe usar regex para parsear HTML.
3. La entrada debe ser un objeto JSON con `html`.
4. `html` es obligatorio y debe ser string.
5. El tamano maximo de `html` es 1 MB.
6. Si no hay formularios, la respuesta debe ser `{ "forms": [] }`.
7. El orden de formularios y campos debe ser estable y corresponder al HTML.
8. `action` debe devolverse como:
   - `null` si el atributo no existe;
   - `""` si existe pero esta vacio;
   - el valor original si existe y no esta vacio.
9. `method` debe devolverse como:
   - `null` si el atributo no existe;
   - `""` si existe pero esta vacio;
   - valor en minusculas si existe.
10. No se deben normalizar URLs ni rutas.
11. No se debe modificar el HTML recibido.
12. El controller solo debe gestionar request y response.
13. El service debe contener la logica de analisis.
14. `types.ts` debe contener interfaces y tipos compartidos de la tool.

---

## Estructura backend

Crear:

```txt
server/src/tools/form-inspector/
├── service.ts
├── controller.ts
├── types.ts
└── __tests__/
    └── formInspector.test.ts
```

Crear ruta:

```txt
server/src/routes/tools/formInspector.routes.ts
```

Registrar la ruta en:

```txt
server/src/index.ts
```

Prefijo:

```txt
/api/tools/form-inspector
```

---

## Endpoint

### Analizar formularios

```txt
POST /api/tools/form-inspector/analyze
```

### Request

```json
{
  "html": "<form action=\"/lead\" method=\"post\"><input name=\"email\" required /></form>"
}
```

### Response

```json
{
  "forms": [
    {
      "index": 0,
      "action": "/lead",
      "method": "post",
      "fields": [
        {
          "tag": "input",
          "type": "text",
          "name": "email",
          "id": null,
          "value": null,
          "placeholder": null,
          "required": true,
          "disabled": false,
          "readonly": false,
          "label": null,
          "options": []
        }
      ],
      "summary": {
        "totalFields": 1,
        "inputs": 1,
        "selects": 0,
        "textareas": 0,
        "buttons": 0,
        "hiddenFields": 0,
        "requiredFields": 1
      },
      "warnings": [
        {
          "code": "missing_submit_button",
          "message": "Form does not contain a submit button."
        }
      ]
    }
  ]
}
```

### Sin formularios

```json
{
  "forms": []
}
```

---

## Modelo de datos

### AnalyzeFormsResponse

```ts
export interface AnalyzeFormsResponse {
  forms: InspectedForm[];
}
```

### InspectedForm

```ts
export interface InspectedForm {
  index: number;
  action: string | null;
  method: string | null;
  fields: FormField[];
  summary: FormSummary;
  warnings: FormWarning[];
}
```

### FormField

```ts
export type FormFieldTag = "input" | "select" | "textarea" | "button";

export interface FormField {
  tag: FormFieldTag;
  type: string | null;
  name: string | null;
  id: string | null;
  value: string | null;
  placeholder: string | null;
  required: boolean;
  disabled: boolean;
  readonly: boolean;
  label: string | null;
  options: SelectOption[];
}
```

### SelectOption

```ts
export interface SelectOption {
  value: string | null;
  label: string;
  selected: boolean;
  disabled: boolean;
}
```

### FormSummary

```ts
export interface FormSummary {
  totalFields: number;
  inputs: number;
  selects: number;
  textareas: number;
  buttons: number;
  hiddenFields: number;
  requiredFields: number;
}
```

### FormWarning

```ts
export type FormWarningCode =
  | "missing_action"
  | "empty_action"
  | "hash_action"
  | "missing_method"
  | "invalid_method"
  | "input_missing_name"
  | "hidden_missing_name"
  | "required_missing_name"
  | "missing_submit_button"
  | "duplicate_action_method";

export interface FormWarning {
  code: FormWarningCode;
  message: string;
  fieldIndex?: number;
}
```

---

## Extraccion de campos

Por cada campo se debe extraer:

- `tag`: `input`, `select`, `textarea` o `button`;
- `type`: valor de `type` si existe;
- `name`: valor de `name` o `null`;
- `id`: valor de `id` o `null`;
- `value`: valor de `value` o `null`;
- `placeholder`: valor de `placeholder` o `null`;
- `required`: `true` si el atributo existe;
- `disabled`: `true` si el atributo existe;
- `readonly`: `true` si el atributo existe;
- `options`: solo para `select`, array de opciones;
- `label`: label asociado si se detecta de forma simple.

Reglas especificas:

- `input` sin `type` debe devolver `type: "text"`.
- `button` sin `type` debe devolver `type: "submit"` porque es su comportamiento
  HTML por defecto dentro de un formulario.
- `select` sin `type` debe devolver `type: null`.
- `textarea` sin `type` debe devolver `type: null`.
- `textarea` debe usar su contenido como `value` si no tiene atributo `value`.
- `options` debe ser `[]` para campos que no sean `select`.

---

## Deteccion simple de labels

El label asociado debe detectarse con estas reglas, en este orden:

1. Si el campo tiene `id`, buscar `label[for="{id}"]` dentro del mismo formulario.
2. Si no existe, buscar si el campo esta dentro de un `<label>`.
3. Si se encuentra label, devolver su texto normalizado con espacios simples.
4. Si no se encuentra, devolver `null`.

No se requiere deteccion avanzada por proximidad visual.

---

## Warnings

Detectar como minimo:

| Codigo | Condicion |
| --- | --- |
| `missing_action` | El formulario no tiene atributo `action`. |
| `empty_action` | El formulario tiene `action=""` o solo espacios. |
| `hash_action` | El formulario tiene `action="#"`. |
| `missing_method` | El formulario no tiene atributo `method` o esta vacio. |
| `invalid_method` | El method no es `get` ni `post`. |
| `input_missing_name` | Un `input`, `select` o `textarea` no tiene `name`. |
| `hidden_missing_name` | Un `input type="hidden"` no tiene `name`. |
| `required_missing_name` | Un campo required no tiene `name`. |
| `missing_submit_button` | El formulario no contiene submit button. |
| `duplicate_action_method` | Hay mas de un formulario con el mismo `action` y `method`. |

Notas:

- `method` debe compararse en minusculas.
- Un submit button existe si hay:
  - `<button type="submit">`;
  - `<button>` sin `type`;
  - `<input type="submit">`;
  - `<input type="image">`.
- `duplicate_action_method` debe evaluarse despues de inspeccionar todos los
  formularios.
- Si un warning aplica a un campo concreto, `fieldIndex` debe apuntar al indice
  del campo dentro de `fields`.

---

## Validaciones y errores

### `html` faltante

Status:

```txt
400
```

Response:

```json
{
  "error": "Invalid html. Expected string."
}
```

### `html` no es string

Status:

```txt
400
```

Response:

```json
{
  "error": "Invalid html. Expected string."
}
```

### `html` supera 1 MB

Status:

```txt
400
```

Response:

```json
{
  "error": "HTML input exceeds the 1 MB limit."
}
```

### Error inesperado

Status:

```txt
500
```

Response:

```json
{
  "error": "Unexpected error."
}
```

---

## Casos borde

El service debe manejar:

- HTML vacio como string valido y devolver `forms: []`;
- HTML mal formado, confiando en el parseo de Cheerio;
- multiples formularios;
- formularios anidados, siguiendo el DOM resultante de Cheerio;
- atributos booleanos como `required`, `disabled` y `readonly`;
- mayusculas en tags o atributos;
- `method="POST"` devolviendo `method: "post"`;
- valores con espacios preservados salvo en checks de vacio;
- selects sin options;
- options sin value;
- labels con texto interno y nodos anidados;
- campos sin `name`;
- formularios duplicados por combinacion exacta de `action` y `method`.

---

## Tests obligatorios con Vitest

Crear tests unitarios del service en:

```txt
server/src/tools/form-inspector/__tests__/formInspector.test.ts
```

Los tests minimos son:

1. Devuelve array vacio si no hay formularios.
2. Detecta un formulario basico con action y method.
3. Extrae inputs con name, type, placeholder y required.
4. Usa `type: "text"` para input sin type.
5. Extrae hidden fields.
6. Extrae selects con options.
7. Extrae textareas.
8. Extrae buttons.
9. Detecta label por `label[for]`.
10. Detecta label envolvente.
11. Detecta warning si falta action.
12. Detecta warning si action esta vacio.
13. Detecta warning si action es `#`.
14. Detecta warning si falta method.
15. Detecta warning si method es invalido.
16. Detecta warning si hay input sin name.
17. Detecta warning si hidden field no tiene name.
18. Detecta warning si campo required no tiene name.
19. Detecta warning si no hay submit button.
20. Detecta formularios duplicados por action y method.
21. Mantiene orden de formularios.
22. Mantiene orden de campos.
23. Rechaza `html` no string.
24. Rechaza HTML mayor de 1 MB.

Los tests deben ejecutarse con:

```bash
cd server
npm test
```

El build debe pasar con:

```bash
cd server
npm run build
```

---

## Estructura frontend

Crear:

```txt
client/src/tools/form-inspector/
├── FormInspectorPage.tsx
├── components/
│   ├── FormSummaryCard.tsx
│   ├── FieldsTable.tsx
│   └── WarningsList.tsx
├── types.ts
└── form-inspector.css
```

La implementacion puede anadir un hook local si ayuda a mantener simple la
pagina.

---

## Requisitos frontend

La pagina debe incluir:

- titulo: `Form Inspector`;
- descripcion breve;
- textarea grande para pegar HTML;
- boton `Analyze forms`;
- estado loading;
- estado error;
- estado vacio cuando no hay formularios;
- listado de formularios detectados;
- por cada formulario:
  - card resumen;
  - action;
  - method;
  - summary;
  - warnings;
  - tabla de campos.

La UI debe:

- seguir el estilo SaaS minimalista existente;
- ser responsive de forma basica;
- no usar `dangerouslySetInnerHTML`;
- no ejecutar ni renderizar HTML pegado;
- llamar a la API con ruta relativa:

```ts
fetch("/api/tools/form-inspector/analyze", ...)
```

Si se mantiene soporte para `VITE_API_BASE_URL` como en la tool existente, la
ruta final no debe hardcodear dominios externos.

---

## Integracion frontend

Registrar en:

```txt
client/src/registry/tools.ts
```

Entrada esperada:

```ts
{
  id: "form-inspector",
  name: "Form Inspector",
  description: "Analyze HTML forms and extract fields, methods, actions and warnings.",
  path: "/tools/form-inspector"
}
```

Si el registro requiere icono, anadir un icono compatible en:

```txt
client/src/ui/icons.tsx
```

Anadir renderizado para `form-inspector` en:

```txt
client/src/App.tsx
```

Debe aparecer en:

- Dashboard;
- Sidebar;
- ruta `/tools/form-inspector`.

---

## Criterios de aceptacion

La fase se considera completa cuando:

1. Existen `docs/0005-roadmap-tools-monetizacion.md` y
   `docs/0006-tool-form-inspector.md`.
2. El backend expone `POST /api/tools/form-inspector/analyze`.
3. El service devuelve formularios, campos, resumenes y warnings segun este
   documento.
4. Los errores de validacion devuelven HTTP 400.
5. Los tests de Vitest pasan.
6. `cd server && npm run build` pasa.
7. El frontend muestra Form Inspector en Dashboard y Sidebar.
8. La pagina permite pegar HTML y analizar formularios.
9. El frontend no usa `dangerouslySetInnerHTML`.
10. `cd client && npm run build` pasa.
11. HTML Attribute Refactor sigue funcionando.
12. `/api/health` sigue funcionando.

---

## Prueba manual esperada

Request:

```bash
curl -X POST http://localhost:3001/api/tools/form-inspector/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<form action=\"/lead\" method=\"post\"><label for=\"email\">Email</label><input id=\"email\" type=\"email\" name=\"email\" required><button type=\"submit\">Send</button></form>"
  }'
```

Respuesta esperada, resumida:

```json
{
  "forms": [
    {
      "index": 0,
      "action": "/lead",
      "method": "post",
      "summary": {
        "totalFields": 2,
        "inputs": 1,
        "selects": 0,
        "textareas": 0,
        "buttons": 1,
        "hiddenFields": 0,
        "requiredFields": 1
      },
      "warnings": []
    }
  ]
}
```

---

## Fuera de alcance para esta fase

- exportar resultados;
- analisis por URL remota;
- screenshots;
- validacion de endpoints reales;
- reglas avanzadas de accesibilidad;
- Campaign / Landing Preflight Checker;
- cualquier otra tool del roadmap.
