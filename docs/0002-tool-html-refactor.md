# 0002 -- HTML Attribute Refactor Tool

## Alcance

La herramienta **HTML Attribute Refactor** permite:

-   Extraer valores únicos de atributos `href` o `src` desde un HTML
    proporcionado.
-   Reemplazar dichos valores por nuevos valores definidos por el
    usuario.
-   No valida ni interpreta las URLs.
-   No transforma URLs relativas o absolutas.
-   Solo extrae y reemplaza literalmente.

------------------------------------------------------------------------

## Reglas de negocio

1.  Solo se aceptan atributos:

    -   `"href"`
    -   `"src"`

2.  El HTML debe parsearse usando **cheerio** en el backend.

3.  La extracción debe:

    -   Detectar todos los elementos que contengan el atributo
        solicitado.
    -   Ignorar atributos vacíos o null.
    -   Eliminar valores duplicados.
    -   Mantener el orden de aparición original.

4.  El reemplazo debe:

    -   Reemplazar únicamente coincidencias exactas.
    -   No modificar otros atributos.
    -   No alterar la estructura HTML.
    -   Devolver el HTML completo modificado.

5.  No se debe:

    -   Validar formato de URL.
    -   Normalizar rutas.
    -   Corregir HTML.
    -   Interpretar rutas relativas.

------------------------------------------------------------------------

## Endpoints

### 1️⃣ Extraer atributos

POST `/api/tools/html-refactor/extract`

### Request

``` json
{
  "html": "<a href=\"https://example.com\">Link</a>",
  "attribute": "href"
}
```

### Response

``` json
{
  "values": ["https://example.com"]
}
```

------------------------------------------------------------------------

### 2️⃣ Reemplazar atributos

POST `/api/tools/html-refactor/replace`

### Request

``` json
{
  "html": "<a href=\"https://example.com\">Link</a>",
  "attribute": "href",
  "replacements": {
    "https://example.com": "https://newdomain.com"
  }
}
```

### Response

``` json
{
  "html": "<a href=\"https://newdomain.com\">Link</a>"
}
```

------------------------------------------------------------------------

## Contratos de datos

### Extract Request

-   `html`: string (requerido)
-   `attribute`: "href" \| "src" (requerido)

### Extract Response

-   `values`: string\[\]

------------------------------------------------------------------------

### Replace Request

-   `html`: string (requerido)
-   `attribute`: "href" \| "src" (requerido)
-   `replacements`: Record\<string, string\> (requerido)

### Replace Response

-   `html`: string

------------------------------------------------------------------------

## Casos de prueba esperados

### ✔ Caso 1: Múltiples atributos

Input:

``` html
<a href="a.com"></a>
<a href="b.com"></a>
<a href="a.com"></a>
```

Extract → `["a.com", "b.com"]`

------------------------------------------------------------------------

### ✔ Caso 2: Sin atributos

Input:

``` html
<p>Hello</p>
```

Extract → `[]`

------------------------------------------------------------------------

### ✔ Caso 3: Reemplazo parcial

Solo deben reemplazarse valores presentes en `replacements`.

------------------------------------------------------------------------

### ✔ Caso 4: Atributos mezclados

Debe extraer solo el atributo solicitado.

------------------------------------------------------------------------

## Requisitos técnicos

-   Debe usar `cheerio` para parseo HTML.
-   Implementación en TypeScript.
-   Separar:
    -   `service.ts`
    -   `controller.ts`
    -   `routes.ts`
-   Debe incluir tests unitarios con Vitest.
-   Debe manejar errores con status HTTP adecuados.

------------------------------------------------------------------------

Documento 0002 -- Especificación de herramienta HTML Attribute Refactor.
