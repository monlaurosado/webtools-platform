# WebTools como módulo de RosadoOS

Este repositorio conserva la fuente de verdad de WebTools Platform. Funciona de forma independiente con Vite + Express y permite reutilizar su UI y sus servicios dentro de RosadoOS sin ejecutar otro servidor Express.

## Estado publicado · 10 de septiembre de 2026

La aplicación integrada está disponible en [davidrosado.es/projects/webtools-platform](https://davidrosado.es/projects/webtools-platform). La primera publicación se realizó manualmente a las 11:00, hora de Madrid, con WebTools [`6efb8f38`](https://github.com/monlaurosado/webtools-platform/commit/6efb8f38b140b134716f3e3b28cfc0dce02ff9a9) y el despliegue de RosadoOS [`8153b6a9`](https://github.com/monlaurosado/RosadoOS/commit/8153b6a90dd55b1433df16024588cbacedb9a6cc).

RosadoOS y WebTools comparten la misma aplicación de Hostinger, configurada con Node.js 22 y pnpm 11.6.0. El despliegue independiente anterior de WebTools se conserva; el estado registrado de la cuenta es de 4 de las 5 plazas de aplicaciones en uso. Este repositorio sigue manteniendo una única fuente de WebTools, válida tanto para su ejecución independiente como para la exportación generada al anfitrión.

La publicación inicial se comprobó con 44 verificaciones HTTP contra el dominio público, revisión de las ocho herramientas en la interfaz y el flujo de JSON en móvil. Estos resultados validan la versión publicada. La cadena completa de una actualización de este repositorio hasta su publicación automática en Hostinger todavía debe verificarse con una entrega posterior.

## Contrato

- `client/src/App.tsx`: aplicación React configurable con `basename`, `apiBasePath`, `hostHref` e idioma inicial. `main.tsx` y `standalone.css` montan la versión independiente.
- `server/src/module.ts`: `dispatchWebToolsRequest(endpoint, body)` valida la solicitud y ejecuta los servicios. Devuelve `{status, body}` sin depender de Express. Los controllers del servidor y el adaptador Next del anfitrión reutilizan este contrato.
- `module.manifest.json`: versión del contrato y dependencias exactas requeridas por el anfitrión. Un cambio de contrato o dependencia requiere revisar también el adaptador/lock del anfitrión; no publicar versiones incompatibles esperando que el anfitrión las adapte automáticamente.

RosadoOS importa solo los fuentes reutilizables desde un commit Git completo y limpio, incluyendo la licencia. No importa `node_modules`, builds, pruebas, entradas standalone ni wrappers Express. El destino `src/modules/webtools-platform/upstream` es generado; hacer los cambios aquí y regenerarlo, nunca arreglarlo a mano en el anfitrión.

## Validación standalone

```bash
npm ci --prefix client
npm ci --prefix server
npm --prefix client run lint
npm --prefix client run build
npm --prefix server run build
npm --prefix server test -- --run
```

Este repositorio heredó dependencias versionadas en `server/node_modules`. Las instalaciones pueden ensuciar el checkout; el exportador de commits exige un checkout limpio, por lo que debe ejecutarse antes de instalar o desde otro checkout del mismo SHA. Su lista permitida excluye siempre esa carpeta.

## Actualización del despliegue combinado

El enlace entre repositorios ya está configurado. `.github/workflows/production-readiness.yml` valida cada PR/push a `main`. En `main`, después de pasar `validate`, el job `notify-host` envía `repository_dispatch` con el evento `webtools-updated` al repositorio privado `monlaurosado/RosadoOS`, incluyendo el SHA completo del módulo.

El anfitrión importa ese commit, valida la combinación y genera la rama de publicación `deploy/hostinger`, conectada a la misma aplicación de Hostinger que sirve el portfolio. Las actualizaciones automáticas del módulo se promocionan en esa rama generada; este flujo no modifica `main` de RosadoOS. Si la validación combinada falla, la versión publicada anterior se conserva. `main` de este repositorio sigue siendo la fuente mantenida del módulo y su modo independiente continúa disponible.

### Credencial de notificación

El secreto de Actions `ROSADOOS_DISPATCH_TOKEN` está configurado con el fine-grained PAT **WebTools to RosadoOS**. Su acceso está limitado al repositorio `monlaurosado/RosadoOS`, con `Contents: Read and write` y `Metadata: Read-only`. El token automático de este repositorio no tiene permisos sobre RosadoOS.

El PAT caduca el **9 de diciembre de 2026**. Antes de esa fecha, renovar la credencial y actualizar el secreto `ROSADOOS_DISPATCH_TOKEN`, conservando el mismo alcance. El script no crea ni renueva tokens. El valor del token debe permanecer exclusivamente en el secreto de Actions; no se incluye en esta documentación, código, archivos `.env` ni configuración de Hostinger.

### Comprobación de la próxima entrega

La primera publicación fue manual; configurar la credencial y la rama no demuestra por sí solo el recorrido automático. Para cerrar esa comprobación, seguir una actualización real de `main` de WebTools y confirmar, en orden: validación standalone, `notify-host`, validación combinada en RosadoOS, actualización de `deploy/hostinger` y publicación automática de ese commit en el dominio público.

La documentación operativa completa, con activación, rollback y nuevos módulos, vive en `docs/PROJECT_MODULES.md` de RosadoOS.
