# 0009 - Tool Webhook / API Payload Inspector

## Objetivo

**Webhook / API Payload Inspector** permite pegar un payload JSON y extraer una
vista estructurada de paths, tipos, ejemplos y warnings. La tool esta orientada
a debugging de webhooks, integraciones, APIs, CRMs y automatizaciones.

---

## Alcance MVP

Incluye:

- pegar JSON;
- validar JSON;
- detectar tipo raiz;
- extraer paths;
- detectar tipos por path;
- mostrar ejemplos de valor;
- detectar arrays;
- detectar arrays con tipos mezclados;
- generar mapping legible.

No incluye:

- llamadas HTTP;
- validacion contra JSON Schema;
- generacion de codigo;
- persistencia;
- comparacion entre payloads;
- autenticacion;
- base de datos.

---

## Endpoint

```txt
POST /api/tools/payload-inspector/analyze
```

### Request

```json
{
  "json": "{\"event\":\"lead.created\",\"lead\":{\"email\":\"test@example.com\"}}"
}
```

### Response

```json
{
  "rootType": "object",
  "fields": [
    {
      "path": "event",
      "type": "string",
      "example": "lead.created"
    },
    {
      "path": "lead.email",
      "type": "string",
      "example": "test@example.com"
    }
  ],
  "summary": {
    "totalFields": 2,
    "objects": 1,
    "arrays": 0,
    "scalars": 2
  },
  "warnings": []
}
```

---

## Reglas de negocio

1. `json` es obligatorio y debe ser string.
2. El tamano maximo es 1 MB.
3. El JSON debe parsearse con `JSON.parse`.
4. No se debe ejecutar contenido.
5. No se deben hacer llamadas externas.
6. Los paths de objetos usan punto: `lead.email`.
7. Los paths de arrays usan `[]`: `items[].id`.
8. Los arrays de objetos deben inspeccionarse combinando paths de sus elementos.
9. Si un mismo path aparece con varios tipos, el tipo debe representarse como
   union ordenada, por ejemplo `number|string`.
10. El primer valor no vacio encontrado se usa como ejemplo.
11. Los objetos y arrays cuentan en summary.
12. Los valores `null` deben reportarse como tipo `null`.

---

## Warnings

| Codigo | Condicion |
| --- | --- |
| `mixed_array_types` | Un array contiene elementos de distintos tipos. |
| `empty_array` | Un array no contiene elementos. |

---

## Tests obligatorios

1. Rechaza `json` no string.
2. Rechaza JSON mayor de 1 MB.
3. Rechaza JSON mal formado.
4. Detecta tipo raiz object.
5. Extrae paths anidados.
6. Extrae arrays de objetos con `[]`.
7. Detecta tipos union para mismo path.
8. Detecta warning de array vacio.
9. Detecta warning de array con tipos mezclados.
10. Calcula summary.

---

## Frontend

Ruta:

```txt
/tools/payload-inspector
```

La UI debe incluir:

- titulo `Payload Inspector`;
- textarea para JSON;
- boton `Analyze payload`;
- resumen;
- warnings;
- tabla de paths, tipos y ejemplos.

---

## Criterios de aceptacion

1. Backend modular implementado.
2. Tests Vitest pasan.
3. `cd server && npm run build` pasa.
4. Frontend registrado en Dashboard y Sidebar.
5. `cd client && npm run build` pasa.
6. Tools anteriores siguen funcionando.
