# 0012 - Tool Campaign / Landing Preflight Checker

## Objetivo

**Campaign / Landing Preflight Checker** genera un reporte tecnico consolidado
para revisar una landing o campana antes de publicar trafico. Reutiliza
analisis de formularios, tracking y URLs.

Este MVP no introduce monetizacion, usuarios, base de datos ni historico.

---

## Alcance MVP

Incluye:

- pegar HTML de una landing;
- opcionalmente pegar URLs a comprobar;
- ejecutar Form Inspector;
- ejecutar Tracking Inspector;
- ejecutar URL Status Checker sobre URLs opcionales;
- consolidar warnings;
- calcular un score simple de riesgo;
- devolver resumen por area.

No incluye:

- crawling automatico;
- screenshots;
- validacion visual;
- login;
- Stripe;
- base de datos;
- reportes PDF.

---

## Endpoint

```txt
POST /api/tools/campaign-preflight/check
```

### Request

```json
{
  "html": "<form action=\"/lead\" method=\"post\"><input name=\"email\"><button></button></form>",
  "urls": ["https://example.com"]
}
```

---

## Response

```json
{
  "score": 92,
  "riskLevel": "low",
  "summary": {
    "forms": 1,
    "formWarnings": 0,
    "scripts": 2,
    "trackingWarnings": 0,
    "urls": 1,
    "urlFailures": 0
  },
  "checks": {
    "forms": {},
    "tracking": {},
    "urls": {}
  },
  "warnings": []
}
```

---

## Reglas de negocio

1. `html` es obligatorio y debe ser string.
2. `urls` es opcional y debe ser array de strings si existe.
3. Limite de HTML: heredado de Form Inspector y Tracking Inspector.
4. Limite de URLs: heredado de URL Status Checker.
5. No ejecutar HTML.
6. No hacer llamadas externas salvo URLs explicitamente proporcionadas.
7. URL Checker debe mantener proteccion SSRF.
8. Score inicial:
   - empieza en 100;
   - resta 8 por warning de formulario;
   - resta 6 por warning de tracking;
   - resta 10 por URL fallida;
   - resta 10 si no hay formularios;
   - resta 8 si no hay proveedores de tracking detectados;
   - minimo 0.
9. Risk level:
   - `low`: score >= 85;
   - `medium`: score >= 60 y < 85;
   - `high`: score < 60.

---

## Tests obligatorios

1. Rechaza `html` no string.
2. Rechaza `urls` no array si existe.
3. Agrega Form Inspector.
4. Agrega Tracking Inspector.
5. Agrega URL Checker.
6. Calcula score low.
7. Penaliza warnings de formularios.
8. Penaliza ausencia de tracking.
9. Calcula high risk.
10. Mantiene errores SSRF de URL Checker.

---

## Frontend

Ruta:

```txt
/tools/campaign-preflight
```

La UI debe incluir:

- textarea para HTML;
- textarea opcional para URLs;
- boton `Run preflight`;
- score y risk level;
- resumen por area;
- warnings consolidados;
- secciones de forms, tracking y URLs.

---

## Criterios de aceptacion

1. Backend modular implementado.
2. Tests Vitest pasan.
3. `cd server && npm run build` pasa.
4. Frontend registrado en Dashboard y Sidebar.
5. `cd client && npm run build` pasa.
6. Tools anteriores siguen funcionando.
