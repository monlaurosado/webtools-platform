# 0005 - Roadmap de tools y monetizacion

## Objetivo

Definir la siguiente fase de **WebTools Platform** como una plataforma modular,
monetizable y escalable de herramientas operativas para equipos web.

Este documento no autoriza la implementacion simultanea de todas las tools. Su
objetivo es ordenar prioridades, justificar el valor del producto y preparar una
secuencia de desarrollo controlada.

---

## Vision de producto

WebTools Platform debe ser un espacio de trabajo tecnico para tareas repetibles
que hoy se resuelven con scripts sueltos, hojas de calculo, extensiones de
navegador o revision manual.

La plataforma debe centrarse en herramientas que:

- procesan muchos elementos a la vez;
- reducen errores humanos;
- producen resultados deterministas;
- conservan datos o HTML sin transformaciones inesperadas;
- permiten inspeccionar, validar, limpiar, comparar o exportar;
- son utiles para desarrollo web, marketing tecnico, QA, agencias y equipos de
  operaciones.

No debe competir como generador de texto, chatbot, herramienta de prompts o
asistente creativo generalista.

---

## Posicionamiento

**WebTools Platform** se posiciona como una caja de herramientas profesional para
operaciones web y QA tecnico.

Audiencias principales:

- desarrolladores frontend y full stack;
- marketers tecnicos;
- agencias que mantienen landings y campañas;
- equipos de growth y lead generation;
- equipos que revisan formularios, URLs, CSVs, integraciones y tracking.

Propuesta de valor:

- pegar, subir o importar datos operativos;
- obtener analisis estructurado;
- detectar problemas objetivos;
- editar o filtrar resultados;
- exportar salidas listas para usar o compartir.

---

## Criterios de seleccion de tools

Una tool entra en el roadmap si cumple varias de estas condiciones:

1. Trabaja con volumen.
2. Necesita una interfaz visual para revisar resultados.
3. Tiene reglas objetivas y repetibles.
4. Reduce trabajo manual propenso a errores.
5. Puede exportar datos o reportes.
6. Conserva formato o estructura critica.
7. Apoya flujos reales de QA, integraciones o campañas.
8. No se resuelve bien con una respuesta conversacional de IA.

La prioridad se decide con estos criterios:

1. Dolor operativo frecuente.
2. Implementacion razonable con la arquitectura actual.
3. Riesgo tecnico controlado.
4. Valor visual claro en frontend.
5. Potencial de convertirse en parte de un flujo premium.
6. Capacidad de reutilizar logica en tools futuras.

---

## Principios de monetizacion

La monetizacion no debe empezar por Stripe, login o planes. Primero debe
demostrarse que las tools resuelven trabajos reales y repetibles.

La secuencia correcta es:

1. Crear tools utiles sin friccion.
2. Medir cuales se usan mas y donde aparecen limites naturales.
3. Anadir exportaciones y reportes.
4. Solo despues introducir cuentas, historico y facturacion.

Senales de que una tool puede ser Pro:

- usuarios necesitan procesar mas volumen;
- usuarios necesitan exportar evidencia;
- usuarios repiten el mismo analisis con frecuencia;
- usuarios comparten resultados con clientes o equipos;
- la tool reduce riesgo economico, por ejemplo campanas rotas, leads perdidos o
  migraciones mal validadas.

---

## Herramientas seleccionadas

| Tool | Prioridad | Dificultad | Potencial de monetizacion | Estado |
| --- | --- | --- | --- | --- |
| HTML Attribute Refactor | Alta | Baja | Medio | Implementada o avanzada |
| Form Inspector | Alta | Media | Alto | Siguiente implementacion |
| Lead CSV Cleaner / Deduplicator | Alta | Media | Alto | Roadmap |
| URL Batch Status Checker / Redirect Inspector | Alta | Alta | Alto | Roadmap |
| Webhook / API Payload Inspector | Media | Media | Medio | Roadmap |
| CSV Compare / Export Reconciliation | Media | Alta | Alto | Roadmap |
| Tracking Pixel / Script Inspector | Media | Media | Alto | Roadmap |
| Campaign / Landing Preflight Checker | Baja inicial, alta futura | Alta | Muy alto | Roadmap premium |

---

## Matriz operativa

