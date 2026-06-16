# 0004 – Prompt maestro e instrucciones para Codex

Este documento sirve para guiar a Codex en la siguiente fase de desarrollo de **WebTools Platform**.

Objetivo: usar Codex como implementador técnico, mientras tú actúas como arquitecto del proyecto, revisando decisiones, código, tests y builds.

---

## Cómo usar este documento

1. Guarda este archivo en el repositorio, preferiblemente en:

```txt
docs/0004-prompt-maestro-codex.md
```

2. Abre Codex en el repositorio `webtools-platform`.

3. Pídele primero que lea el repositorio y los documentos de `/docs`.

4. Después pega el prompt maestro incluido más abajo.

5. No le pidas que implemente todas las herramientas a la vez. El primer objetivo será preparar roadmap y construir **solo Form Inspector**.

---

# Prompt maestro para Codex

Copia y pega este prompt completo en Codex:

```md
# Contexto general

Estás trabajando en el repositorio `webtools-platform`.

Este proyecto se llama **WebTools Platform**.

Es una plataforma modular de herramientas operativas para desarrolladores web, marketers técnicos, agencias y equipos que trabajan con HTML, formularios, URLs, CSVs, leads, campañas, integraciones y QA técnico.

El objetivo NO es crear herramientas que ChatGPT pueda resolver fácilmente en una conversación. El objetivo es crear herramientas visuales, repetibles, deterministas y útiles para tareas operativas reales: extracción, validación, limpieza, comparación, inspección, transformación y exportación.

## Stack actual

El proyecto usa un monorepo:

```txt
webtools-platform/
├── client/   # React + TypeScript + Vite
├── server/   # Node + Express + TypeScript
└── docs/     # Documentación numerada del proyecto
```

Frontend:
- React
- TypeScript
- Vite
- UI tipo SaaS minimalista
- Dashboard + Sidebar
- Registro dinámico de herramientas

Backend:
- Node.js
- Express
- TypeScript
- Vitest para testing
- Cheerio para parseo HTML cuando aplique
- API REST bajo `/api`

Deploy:
- En desarrollo, frontend y backend están separados.
- En producción, solo se ejecuta el backend.
- El frontend se compila y el build se sirve desde `server/public`.
- Express sirve:
  - `/api/*` para endpoints
  - `/` para la app React

## Estado actual del proyecto

Ya existe una primera herramienta:

### HTML Attribute Refactor

Funcionalidad:
- Pegar HTML.
- Elegir atributo `href` o `src`.
- Extraer valores únicos.
- Mostrar valores detectados.
- Permitir escribir reemplazos.
- Reemplazar coincidencias exactas.
- Devolver HTML modificado.

Esta herramienta ya existe o está en proceso avanzado. No la rehagas desde cero salvo que encuentres errores evidentes. Respeta su estructura.

## Filosofía del producto

WebTools Platform debe centrarse en herramientas que pasen el "test anti-ChatGPT".

Una herramienta merece existir si cumple varias de estas condiciones:

1. Procesa muchos elementos a la vez.
2. Necesita interfaz visual.
3. Tiene que conservar formato exacto.
4. Debe ser repetible sin ambigüedad.
5. Tiene exportación.
6. Hace validaciones objetivas.
7. Reduce riesgo de error humano.
8. Permite editar resultados uno a uno.
9. Trabaja con archivos.
10. Genera reportes.

Evita herramientas tipo:
- generadores de texto
- ideas de contenido
- copywriting
- resúmenes
- prompts genéricos
- chatbots

Este producto debe ser práctico, técnico y operativo.

---

# Objetivo de esta tarea

Quiero que prepares la siguiente fase del proyecto para convertir WebTools Platform en una plataforma monetizable y escalable.

No implementes todo de golpe.

Primero debes:

1. Inspeccionar la estructura actual del repositorio.
2. Entender cómo están organizados `client`, `server` y `docs`.
3. Revisar la herramienta existente `html-refactor`.
4. Crear o actualizar documentación técnica numerada en `/docs`.
5. Crear un roadmap técnico claro.
6. Implementar SOLO la siguiente herramienta prioritaria: **Form Inspector**.
7. Añadir tests backend con Vitest.
8. Asegurar que `npm run build` funciona en server y client.
9. No romper el deploy actual.

---

# Documentación que debes crear

Crea los siguientes documentos en `/docs`, manteniendo el estilo claro y numerado del proyecto:

```txt
0005-roadmap-tools-monetizacion.md
0006-tool-form-inspector.md
```

Si ya existen, actualízalos sin destruir información útil.

## 0005-roadmap-tools-monetizacion.md

Debe incluir:

- Visión de producto.
- Posicionamiento.
- Herramientas seleccionadas.
- Prioridad.
- Dificultad.
- Potencial de monetización.
- Por qué cada herramienta no es fácilmente sustituible por ChatGPT.
- Modelo free/pro futuro.
- Roadmap por fases.

Herramientas seleccionadas para el roadmap:

1. HTML Attribute Refactor
2. Form Inspector
3. Lead CSV Cleaner / Deduplicator
4. URL Batch Status Checker / Redirect Inspector
5. Webhook / API Payload Inspector
6. CSV Compare / Export Reconciliation
7. Tracking Pixel / Script Inspector
8. Campaign / Landing Preflight Checker

## 0006-tool-form-inspector.md

Debe especificar completamente la tool **Form Inspector**.

Debe incluir:

- Alcance.
- Reglas de negocio.
- Modelo de datos.
- Endpoints.
- Request/response examples.
- Casos borde.
- Validaciones.
- Errores.
- Tests obligatorios con Vitest.
- Requisitos frontend.
- Criterios de aceptación.

---

# Siguiente herramienta a implementar: Form Inspector

## Objetivo

Crear una herramienta que permita pegar HTML y extraer información estructurada sobre formularios.

Esta tool está orientada a tareas reales de desarrollo web, landings, campañas, captación de leads, debugging de formularios e integraciones.

## Funcionalidad MVP

El usuario pega HTML y la tool debe detectar todos los formularios `<form>`.

Por cada formulario debe extraer:

- índice del formulario
- `action`
- `method`
- número total de campos
- inputs
- selects
- textareas
- hidden fields
- required fields
- problemas detectados

Por cada campo debe extraer:

- tag: `input`, `select`, `textarea`, `button`
- type si existe
- name si existe
- id si existe
- value si existe
- placeholder si existe
- required: boolean
- disabled: boolean
- readonly: boolean
- options si es select
- label asociado si se puede detectar de forma simple

## Problemas o warnings a detectar

Detectar como mínimo:

- formulario sin `action`
- formulario sin `method`
- input sin `name`
- hidden field sin `name`
- campos required sin name
- botón submit inexistente
- action con `#`
- action vacío
- method diferente de `get` o `post`
- formularios duplicados con el mismo action y method

## Backend

Crear estructura modular:

```txt
server/src/tools/form-inspector/
├── service.ts
├── controller.ts
├── types.ts
└── __tests__/
    └── formInspector.test.ts
```

Crear rutas:

```txt
server/src/routes/tools/formInspector.routes.ts
```

Registrar la ruta en la estructura principal de rutas existente.

Endpoint:

```txt
POST /api/tools/form-inspector/analyze
```

Request:

```json
{
  "html": "<form action=\"/lead\" method=\"post\"><input name=\"email\" required /></form>"
}
```

Response esperada:

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
        "hiddenFields": 0,
        "requiredFields": 1
      },
      "warnings": []
    }
  ]
}
```

Si no hay formularios:

```json
{
  "forms": []
}
```

## Reglas backend

- Usar Cheerio para parsear HTML.
- No usar regex para parsear HTML.
- No validar URLs.
- No hacer peticiones externas.
- No corregir el HTML.
- Solo analizar y devolver estructura.
- Mantener el orden de aparición de los formularios.
- Mantener el orden de aparición de los campos dentro de cada formulario.
- Controller solo gestiona request/response.
- Service contiene la lógica.
- Types contiene interfaces y tipos.
- Validar que `html` existe y es string.
- Si falta `html`, devolver HTTP 400.
- Añadir límite razonable al tamaño de HTML de entrada: 1 MB.

## Testing backend con Vitest

Crear tests unitarios para el service.

Casos mínimos:

1. Devuelve array vacío si no hay formularios.
2. Detecta un formulario básico con action y method.
3. Extrae inputs con name, type, placeholder y required.
4. Extrae hidden fields.
5. Extrae selects con options.
6. Extrae textareas.
7. Detecta warning si falta action.
8. Detecta warning si falta method.
9. Detecta warning si hay input sin name.
10. Detecta warning si no hay botón submit.
11. Mantiene orden de formularios.
12. Mantiene orden de campos.
13. Detecta method inválido.
14. Detecta action vacío o `#`.

Los tests deben ejecutarse con:

```bash
cd server
npm test
```

Y el build debe pasar con:

```bash
cd server
npm run build
```

---

# Frontend de Form Inspector

Crear carpeta:

```txt
client/src/tools/form-inspector/
```

Componentes sugeridos:

```txt
client/src/tools/form-inspector/
├── FormInspectorPage.tsx
├── components/
│   ├── FormSummaryCard.tsx
│   ├── FieldsTable.tsx
│   └── WarningsList.tsx
└── types.ts
```

## UI esperada

La página debe tener:

- título: "Form Inspector"
- descripción breve
- textarea grande para pegar HTML
- botón "Analyze forms"
- estado loading
- estado error
- listado de formularios detectados
- por cada formulario:
  - card resumen
  - action
  - method
  - summary
  - warnings
  - tabla de campos

La interfaz debe seguir el estilo SaaS minimalista existente:

- limpia
- clara
- fondo claro
- cards con borde suave
- sin animaciones exageradas
- responsive básico

## Integración frontend

Registrar la herramienta en:

```txt
client/src/registry/tools.ts
```

Añadir:

```ts
{
  id: "form-inspector",
  name: "Form Inspector",
  description: "Analyze HTML forms and extract fields, methods, actions and warnings.",
  path: "/tools/form-inspector"
}
```

Añadir ruta para:

```txt
/tools/form-inspector
```

Debe funcionar desde el Dashboard y desde el Sidebar.

## Comunicación con API

La página debe llamar a:

```txt
POST /api/tools/form-inspector/analyze
```

Usar rutas relativas:

```ts
fetch("/api/tools/form-inspector/analyze", ...)
```

No hardcodear dominio.

---

# Seguridad y límites

Para Form Inspector:

- No ejecutar HTML.
- No renderizar HTML pegado como HTML real.
- Mostrarlo únicamente como texto si se muestra.
- No insertar contenido del usuario usando `dangerouslySetInnerHTML`.
- No hacer llamadas externas.
- Limitar tamaño del HTML de entrada a 1 MB.
- Devolver error claro si se supera el límite.

---

# Roadmap futuro, no implementar ahora

No implementes todavía estas herramientas, solo déjalas documentadas en `0005-roadmap-tools-monetizacion.md`:

## Lead CSV Cleaner / Deduplicator

Subir/pegar CSV, elegir columna clave, limpiar espacios, emails en minúscula, eliminar duplicados, exportar CSV limpio y CSV de duplicados.

## URL Batch Status Checker / Redirect Inspector

Pegar muchas URLs y comprobar status code, redirects, URL final y errores. Debe incluir protección SSRF: bloquear localhost, IPs privadas, redes internas y protocolos no HTTP/HTTPS.

## Webhook / API Payload Inspector

Pegar JSON, validar estructura, extraer paths, tipos, generar mapping y payload de ejemplo.

## CSV Compare / Export Reconciliation

Subir dos CSVs, elegir clave, detectar registros solo en A, solo en B, modificados y duplicados.

## Tracking Pixel / Script Inspector

Pegar HTML y detectar GTM, GA, Meta Pixel, TikTok Pixel, Hotjar, Clarity, scripts externos y duplicados.

## Campaign / Landing Preflight Checker

Tool premium futura que reutilizará lógica de Form Inspector, URL Checker, Tracking Inspector y HTML analysis para generar reporte de QA de campaña o landing.

---

# Requisitos de calidad

Antes de terminar:

1. Ejecuta tests backend.
2. Ejecuta build backend.
3. Ejecuta build frontend.
4. Comprueba que no has roto HTML Attribute Refactor.
5. Comprueba que la nueva tool aparece en Dashboard y Sidebar.
6. Comprueba que `/api/health` sigue funcionando.
7. No elimines documentación existente.
8. No introduzcas dependencias pesadas sin justificarlo.
9. No añadas autenticación, base de datos, Stripe ni sistema de usuarios todavía.
10. No cambies la estrategia de deploy.

## Comandos esperados

Backend:

```bash
cd server
npm test
npm run build
```

Frontend:

```bash
cd client
npm run build
```

Si falla algún comando, corrige antes de finalizar.

---

# Entregable esperado

Al finalizar, quiero:

1. Documentos nuevos en `/docs`.
2. Backend de Form Inspector implementado.
3. Tests Vitest pasando.
4. Frontend de Form Inspector implementado.
5. Tool registrada en Dashboard y Sidebar.
6. Build de backend funcionando.
7. Build de frontend funcionando.
8. Resumen de archivos creados/modificados.
9. Resumen de cómo probar manualmente la herramienta.

No hagas cambios fuera del alcance salvo que sean necesarios para conectar la tool de forma limpia.
```

---

# Paso a paso recomendado para guiar a Codex

## Paso 1 – Preparar el repo

Antes de usar Codex, asegúrate de tener el repo limpio:

```bash
git status
```

Si tienes cambios importantes sin guardar:

```bash
git add .
git commit -m "Checkpoint before Form Inspector"
```

Esto te permite volver atrás si Codex se flipa. Porque a veces se flipa. Es muy listo, pero también puede entrar en modo arquitecto con exceso de café.

---

## Paso 2 – Añadir este documento al repo

Crea o mueve este archivo a:

```txt
docs/0004-prompt-maestro-codex.md
```

Haz commit:

```bash
git add docs/0004-prompt-maestro-codex.md
git commit -m "Add Codex master prompt for next tools"
```

---

## Paso 3 – Abrir Codex con el repo correcto

Abre Codex en el repositorio:

```txt
webtools-platform
```

Antes de pedir implementación, dile esto:

```md
Lee primero la estructura del repositorio y los documentos en `/docs`.
No hagas cambios todavía.
Devuélveme un resumen de la arquitectura actual, herramientas existentes, scripts disponibles y cómo está organizado el frontend y backend.
```

Objetivo: que Codex inspeccione antes de tocar.

---

## Paso 4 – Validar que Codex entiende el proyecto

Cuando Codex responda, comprueba que menciona:

- `client/`
- `server/`
- `docs/`
- React + Vite + TypeScript
- Express + TypeScript
- Vitest
- Cheerio
- HTML Attribute Refactor
- Deploy desde backend sirviendo `server/public`

Si no menciona estas cosas, no sigas. Corrígelo antes.

Puedes decirle:

```md
Te falta tener en cuenta que en producción solo se ejecuta el backend y el frontend se sirve desde `server/public`. Relee la documentación antes de implementar.
```

---

## Paso 5 – Pegar el prompt maestro

Pega el prompt maestro completo de este documento.

No lo resumas.

No digas simplemente "haz Form Inspector".

Dale todo el contexto.

---

## Paso 6 – Pedir ejecución por fases

Aunque el prompt ya lo dice, refuerza esto:

```md
Ejecuta la tarea por fases. Primero crea/actualiza los documentos 0005 y 0006. Después implementa backend y tests. Después implementa frontend. No pases a la siguiente fase si el build o los tests fallan.
```

---

## Paso 7 – Revisar documentación creada

Cuando Codex cree:

```txt
docs/0005-roadmap-tools-monetizacion.md
docs/0006-tool-form-inspector.md
```

Revísalos antes de aceptar implementación.

Comprueba que:

- No propone tools genéricas de IA.
- Prioriza tools operativas.
- Form Inspector tiene reglas claras.
- Hay endpoints definidos.
- Hay tests definidos.
- No se mete Stripe, login o base de datos todavía.

Si algo no te gusta, corrígelo en docs antes de dejarle programar.

---

## Paso 8 – Dejarle implementar backend

Pídele:

```md
Ahora implementa solo el backend de Form Inspector siguiendo `docs/0006-tool-form-inspector.md`. Crea service, controller, types, route y tests con Vitest. No toques frontend todavía.
```

Después exige:

```bash
cd server
npm test
npm run build
```

Si falla, dile:

```md
Corrige los errores de tests/build sin cambiar el alcance funcional definido en la documentación.
```

---

## Paso 9 – Probar endpoint manualmente

Cuando el backend compile, prueba con curl:

```bash
curl -X POST http://localhost:3001/api/tools/form-inspector/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<form action=\"/lead\" method=\"post\"><input type=\"email\" name=\"email\" required><button type=\"submit\">Send</button></form>"
  }'
```

Debe devolver algo parecido a:

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
          "type": "email",
          "name": "email",
          "required": true
        },
        {
          "tag": "button",
          "type": "submit"
        }
      ],
      "warnings": []
    }
  ]
}
```

---

## Paso 10 – Dejarle implementar frontend

Cuando backend esté validado:

```md
Ahora implementa el frontend de Form Inspector siguiendo `docs/0006-tool-form-inspector.md`.
Debe aparecer en Dashboard y Sidebar.
Debe llamar al endpoint con ruta relativa `/api/tools/form-inspector/analyze`.
Mantén el diseño SaaS minimalista existente.
No uses `dangerouslySetInnerHTML`.
```

Después exige:

```bash
cd client
npm run build
```

---

## Paso 11 – Comprobar integración completa

En local:

Backend:

```bash
cd server
npm run dev
```

Frontend:

```bash
cd client
npm run dev
```

Comprueba:

```txt
/tools/form-inspector
```

Luego prueba producción local:

```bash
cd client
npm run build
cd ../server
npm run build
npm run start
```

Comprueba:

```txt
http://localhost:3001
http://localhost:3001/api/health
http://localhost:3001/tools/form-inspector
```

---

## Paso 12 – Commit final

Cuando todo funcione:

```bash
git status
git add .
git commit -m "Add Form Inspector tool"
git push
```

---

# Reglas para no perder el control

- No dejes que Codex implemente varias tools a la vez.
- No aceptes cambios grandes sin tests.
- No aceptes cambios que rompan el deploy actual.
- No metas autenticación todavía.
- No metas monetización todavía.
- No metas base de datos todavía.
- Primero tools útiles. Luego negocio.
- Cada nueva tool debe tener su documento numerado.

---

# Próximos prompts después de Form Inspector

Cuando Form Inspector esté aprobado, el siguiente prompt debería ser específico para:

```txt
Lead CSV Cleaner / Deduplicator
```

No uses el prompt maestro otra vez entero salvo que quieras iniciar una nueva fase grande.
