# API reutilizable de WebTools

`src/module.ts` es la entrada del módulo para anfitriones Node, incluido Next.js. No importa Express ni inicia un servidor. Los controladores del modo independiente usan `src/http.ts` para convertir esta misma respuesta al formato de Express.

```ts
const result = await dispatchWebToolsRequest("html-refactor/extract", {
  html: '<a href="/hello">Hello</a>',
  attribute: "href",
});
// { status: 200, body: { values: ["/hello"] } }
```

El anfitrión debe aceptar únicamente POST con JSON, limitar el cuerpo **antes de parsearlo** a `WEBTOOLS_MAX_BODY_BYTES` (2 MiB), impedir caché de respuestas y devolver `result.body` con `result.status`. No debe pasar cookies ni credenciales a URLs analizadas. Los límites propios de cada herramienta y sus mensajes de validación se conservan. El módulo requiere Node; no es compatible con Edge.

| Endpoint relativo | Entrada |
| --- | --- |
| `html-refactor/extract` | `html`, `attribute` |
| `html-refactor/replace` | `html`, `attribute`, `replacements` |
| `form-inspector/analyze` | `html` |
| `lead-csv-cleaner/clean` | `csv`, `keyColumn` |
| `url-status-checker/inspect` | `urls` |
| `payload-inspector/analyze` | `json` (texto JSON) |
| `csv-compare/compare` | `csvA`, `csvB`, `keyColumn` |
| `tracking-inspector/analyze` | `html` |
| `campaign-preflight/check` | `html`, `urls` opcional |

Las entradas incorrectas producen 400, las rutas desconocidas 404 y los errores inesperados 500 con un mensaje genérico que no expone detalles internos. Los errores de una URL se devuelven dentro de su resultado sin impedir analizar las demás. `src/module.test.ts` contiene entradas y resultados de referencia de las nueve operaciones.

Payload Inspector admite hasta 1 MiB, 128 niveles de contenedores y 50.000 nodos JSON. La profundidad y el tamaño de la estructura se validan sin recursión antes de construir ejemplos, para evitar bloqueos o desbordamientos de pila en el proceso compartido.

## Peticiones a webs públicas

El comprobador y Campaign Preflight comparten los siguientes límites por proceso:

- 50 URLs por lote, 2.048 caracteres por URL y cinco redirecciones.
- Cuatro lotes activos, cuatro URLs simultáneas por lote. Al alcanzar la capacidad se devuelve 503 con un mensaje para volver a intentar; no se acumula una cola de solicitudes.
- Diez segundos por URL, incluyendo DNS y toda su cadena de redirecciones; cinco segundos por resolución DNS y treinta segundos por lote. Las URLs pendientes al agotar el tiempo se conservan en orden con `Request timed out.`.
- Solo se reciben estado y cabeceras (máximo 16 KiB). El cuerpo y la conexión se liberan inmediatamente. Se mantiene GET porque algunas webs redirigen de forma diferente con HEAD.

Cada salto valida protocolo, credenciales embebidas y todas las direcciones DNS devueltas. Las direcciones locales, privadas, reservadas y de transición que pueden representar destinos internos se bloquean, incluidas las formas IPv4 dentro de IPv6. La conexión usa únicamente esas direcciones verificadas, manteniendo el nombre original para Host y TLS. No hay una segunda resolución DNS entre la validación y la conexión ni reutilización de una conexión previa. Se usan [`http.request` con resolución controlada](https://nodejs.org/api/http.html#httprequesturl-options-callback) y [`net.BlockList`](https://nodejs.org/api/net.html#class-netblocklist).

Los límites son locales al proceso: si el despliegue tiene varias instancias, cada una tiene su propia capacidad. No sustituyen una cuota distribuida. Las webs que rechacen robots o no sean accesibles desde el servidor pueden devolver errores normales del comprobador.

## Verificación

Desde la raíz del repositorio:

```sh
npm --prefix server run build
npm --prefix server test -- --run
```

Las pruebas cubren contratos de las ocho herramientas, validaciones, exportación CSV, políticas de direcciones, conexión DNS fijada, redirecciones, tiempos y concurrencia. La integración de RosadoOS debe añadir comprobaciones HTTP y de navegador en su propio contexto de ruta y estilos.