| Tool | Usuario principal | Entrada | Salida | Feature Pro natural |
| --- | --- | --- | --- | --- |
| HTML Attribute Refactor | Developer, agencia | HTML | HTML modificado | Batch avanzado y reportes de cambios |
| Form Inspector | Developer, marketer tecnico, QA | HTML | Inventario de formularios y warnings | Exportacion de reporte y presets de QA |
| Lead CSV Cleaner / Deduplicator | Growth, operaciones | CSV | CSV limpio y duplicados | Limites altos, reglas guardadas y exportacion avanzada |
| URL Batch Status Checker / Redirect Inspector | SEO tecnico, developer | Lista de URLs | Status, redirects y errores | Mas URLs, historico y reportes |
| Webhook / API Payload Inspector | Developer, integraciones | JSON | Paths, tipos y mapping | Comparacion de payloads y contratos |
| CSV Compare / Export Reconciliation | Operaciones, ecommerce | Dos CSVs | Diferencias y duplicados | Volumen alto y reportes reconciliables |
| Tracking Pixel / Script Inspector | Marketer tecnico, QA | HTML | Pixels, scripts y duplicados | Checklist de campana y exportacion |
| Campaign / Landing Preflight Checker | Agencia, growth, QA | HTML, URLs y configuracion | Reporte consolidado | Producto Pro principal |

---

## Analisis por herramienta

### 1. HTML Attribute Refactor

Alcance:
- extraer valores `href` o `src` de HTML;
- mostrar valores unicos;
- permitir reemplazos exactos;
- devolver HTML modificado.

Por que no es facilmente sustituible por ChatGPT:
- debe conservar HTML exacto;
- necesita reemplazos uno a uno;
- requiere ejecucion determinista;
- reduce el riesgo de romper atributos no relacionados.

Monetizacion:
- buena tool gratuita de entrada;
- puede formar parte de flujos premium de QA de landing o migraciones masivas.

Dependencias:
- ninguna adicional.

MVP recomendado:
- mantener alcance actual;
- asegurar que no se rompe al anadir nuevas tools.

Evolucion futura:
- exportar mapa de cambios;
- detectar valores no reemplazados;
- integrarse con Campaign / Landing Preflight Checker.

### 2. Form Inspector

Alcance:
- analizar formularios en HTML;
- extraer `action`, `method`, campos y labels simples;
- detectar warnings operativos;
- preparar datos para QA de captacion e integraciones.

Por que no es facilmente sustituible por ChatGPT:
- analiza multiples formularios y campos en orden;
- devuelve estructura consistente;
- detecta problemas objetivos;
- permite revisar resultados visualmente.

Monetizacion:
- alta, porque conecta con problemas reales de campañas, leads y QA;
- buen candidato para exportacion de reportes en plan Pro.

Dependencias:
- Cheerio ya existe en backend;
- no requiere red, base de datos ni librerias pesadas.

MVP recomendado:
- endpoint de analisis;
- warnings objetivos;
- vista frontend con resumen, warnings y tabla de campos.

Evolucion futura:
- exportacion CSV/JSON;
- preset de checklist para landings;
- integracion con Tracking Pixel / Script Inspector.

### 3. Lead CSV Cleaner / Deduplicator

Alcance:
- pegar o subir CSV;
- elegir columna clave;
- normalizar emails y espacios;
- detectar duplicados;
- exportar CSV limpio y CSV de duplicados.

Por que no es facilmente sustituible por ChatGPT:
- trabaja con volumen;
- requiere preservar filas y columnas;
- necesita exportacion exacta;
- la deduplicacion debe ser auditable.

Monetizacion:
- alta para agencias, operaciones y growth;
- limites por numero de filas pueden separar Free y Pro.

Dependencias:
- decision de parser CSV;
- diseno de exportacion de archivos;
- limites de tamano y filas.

MVP recomendado:
- pegar CSV;
- detectar columnas;
- elegir columna clave;
- normalizar espacios y emails;
- separar limpios y duplicados.

Evolucion futura:
- reglas guardadas;
- soporte de archivos grandes;
- exportacion multiple.

### 4. URL Batch Status Checker / Redirect Inspector

Alcance:
- analizar muchas URLs;
- obtener status code, redirects, URL final y errores;
- exportar resultados.

Por que no es facilmente sustituible por ChatGPT:
- requiere peticiones reales;
- produce resultados verificables en tiempo de ejecucion;
- analiza redirecciones y fallos en lote.

Monetizacion:
- alta para migraciones, SEO tecnico y QA de campañas;
- requiere controles de seguridad SSRF antes de implementarse.

Dependencias:
- cliente HTTP en backend;
- timeouts;
- limites de concurrencia;
- proteccion SSRF.

MVP recomendado:
- no implementarlo hasta documentar seguridad;
- bloquear `localhost`, IPs privadas, redes internas y protocolos no
  HTTP/HTTPS;
- limitar cantidad de URLs y redirects.

