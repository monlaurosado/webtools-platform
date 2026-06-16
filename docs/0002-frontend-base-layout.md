
# 0003 – Frontend Base Layout (SaaS Minimal Dashboard)

## Objetivo

Definir la estructura base del frontend de WebTools Platform.

Este documento describe:

- Arquitectura visual
- Estructura de carpetas
- Sistema de rutas
- Layout principal
- Registro dinámico de herramientas
- Requisitos de estilo visual (SaaS moderno y minimalista)

Este documento debe ser usado por Codex para generar la base completa del frontend antes de implementar herramientas individuales.

---

## Filosofía de diseño

El frontend debe:

- Ser visualmente minimalista.
- Tener estética tipo SaaS moderno.
- Usar mucho espacio en blanco.
- Tipografía limpia y legible.
- Layout claro, sin elementos innecesarios.
- Priorizar claridad y funcionalidad.

Inspiración visual:

- Linear
- Vercel Dashboard
- Stripe Dashboard
- Notion (modo claro)

---

## Estructura de carpetas obligatoria

```
client/src/
│
├── layout/
│   ├── MainLayout.tsx
│   ├── Sidebar.tsx
│   └── Header.tsx
│
├── pages/
│   └── Dashboard.tsx
│
├── tools/
│   └── (cada tool tendrá su carpeta)
│
├── registry/
│   └── tools.ts
│
├── App.tsx
└── main.tsx
```

---

## Routing obligatorio

Usar React Router.

Rutas mínimas:

- `/` → Dashboard
- `/tools/:toolId` → Tool dinámica

App.tsx debe:

- Definir Router
- Aplicar MainLayout
- Renderizar rutas dinámicamente

---

## Layout principal

### MainLayout

Debe contener:

- Sidebar fijo a la izquierda
- Header superior opcional
- Área principal de contenido a la derecha

Estructura visual:

```
| Sidebar | Content Area |
```

---

## Sidebar

Debe:

- Mostrar logo o nombre "WebTools Platform"
- Listar herramientas dinámicamente desde `registry/tools.ts`
- Incluir enlace al Dashboard
- Indicar ruta activa
- Ser colapsable en móvil

No debe:

- Tener estilos recargados
- Usar colores fuertes
- Tener animaciones innecesarias

---

## Dashboard (/)

Debe contener:

- Título principal
- Breve descripción de la plataforma
- Grid de tarjetas (cards) con las tools registradas
- Cada card debe enlazar a su tool

Diseño:

- Grid responsive
- Cards con borde sutil
- Hover ligero
- Sin sombras exageradas

---

## Registro dinámico de herramientas

Archivo:

`client/src/registry/tools.ts`

Estructura:

```ts
export interface Tool {
  id: string;
  name: string;
  description: string;
  path: string;
}

export const tools: Tool[] = [
  {
    id: "html-refactor",
    name: "HTML Attribute Refactor",
    description: "Extract and replace href/src attributes in HTML.",
    path: "/tools/html-refactor"
  }
];
```

Sidebar y Dashboard deben consumir este array dinámicamente.

No se permite hardcodear rutas manualmente en múltiples sitios.

---

## Requisitos técnicos

- React + TypeScript
- Functional components
- Hooks
- Sin estado global complejo (por ahora)
- No usar Redux
- Mantener código simple y modular

---

## Estilo visual

- Fondo claro (#f9fafb o similar)
- Sidebar blanco
- Texto gris oscuro (#111827)
- Bordes suaves
- Sin degradados
- Sin colores chillones

Debe parecer:

- Profesional
- Técnico
- Moderno
- Limpio

---

## Comportamiento esperado

- Navegación fluida sin recarga
- Responsive básico
- Estado activo visible en Sidebar
- Código preparado para escalar con nuevas tools

---

## No incluido en esta fase

- Autenticación
- Base de datos
- Dark mode
- Sistema de usuarios

---

Documento 0003 – Especificación base del frontend SaaS minimal.
