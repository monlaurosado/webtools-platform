# Diseño arquitectura WebTools Platform

## Alcance

-   Plataforma modular de herramientas técnicas accesibles desde una
    única interfaz web.
-   Arquitectura cliente-servidor usando React (frontend) y Express
    (backend).
-   Despliegue único donde el backend sirve el frontend como build
    estático.
-   Sistema preparado para añadir nuevas herramientas sin modificar la
    arquitectura base.

------------------------------------------------------------------------

## Principios de arquitectura

1.  Separación clara entre frontend y backend en desarrollo.
2.  Un único proceso Node en producción.
3.  Cada herramienta (tool) debe ser independiente y modular.
4.  API REST consistente bajo el prefijo `/api`.
5.  El frontend no contiene lógica de negocio crítica.
6.  El backend es responsable de validación, procesamiento y reglas de
    negocio.

------------------------------------------------------------------------

## Estructura del proyecto

    webtools-platform/
    │
    ├── client/                 # React + Vite + TypeScript
    │
    ├── server/                 # Express + TypeScript
    │   ├── src/
    │   ├── public/             # Build del frontend
    │   └── dist/               # Backend compilado
    │
    └── docs/
        ├── 0001-diseno-arquitectura.md
        └── (futuros documentos)

------------------------------------------------------------------------

## Flujo de desarrollo

Frontend: - Ejecutado con `vite dev`. - Consume API en `/api`.

Backend: - Ejecutado con `ts-node-dev`. - Expone endpoints REST.

------------------------------------------------------------------------

## Flujo de producción

1.  `client` genera build en `server/public`.
2.  `server` se compila a `dist`.
3.  Hosting ejecuta `node dist/index.js`.
4.  Express sirve:
    -   `/api/*`
    -   `/` (React)

------------------------------------------------------------------------

## Convención de endpoints

Todos los endpoints deben seguir:

    /api/tools/{toolId}/...

Ejemplo:

    /api/tools/html-refactor/extract

------------------------------------------------------------------------

## Estructura interna backend

    server/src/
    │
    ├── tools/
    │   └── {toolId}/
    │       ├── service.ts
    │       ├── controller.ts
    │       └── types.ts
    │
    ├── routes/
    │   └── tools/
    │       └── {toolId}.routes.ts
    │
    └── index.ts

------------------------------------------------------------------------

## Estructura interna frontend

    client/src/
    │
    ├── layout/
    ├── pages/
    ├── tools/
    │   └── {toolId}/
    ├── registry/
    └── App.tsx

------------------------------------------------------------------------

## Requisitos no funcionales

-   API response time \< 200ms.
-   Validación obligatoria de inputs.
-   Manejo uniforme de errores.
-   Código TypeScript estrictamente tipado.
-   Arquitectura preparada para crecimiento futuro.

------------------------------------------------------------------------

Documento 0001 --- Diseño base de arquitectura.
