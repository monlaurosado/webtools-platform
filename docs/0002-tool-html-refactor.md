
# 0002 – HTML Attribute Refactor Tool

## Alcance

La herramienta **HTML Attribute Refactor** permite:

- Extraer valores únicos de atributos `href` o `src` desde un HTML proporcionado.
- Reemplazar dichos valores por nuevos valores definidos por el usuario.
- No valida ni interpreta las URLs.
- No transforma URLs relativas o absolutas.
- Solo extrae y reemplaza literalmente.

---

## Reglas de negocio

1. Solo se aceptan atributos:
   - `"href"`
   - `"src"`

2. El HTML debe parsearse usando **cheerio** en el backend.

3. La extracción debe:
   - Detectar todos los elementos que contengan el atributo solicitado.
   - Ignorar atributos vacíos o null.
   - Eliminar valores duplicados.
   - Mantener el orden de aparición original.

4. El reemplazo debe:
   - Reemplazar únicamente coincidencias exactas.
   - No modificar otros atributos.
   - No alterar la estructura HTML.
   - Devolver el HTML completo modificado.

5. No se debe:
   - Validar formato de URL.
   - Normalizar rutas.
   - Corregir HTML.
   - Interpretar rutas relativas.

---

## Endpoints

### 1️⃣ Extraer atributos

POST `/api/tools/html-refactor/extract`

### Request

```json
{
  "html": "<a href=\"https://example.com\">Link</a>",
  "attribute": "href"
}
```

### Response

```json
{
  "values": ["https://example.com"]
}
```

---

### 2️⃣ Reemplazar atributos

POST `/api/tools/html-refactor/replace`

### Request

```json
{
  "html": "<a href=\"https://example.com\">Link</a>",
  "attribute": "href",
  "replacements": {
    "https://example.com": "https://newdomain.com"
  }
}
```

### Response

```json
{
  "html": "<a href=\"https://newdomain.com\">Link</a>"
}
```

---

## Testing obligatorio (Vitest)

- Tests unitarios obligatorios usando Vitest.
- Cobertura mínima del 90% del service.
- No se permite usar regex para parsear HTML.
- Tests deben cubrir extracción, reemplazo y manejo de errores.
- Deben existir tests separados para extract y replace.

---

Documento 0002 – Especificación completa con testing obligatorio.
