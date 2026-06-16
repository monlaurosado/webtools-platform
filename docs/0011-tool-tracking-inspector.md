# 0011 - Tool Tracking Pixel / Script Inspector

## Objetivo

**Tracking Pixel / Script Inspector** permite pegar HTML y detectar scripts,
pixels y herramientas de tracking comunes. Esta orientada a QA tecnico de
landings, campanas, analitica y etiquetas de marketing.

---

## Alcance MVP

Incluye:

- pegar HTML;
- detectar scripts externos;
- detectar scripts inline relevantes;
- identificar proveedores principales;
- detectar duplicados por proveedor/id/src;
- indicar ubicacion aproximada: `head`, `body` o `unknown`;
- devolver warnings objetivos.

Proveedores MVP:

- Google Tag Manager;
- Google Analytics / gtag;
- Meta Pixel;
- TikTok Pixel;
- Hotjar;
- Microsoft Clarity.

No incluye:

- ejecutar scripts;
- validar cuentas reales;
- hacer peticiones externas;
- capturar screenshots;
- revisar consent mode avanzado;
- base de datos;
- historico.

---

## Endpoint

```txt
POST /api/tools/tracking-inspector/analyze
```

### Request

```json
{
  "html": "<script src=\"https://www.googletagmanager.com/gtm.js?id=GTM-ABC\"></script>"
}
```

---

## Response

```json
{
  "scripts": [
    {
      "index": 0,
      "src": "https://www.googletagmanager.com/gtm.js?id=GTM-ABC",
      "inline": false,
      "provider": "Google Tag Manager",
      "identifier": "GTM-ABC",
      "location": "head"
    }
  ],
  "summary": {
    "totalScripts": 1,
    "externalScripts": 1,
    "inlineScripts": 0,
    "detectedProviders": 1,
    "warnings": 0
  },
  "warnings": []
}
```

---

## Reglas de negocio

1. `html` es obligatorio y debe ser string.
2. Limite de HTML: 1 MB.
3. Usar Cheerio para parsear HTML.
4. No usar regex para parsear HTML.
5. No ejecutar HTML ni scripts.
6. No hacer peticiones externas.
7. Mantener orden de aparicion de scripts.
8. Detectar proveedor desde `src` y contenido inline.
9. Detectar identificador cuando sea razonable:
   - `GTM-XXXX`;
   - `G-XXXX`;
   - `UA-XXXX`;
   - `AW-XXXX`;
   - Meta pixel id;
   - Hotjar id;
   - Clarity id.
10. Si hay dos scripts con mismo proveedor e identificador, generar warning.
11. Si hay dos scripts externos con el mismo `src`, generar warning.

---

## Warnings

| Codigo | Condicion |
| --- | --- |
| `duplicate_provider_id` | Mismo proveedor e identificador aparece mas de una vez. |
| `duplicate_src` | Mismo `src` externo aparece mas de una vez. |

---

## Tests obligatorios

1. Rechaza `html` no string.
2. Rechaza HTML mayor de 1 MB.
3. Devuelve scripts vacios si no hay scripts.
4. Detecta script externo.
5. Detecta Google Tag Manager.
6. Detecta Google Analytics / gtag.
7. Detecta Meta Pixel inline.
8. Detecta TikTok Pixel inline.
9. Detecta Hotjar.
10. Detecta Clarity.
11. Detecta duplicado por src.
12. Detecta duplicado por proveedor/id.
13. Calcula summary.

---

## Frontend

Ruta:

```txt
/tools/tracking-inspector
```

La UI debe incluir:

- textarea para HTML;
- boton `Inspect tracking`;
- resumen;
- warnings;
- tabla de scripts con src, provider, identifier y location.

---

## Criterios de aceptacion

1. Backend modular implementado.
2. Tests Vitest pasan.
3. `cd server && npm run build` pasa.
4. Frontend registrado en Dashboard y Sidebar.
5. `cd client && npm run build` pasa.
6. Tools anteriores siguen funcionando.
