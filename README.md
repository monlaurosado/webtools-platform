# WebTools Platform

# Overview

WebTools Platform es una aplicacion web modular para centralizar utilidades internas de una empresa de marketing.  
La primera herramienta implementada es **HTML Attribute Refactor**, orientada a procesar newsletters HTML de forma masiva y segura.

Objetivo principal:
- Reducir trabajo manual repetitivo.
- Disminuir errores humanos en cambios de enlaces.
- Preparar una base escalable para nuevas tools internas.

# Problem Statement

Antes de esta herramienta, el flujo para preparar newsletters se hacia manualmente:
- Extraer enlaces `href` del HTML.
- Enviar enlaces a sistemas de tracking.
- Reemplazar URLs una por una.
- Extraer recursos `src` (imagenes, scripts).
- Subir recursos y actualizar referencias.

Este proceso es lento, propenso a errores y dificulta la estandarizacion operativa cuando el volumen de newsletters aumenta.

# Solution Architecture

Arquitectura cliente-servidor con separacion clara de responsabilidades:
- **Frontend (React + Vite)**: interfaz de usuario, carga de HTML, seleccion de atributo, mapeo de reemplazos, preview y descarga.
- **Backend (Express + TypeScript)**: validacion de entrada, parseo HTML con Cheerio y reemplazo literal de atributos.
- **Despliegue unificado**: el backend sirve API y frontend estatico desde `server/public`.

Convencion de API:
- Prefijo comun: `/api`
- Tool actual: `/api/tools/html-refactor`
- Endpoints:
  - `POST /api/tools/html-refactor/extract`
  - `POST /api/tools/html-refactor/replace`

# Tech Stack

- **React 19 + TypeScript**: UI tipada y mantenible para flujos interactivos.
- **Vite 7**: desarrollo rapido y build optimizado.
- **React Router 7**: enrutado de dashboard y tools dinamicas.
- **Express 4 + TypeScript**: API REST simple y robusta.
- **Cheerio**: parseo/manipulacion de HTML sin regex.
- **Vitest**: pruebas unitarias y cobertura en backend (umbral 90%).

Justificacion tecnica:
- Tipado estricto en frontend y backend reduce errores de contrato.
- Cheerio permite modificar atributos HTML de forma estructurada.
- Arquitectura modular facilita agregar nuevas herramientas sin rehacer la base.

# Project Structure

```text
webtools-platform/
├── README.md
├── docs/
│   ├── 0001-diseno-arquitectura.md
│   ├── 0002-tool-html-refactor.md
│   ├── 0003-frontend-base-layout.md
│   ├── 0004-frontend-tool-html-refactor.md
├── client/
│   ├── src/
│   │   ├── layout/                  # Shell visual (Sidebar, Header, MainLayout)
│   │   ├── pages/                   # Dashboard
│   │   ├── registry/                # Registro dinamico de tools
│   │   ├── tools/html-refactor/     # UI de la tool actual
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── vite.config.ts               # Proxy /api y build hacia ../server/public
└── server/
    ├── src/
    │   ├── index.ts                 # Bootstrap Express + static hosting
    │   ├── routes/tools/
    │   │   └── html-refactor.routes.ts
    │   └── tools/html-refactor/
    │       ├── controller.ts
    │       ├── service.ts
    │       ├── types.ts
    │       └── service.test.ts
    ├── public/                      # Build estatico del frontend
    └── dist/                        # Build compilado del backend
```

# How It Works

Flujo funcional de la herramienta `html-refactor`:

1. El usuario pega HTML o sube un archivo `.html`.
2. Selecciona el atributo a procesar (`href` o `src`).
3. El frontend dispara extraccion automatica (con debounce) hacia:
   - `POST /api/tools/html-refactor/extract`
4. El backend:
   - valida `html` y `attribute`,
   - parsea con Cheerio,
   - devuelve valores unicos en orden de aparicion.
5. El usuario define reemplazos por valor y puede omitir filas.
6. Al aplicar cambios, el frontend envia solo reemplazos activos a:
   - `POST /api/tools/html-refactor/replace`
7. El backend reemplaza coincidencias exactas del atributo objetivo y responde HTML final.
8. El frontend muestra:
   - HTML resultante,
   - boton de copia,
   - descarga `.html`,
   - preview embebida en `iframe`.

# Installation & Setup

## Prerequisitos

- Node.js `^20.19.0 || >=22.12.0` (recomendado: Node 22 LTS).
- npm (incluido con Node.js).
- Git.

## Instalacion desde cero

```bash
git clone <tu-repo>
cd webtools-platform
```

Instalar dependencias del frontend:

```bash
cd client
npm install
```

Instalar dependencias del backend:

```bash
cd ../server
npm install
```

## Ejecucion en local (desarrollo)

Terminal 1 (backend):

```bash
cd server
npm run dev
```

Terminal 2 (frontend):

```bash
cd client
npm run dev
```

Accesos por defecto:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- Healthcheck API: `http://localhost:3001/api/health`

Notas:
- En desarrollo, Vite proxya `/api` hacia `http://localhost:3001`.
- Por eso, `VITE_API_BASE_URL` puede quedar vacio en local.

## Tests backend

```bash
cd server
npm test
```

Cobertura:

```bash
npm run test:coverage
```

# Environment Variables

No hay archivo `.env` obligatorio para arrancar el proyecto en local.  
Variables soportadas actualmente:

Frontend (`client`):
- `VITE_API_BASE_URL` (opcional)
  - Default: `''` (cadena vacia).
  - Uso recomendado:
    - Local con proxy Vite: dejar vacio.
    - Frontend separado del backend: definir URL base completa, por ejemplo `https://api.midominio.com`.

Backend (`server`):
- `PORT` (opcional)
  - Default: `3001`
  - Define el puerto HTTP de Express.

Ejemplo de arranque backend con puerto custom:

```bash
cd server
PORT=8080 npm run dev
```

# Build & Deployment

## Build de produccion

1) Compilar frontend (sale directo a `server/public`):

```bash
cd client
npm run build
```

2) Compilar backend TypeScript a `server/dist`:

```bash
cd ../server
npm run build
```

3) Ejecutar en modo produccion:

```bash
npm run start
```

Resultado:
- Express sirve API en `/api/*`.
- Express sirve frontend estatico desde `server/public`.
- Cualquier ruta no API retorna `index.html` (SPA routing).

## Consideraciones de despliegue

- Despliegue recomendado: un solo proceso Node.js para backend + estaticos.
- Configurar variable `PORT` segun proveedor (Render, Railway, VPS, etc.).
- Ejecutar `npm run test` en pipeline antes de publicar.

# Author Notes

Este repositorio representa la base de una plataforma interna de utilidades web, con enfoque en modularidad, mantenibilidad y escalado progresivo.  
La tool `HTML Attribute Refactor` cubre una necesidad operativa real en marketing y funciona como referencia de arquitectura para futuras herramientas.