Evolucion futura:
- historico de comprobaciones;
- comparacion entre ejecuciones;
- exportacion para SEO tecnico.

### 5. Webhook / API Payload Inspector

Alcance:
- pegar JSON;
- validar estructura;
- extraer paths y tipos;
- generar mapping operativo y payload de ejemplo.

Por que no es facilmente sustituible por ChatGPT:
- necesita parseo determinista;
- debe conservar estructura;
- puede trabajar con payloads grandes;
- facilita revision de integraciones.

Monetizacion:
- media;
- puede convertirse en feature Pro si incluye comparacion de payloads,
  contratos o exportacion de mappings.

Dependencias:
- parser JSON nativo;
- diseno de visualizacion de paths;
- limites de tamano.

MVP recomendado:
- validar JSON;
- listar paths con tipos;
- mostrar valores de ejemplo;
- detectar campos nulos o arrays heterogeneos.

Evolucion futura:
- comparar payloads;
- generar contratos;
- exportar mapping para integraciones.

### 6. CSV Compare / Export Reconciliation

Alcance:
- comparar dos CSVs;
- elegir clave;
- detectar filas solo en A, solo en B, modificadas y duplicadas;
- exportar diferencias.

Por que no es facilmente sustituible por ChatGPT:
- requiere comparacion completa y reproducible;
- trabaja con archivos;
- necesita reportes y exportaciones;
- evita revision manual fila por fila.

Monetizacion:
- alta para equipos de datos operativos, ecommerce, CRM y afiliacion.

Dependencias:
- parser CSV compartido con CSV Cleaner;
- estrategia de comparacion para valores normalizados y valores exactos.

MVP recomendado:
- pegar dos CSVs;
- elegir clave;
- detectar solo en A, solo en B y duplicados;
- detectar filas modificadas por comparacion exacta.

Evolucion futura:
- reglas de normalizacion por columna;
- exportacion de diferencias;
- resumen ejecutivo de reconciliacion.

### 7. Tracking Pixel / Script Inspector

Alcance:
- pegar HTML;
- detectar GTM, GA, Meta Pixel, TikTok Pixel, Hotjar, Clarity y scripts
  externos;
- detectar duplicados y configuraciones sospechosas.

Por que no es facilmente sustituible por ChatGPT:
- inspecciona HTML real;
- aplica reglas objetivas;
- puede identificar duplicados y patrones por proveedor;
- encaja con QA tecnico de campañas.

Monetizacion:
- alta si se combina con reportes y checklist de preflight.

Dependencias:
- Cheerio ya existe en backend;
- catalogo mantenible de proveedores y patrones.

MVP recomendado:
- detectar scripts externos;
- detectar proveedores principales;
- advertir duplicados;
- listar ubicacion aproximada en `head` o `body`.

Evolucion futura:
- reglas por plataforma;
- exportacion de checklist;
- integracion con Campaign / Landing Preflight Checker.

### 8. Campaign / Landing Preflight Checker

Alcance:
- agrupar analisis de formularios, tracking, scripts, URLs y HTML;
- generar un reporte de QA antes de publicar una campaña o landing.

Por que no es facilmente sustituible por ChatGPT:
- reutiliza varias tools deterministas;
- produce un reporte objetivo;
- puede analizar multiples dimensiones tecnicas;
- reduce riesgo operativo antes de invertir en trafico.

Monetizacion:
- muy alta como feature premium;
- debe implementarse despues de validar las tools base.

Dependencias:
- Form Inspector;
- Tracking Pixel / Script Inspector;
- URL Batch Status Checker / Redirect Inspector;
- sistema de reportes o exportacion.

MVP recomendado:
- no implementarlo todavia;
- esperar a tener al menos tres tools base estables;
- definir primero formato de reporte.

Evolucion futura:
- scoring de riesgo;
- plantillas por tipo de campana;
- reportes compartibles con cliente.

---

## Modelo Free / Pro futuro

### Free

Objetivo:
- demostrar valor rapido;
- captar usuarios tecnicos;
- permitir uso frecuente con limites razonables.

Posibles limites:
- maximo de HTML o CSV por operacion;
- limite de filas para tools CSV;
- limite de URLs por batch;
- sin historico;
- exportaciones basicas;
- reportes simples.

Tools candidatas Free:
- HTML Attribute Refactor;
- Form Inspector con analisis en pantalla;
- CSV Cleaner con limite bajo de filas;
- Tracking Pixel Inspector basico.

### Pro

Objetivo:
- monetizar flujos con mayor volumen, colaboracion o reporting.

