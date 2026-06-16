# 0010 - Tool CSV Compare / Export Reconciliation

## Objetivo

**CSV Compare / Export Reconciliation** permite pegar dos CSVs, elegir una
columna clave y detectar registros solo en A, solo en B, modificados y
duplicados. Esta orientada a reconciliacion de exports, CRMs, ecommerce,
afiliacion y operaciones.

---

## Alcance MVP

Incluye:

- pegar CSV A y CSV B;
- elegir columna clave;
- parsear cabeceras;
- comparar filas por clave;
- detectar filas solo en A;
- detectar filas solo en B;
- detectar filas modificadas;
- detectar claves duplicadas en A o B;
- devolver resumen y diferencias por columna.

No incluye:

- subida de archivos;
- comparacion fuzzy;
- reglas de normalizacion por columna;
- merges automaticos;
- base de datos;
- historico.

---

## Endpoint

```txt
POST /api/tools/csv-compare/compare
```

### Request

```json
{
  "csvA": "id,email\n1,a@example.com\n2,b@example.com",
  "csvB": "id,email\n1,a@example.com\n2,new@example.com\n3,c@example.com",
  "keyColumn": "id"
}
```

---

## Reglas de negocio

1. `csvA`, `csvB` y `keyColumn` son obligatorios.
2. Cada CSV tiene limite de 1 MB.
3. Cada CSV debe tener cabecera.
4. `keyColumn` debe existir en ambas cabeceras.
5. El parser soporta comillas dobles, comas entrecomilladas y comillas escapadas.
6. Las celdas se comparan despues de `trim`.
7. La primera ocurrencia de una clave se usa para comparar.
8. Ocurrencias adicionales de la misma clave se reportan como duplicados.
9. Una fila se considera modificada si cualquier columna compartida tiene valor
   distinto.
10. Columnas que solo existen en A o B deben reportarse como diferencia.

---

## Response

```json
{
  "headersA": ["id", "email"],
  "headersB": ["id", "email"],
  "onlyInA": [],
  "onlyInB": [
    {
      "rowNumber": 4,
      "key": "3",
      "values": { "id": "3", "email": "c@example.com" }
    }
  ],
  "modifiedRows": [
    {
      "key": "2",
      "rowNumberA": 3,
      "rowNumberB": 3,
      "differences": [
        {
          "column": "email",
          "valueA": "b@example.com",
          "valueB": "new@example.com"
        }
      ]
    }
  ],
  "duplicateKeys": [],
  "summary": {
    "rowsA": 2,
    "rowsB": 3,
    "onlyInA": 0,
    "onlyInB": 1,
    "modified": 1,
    "duplicateKeys": 0
  }
}
```

---

## Tests obligatorios

1. Rechaza CSV no string.
2. Rechaza CSV mayor de 1 MB.
3. Rechaza keyColumn inexistente.
4. Detecta solo en A.
5. Detecta solo en B.
6. Detecta filas modificadas.
7. Detecta columnas solo en un CSV como diferencias.
8. Detecta duplicados en A.
9. Detecta duplicados en B.
10. Soporta valores entrecomillados con comas.
11. Soporta comillas escapadas.
12. Calcula summary.

---

## Frontend

Ruta:

```txt
/tools/csv-compare
```

La UI debe incluir:

- textarea para CSV A;
- textarea para CSV B;
- selector/input de columna clave;
- boton `Compare CSVs`;
- resumen;
- tablas para solo en A, solo en B, modificados y duplicados.

---

## Criterios de aceptacion

1. Backend modular implementado.
2. Tests Vitest pasan.
3. `cd server && npm run build` pasa.
4. Frontend registrado en Dashboard y Sidebar.
5. `cd client && npm run build` pasa.
6. Tools anteriores siguen funcionando.
