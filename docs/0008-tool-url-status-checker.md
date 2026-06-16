# 0008 - Tool URL Batch Status Checker / Redirect Inspector

## Objetivo

**URL Batch Status Checker / Redirect Inspector** permite pegar una lista de URLs
y obtener status code, cadena de redirects, URL final y errores por URL.

La tool esta orientada a QA tecnico, migraciones, SEO, campanas y comprobaciones
previas a publicar enlaces.

---

## Alcance MVP

Incluye:

- pegar varias URLs;
- validar URLs HTTP/HTTPS;
- bloquear destinos internos o inseguros;
- comprobar status HTTP;
- seguir redirects de forma controlada;
- devolver URL final;
- mostrar errores por URL;
- procesar en lote con limites.

No incluye:

- scraping de contenido;
- analisis SEO avanzado;
- screenshots;
- autenticacion;
- cabeceras custom;
- cookies;
- historico;
- base de datos;
- exportacion avanzada.

---

## Seguridad SSRF obligatoria

Antes de hacer cualquier peticion:

1. Solo permitir protocolos `http:` y `https:`.
2. Bloquear hostnames:
   - `localhost`;
   - cualquier hostname que termine en `.localhost`.
3. Bloquear IPs:
   - IPv4 loopback `127.0.0.0/8`;
   - IPv4 privadas `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`;
   - IPv4 link-local `169.254.0.0/16`;
   - IPv4 unspecified `0.0.0.0`;
   - IPv6 loopback `::1`;
   - IPv6 unique local `fc00::/7`;
   - IPv6 link-local `fe80::/10`.
4. Resolver DNS del hostname y bloquear si cualquier IP resuelta es interna.
5. Validar cada URL de redirect antes de seguirla.
6. Limitar redirects por URL.
7. Limitar cantidad de URLs por request.
8. Usar timeout por request.

Si una URL se bloquea, debe devolverse como resultado con error, no romper todo
el batch.

---

## Endpoint

```txt
POST /api/tools/url-status-checker/inspect
```

### Request

```json
{
  "urls": [
    "https://example.com",
    "https://example.com/old-page"
  ]
}
```

### Response

```json
{
  "results": [
    {
      "index": 0,
      "inputUrl": "https://example.com",
      "finalUrl": "https://example.com/",
      "statusCode": 200,
      "ok": true,
      "redirects": [],
      "error": null
    }
  ],
  "summary": {
    "total": 1,
    "ok": 1,
    "redirected": 0,
    "failed": 0,
    "blocked": 0
  }
}
```

---

## Modelo de datos

```ts
export interface UrlRedirectHop {
  from: string;
  to: string;
  statusCode: number;
}

export interface UrlInspectionResult {
  index: number;
  inputUrl: string;
  finalUrl: string | null;
  statusCode: number | null;
  ok: boolean;
  redirects: UrlRedirectHop[];
  error: string | null;
}

export interface UrlInspectionSummary {
  total: number;
  ok: number;
  redirected: number;
  failed: number;
  blocked: number;
}
```

---

## Reglas de negocio

1. `urls` es obligatorio y debe ser array de strings.
2. Maximo 50 URLs por request.
3. Cada URL debe tener maximo 2048 caracteres.
4. Se debe preservar el orden de entrada.
5. Cada URL produce exactamente un resultado.
6. Redirect maximo por URL: 5.
7. Timeout por peticion: 10 segundos.
8. Usar `HEAD` por defecto.
9. Si `HEAD` falla por metodo no permitido, se puede intentar `GET`.
10. No descargar ni exponer body de la respuesta.
11. No seguir redirects automaticamente con el cliente HTTP; la tool debe
    inspeccionarlos manualmente.
12. Validar SSRF tambien para cada destino de redirect.

---

## Errores por URL

Errores esperados:

- `Invalid URL.`
- `Only http and https URLs are allowed.`
- `Blocked internal or private URL.`
- `Too many redirects.`
- `Request timed out.`
- `Request failed.`

---

## Tests obligatorios

Crear tests Vitest para el service:

1. Rechaza `urls` no array.
2. Rechaza mas de 50 URLs.
3. Devuelve un resultado por URL.
4. Bloquea `ftp://`.
5. Bloquea `localhost`.
6. Bloquea IPv4 privada.
7. Bloquea hostname que resuelve a IP privada.
8. Detecta status 200 sin redirect.
9. Sigue redirect absoluto.
10. Sigue redirect relativo.
11. Bloquea redirect hacia URL interna.
12. Detecta demasiados redirects.
13. Preserva orden.
14. Calcula summary.

---

## Frontend

Ruta:

```txt
/tools/url-status-checker
```

La UI debe incluir:

- titulo `URL Status Checker`;
- textarea para pegar una URL por linea;
- boton `Check URLs`;
- resumen;
- tabla con input URL, status, final URL, redirects y error;
- estado loading;
- estado error de request.

---

## Criterios de aceptacion

1. Backend modular implementado.
2. Proteccion SSRF implementada.
3. Tests Vitest pasan.
4. `cd server && npm run build` pasa.
5. Frontend registrado en Dashboard y Sidebar.
6. `cd client && npm run build` pasa.
7. Tools anteriores siguen funcionando.