Capacidades candidatas:
- limites superiores;
- exportaciones CSV/JSON/PDF;
- guardado de reportes;
- historico de ejecuciones;
- comparaciones avanzadas;
- presets de validacion;
- Campaign / Landing Preflight Checker;
- reportes compartibles para clientes.

No incluido por ahora:
- autenticacion;
- base de datos;
- Stripe;
- equipos;
- permisos;
- facturacion.

Estas piezas deben esperar hasta que existan suficientes tools con valor
operativo probado.

---

## Gates antes de monetizar

Antes de construir autenticacion, planes o facturacion deben cumplirse estas
condiciones:

1. Al menos tres tools utiles funcionando end to end.
2. Builds de frontend y backend estables.
3. Tests backend en las tools con logica critica.
4. Exportacion disponible en al menos una tool.
5. Evidencia de que hay workflows repetidos, no solo demos puntuales.
6. Un primer flujo compuesto claro, preferiblemente Campaign / Landing
   Preflight Checker.

---

## Riesgos y decisiones pendientes

### Riesgos tecnicos

- El URL Checker introduce riesgo SSRF y debe disenarse con cuidado.
- Las tools CSV pueden necesitar limites estrictos de memoria.
- Las exportaciones PDF pueden anadir dependencias pesadas si se implementan
  demasiado pronto.
- Servir frontend desde `server/public` obliga a mantener simple el deploy.

### Riesgos de producto

- Construir demasiadas tools antes de validar uso real.
- Confundir la plataforma con herramientas generativas de IA.
- Meter monetizacion antes de tener suficiente valor operativo.
- Crear flujos premium sin exportacion o reporte claro.

### Decisiones pendientes

- Formato estandar de exportacion: CSV, JSON, HTML report o PDF.
- Limites Free iniciales por tool.
- Si las tools deben compartir componentes de tabla y warnings.
- Si se necesita un formato comun de `warnings` entre tools.

---

## Roadmap por fases

### Fase 0 - Base existente

Objetivo:
- consolidar arquitectura monorepo;
- mantener frontend React servido por Express en produccion;
- estabilizar HTML Attribute Refactor.

Entregables:
- tool HTML Attribute Refactor funcional;
- documentacion base;
- tests backend existentes;
- build de client y server funcionando.

### Fase 1 - Form Inspector

Objetivo:
- anadir la primera tool nueva con valor claro para QA tecnico.

Entregables:
- `docs/0006-tool-form-inspector.md`;
- backend modular;
- endpoint `POST /api/tools/form-inspector/analyze`;
- tests Vitest;
- frontend integrado en Dashboard y Sidebar.

### Fase 2 - Tools de datos operativos

Objetivo:
- abrir casos de uso con CSVs y leads.

Tools:
- Lead CSV Cleaner / Deduplicator;
- CSV Compare / Export Reconciliation, si el flujo de CSV Cleaner valida
  demanda.

Entregables:
- subida o pegado de CSV;
- parseo seguro;
- tablas de revision;
- exportacion.

### Fase 3 - Tools de QA tecnico web

Objetivo:
- cubrir problemas frecuentes antes de publicar landings y campanas.

Tools:
- Tracking Pixel / Script Inspector;
- URL Batch Status Checker / Redirect Inspector.

Notas:
- URL Checker requiere diseno de seguridad previo, especialmente proteccion
  contra SSRF, bloqueo de localhost, IPs privadas y protocolos no HTTP/HTTPS.

### Fase 4 - Integraciones y payloads

Objetivo:
- ampliar utilidad para debugging de integraciones.

Tools:
- Webhook / API Payload Inspector;
- mejoras de exportacion y mapping.

### Fase 5 - Producto premium compuesto

Objetivo:
- construir una experiencia Pro a partir de tools ya validadas.

Tool principal:
- Campaign / Landing Preflight Checker.

Entregables posibles:
- reporte consolidado;
- score de riesgos;
- exportacion para cliente;
- historico y comparacion entre ejecuciones, si ya existe infraestructura.

---

## Principios tecnicos para el roadmap

- Cada tool debe tener documento numerado propio.
- Cada tool debe tener backend modular si contiene logica de negocio.
- El frontend debe consumir el registro central de tools.
- Las rutas API deben vivir bajo `/api/tools/{toolId}`.
- No se deben introducir dependencias pesadas sin justificacion.
- No se debe cambiar la estrategia de deploy actual.
- No se debe anadir autenticacion, base de datos ni monetizacion real hasta que
  el producto tenga varias tools utiles y estables.

---

## Prioridad inmediata

La siguiente implementacion debe ser solo **Form Inspector**.

No se debe implementar ninguna otra tool de este roadmap en la misma fase.
