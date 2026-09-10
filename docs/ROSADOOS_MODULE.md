# WebTools como módulo de RosadoOS

Este repositorio conserva la fuente de verdad de WebTools Platform. Funciona de forma independiente con Vite + Express y permite reutilizar su UI y sus servicios dentro de RosadoOS sin ejecutar otro servidor Express.

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

Este repositorio heredó dependencias versionadas en `server/node_modules`. Las instalaciones pueden ensuciar el checkout; el exportador comprometido exige un checkout limpio, por lo que debe ejecutarse antes de instalar o desde otro checkout del mismo SHA. Su allowlist excluye siempre esa carpeta.

## Actualización del despliegue combinado

`.github/workflows/validate-and-notify.yml` valida cada PR/push a `main`. En `main`, después de pasar los checks, envía `repository_dispatch` al repositorio privado `monlaurosado/RosadoOS`, incluyendo el SHA exacto. El anfitrión importa, valida la combinación y promociona una rama exclusiva de despliegue. Si la validación combinada falla, la versión publicada anterior se conserva.

Activación pendiente: configurar en Actions el secreto `ROSADOOS_DISPATCH_TOKEN`, un fine-grained PAT limitado a RosadoOS con `Contents: Read and write`, o un token vigente de una GitHub App con ese permiso. El token automático de este repositorio no tiene permisos sobre RosadoOS. Este script no crea/renueva tokens; si se usa PAT, controlar su caducidad. No añadirlo a `.env`, código ni Hostinger.

La rama de publicación de RosadoOS es `deploy/hostinger`, una vez activada y seleccionada en Hostinger. `main` de este repositorio sigue siendo la fuente del módulo. El despliegue standalone actual se conserva; no se modifica ni elimina con estos workflows.

La documentación operativa completa, con activación, rollback y nuevos módulos, vive en `docs/PROJECT_MODULES.md` de RosadoOS. Este trabajo prepara el enlace; la entrega automática remota debe comprobarse después de configurar los permisos y la rama de Hostinger.
