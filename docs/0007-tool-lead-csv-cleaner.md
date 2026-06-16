# 0007 - Tool Lead CSV Cleaner / Deduplicator

## Objetivo

**Lead CSV Cleaner / Deduplicator** permite pegar CSV de leads, elegir una
columna clave, limpiar valores basicos y separar registros unicos de duplicados.

La tool esta orientada a equipos de growth, agencias, operaciones y marketing
tecnico que necesitan preparar exports de leads antes de importarlos en CRMs,
plataformas de email, hojas de calculo o integraciones.

---

## Alcance MVP

Incluye:

- pegar CSV con cabecera;
- elegir columna clave para deduplicacion;
- limpiar espacios al inicio y final de cada celda;
- normalizar emails a minusculas en columnas cuyo nombre contenga `email`;
- mantener el orden original de columnas;
- mantener la primera ocurrencia de cada clave;
- separar filas duplicadas;
- devolver CSV limpio;
- devolver CSV de duplicados;
- mostrar resumen y warnings.

No incluye:

- subida de archivos;
- autodeteccion avanzada de delimitadores;
- limpieza de telefonos;
- validacion DNS o SMTP;
- enriquecimiento externo;
- peticiones externas;
- base de datos;
- historico;
- reglas guardadas.

---

## Endpoint

```txt
POST /api/tools/lead-csv-cleaner/clean
```

### Request

```json
{
  "csv": "email,name\n Test@Example.com , Alice \ntest@example.com,Alice duplicate",
  "keyColumn": "email"
}
```

### Response

```json
{
  "headers": ["email", "name"],
  "cleanRows": [
    {
      "rowNumber": 2,
      "values": {
        "email": "test@example.com",
        "name": "Alice"
      }
    }
  ],
  "duplicateRows": [
    {
      "rowNumber": 3,
      "duplicateOfRowNumber": 2,
      "key": "test@example.com",
      "values": {
        "email": "test@example.com",
        "name": "Alice duplicate"
      }
    }
  ],
  "summary": {
    "totalRows": 2,
    "cleanRows": 1,
    "duplicateRows": 1,
    "emptyKeyRows": 0
  },
  "warnings": [],
  "cleanCsv": "email,name\ntest@example.com,Alice",
  "duplicateCsv": "email,name\ntest@example.com,Alice duplicate"
}
```

---

## Reglas de negocio

1. `csv` es obligatorio y debe ser string.
2. `keyColumn` es obligatorio y debe existir en la cabecera.
3. El tamano maximo del CSV de entrada es 1 MB.
4. El CSV debe tener al menos cabecera.
5. El separador MVP es coma.
6. El parser debe soportar:
   - comillas dobles;
   - comas dentro de valores entrecomillados;
   - comillas escapadas como `""`;
   - saltos `\n` y `\r\n`.
7. La primera fila es la cabecera.
8. Los nombres de columnas se limpian con `trim`.
9. Las celdas se limpian con `trim`.
10. Las columnas cuyo nombre contiene `email`, sin distinguir mayusculas, se
    convierten a minusculas.
11. Para deduplicar, se usa el valor ya limpiado de `keyColumn`.
12. Si la columna clave parece email, la clave se compara en minusculas.
13. La primera fila con una clave no vacia se mantiene como limpia.
14. Las siguientes filas con la misma clave se devuelven como duplicadas.
15. Las filas con clave vacia se mantienen en `cleanRows`, pero generan warning.
16. La salida CSV debe preservar el orden de columnas.
17. No se deben hacer peticiones externas.

---

## Validaciones y errores

### CSV invalido

```json
{
  "error": "Invalid csv. Expected string."
}
```

### Key column invalida

```json
{
  "error": "Invalid keyColumn. Expected existing CSV header."
}
```

### CSV demasiado grande

```json
{
  "error": "CSV input exceeds the 1 MB limit."
}
```

### CSV sin cabecera

```json
{
  "error": "CSV must include a header row."
}
```

### CSV mal formado

```json
{
  "error": "Malformed CSV input."
}
```

---

## Warnings

| Codigo | Condicion |
| --- | --- |
| `empty_key` | Una fila no tiene valor en la columna clave. |
| `column_count_mismatch` | Una fila tiene mas o menos columnas que la cabecera. |

Los warnings de fila deben incluir `rowNumber`, usando numeracion humana:

- cabecera: fila 1;
- primera fila de datos: fila 2.

---

## Tests obligatorios

Crear tests Vitest del service que cubran:

1. Rechaza `csv` no string.
2. Rechaza CSV mayor de 1 MB.
3. Rechaza `keyColumn` inexistente.
4. Rechaza CSV sin cabecera.
5. Parsea CSV basico.
6. Soporta valores entrecomillados con comas.
7. Soporta comillas escapadas.
8. Limpia espacios.
9. Normaliza columnas email a minusculas.
10. Mantiene la primera ocurrencia como limpia.
11. Separa duplicados.
12. Mantiene filas con clave vacia y genera warning.
13. Genera warning por diferencia de columnas.
14. Genera `cleanCsv` y `duplicateCsv`.

---

## Frontend

Ruta:

```txt
/tools/lead-csv-cleaner
```

La UI debe incluir:

- titulo `Lead CSV Cleaner`;
- textarea para pegar CSV;
- input o selector para `keyColumn`;
- boton `Clean CSV`;
- resumen de filas;
- tabla compacta de filas limpias;
- tabla compacta de duplicados;
- warnings;
- textarea o botones para copiar CSV limpio y CSV de duplicados.

Integracion:

- registrar la tool en `client/src/registry/tools.ts`;
- renderizarla desde `client/src/App.tsx`;
- usar endpoint relativo:

```ts
fetch("/api/tools/lead-csv-cleaner/clean", ...)
```

---

## Criterios de aceptacion

1. Backend modular implementado.
2. Tests Vitest pasan.
3. `cd server && npm run build` pasa.
4. Frontend muestra la tool en Dashboard y Sidebar.
5. La pagina permite pegar CSV, elegir columna clave y limpiar.
6. `cd client && npm run build` pasa.
7. HTML Attribute Refactor y Form Inspector siguen funcionando.
