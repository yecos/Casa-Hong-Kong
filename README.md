# Casa Hong Kong y Restaurante Hong Kong

Web gastronómica y app de solicitudes con catálogo administrable, registro persistente y seguimiento. Next.js 16 + React 19 + Tailwind 4 + Postgres en Neon + Managed Better Auth.

## Uso

- Inicio: https://hong-kong-medellin.vercel.app
- Pedidos: https://hong-kong-medellin.vercel.app/pedidos
- Panel privado: https://hong-kong-medellin.vercel.app/admin
- Información del formulario: `/privacidad`

El panel permite gestionar **Casa Hong Kong**. Restaurante Hong Kong conserva contacto telefónico; no se inventó su carta ni su WhatsApp.

## Entrar al panel

Ingresa tu correo autorizado en `/admin/ingresar`, solicita un código y escríbelo al recibirlo. No hay contraseña predeterminada ni registro abierto con privilegios. La autorización se comprueba también en cada API. La lista de correos permitidos vive solo en la variable de servidor `ADMIN_EMAILS`. La cuenta inicial corresponde al propietario de este proyecto.

### Pedidos

Las solicitudes registradas aparecen como pendientes, aunque el cliente todavía no haya enviado el mensaje por WhatsApp. Confirma con él disponibilidad, precios, forma de pago y entrega antes de marcar Confirmado. Estados: pendiente → confirmado → preparando → listo → en camino (domicilio) → entregado; cancelación permitida antes de entrega. Los estados terminales no se reabren. Los cambios se registran con cuenta y fecha.

La lista presenta las últimas 100 solicitudes; permite ver activas, todas, entregadas o canceladas y actualiza cada 30 segundos mientras está visible.

### Carta y agotados

Edita descripción, categoría, precios únicos o por tamaño, y disponibilidad. Puedes agregar platos y escoger una de las imágenes ilustrativas existentes. Los cambios concurrentes requieren actualizar para evitar sobrescribir ediciones ajenas. La web vuelve a validar el precio y la disponibilidad al registrar.

### Domicilios

Puedes pausar/reabrir solicitudes, editar barrios, tarifa estimada, mínimo, horario de referencia, mensaje de pausa y WhatsApp de Casa Hong Kong. La cobertura por dirección y el precio final se acuerdan por chat. No hay confirmación automática de horario real.

## Flujo del cliente

1. Elige productos y tamaños de Casa Hong Kong.
2. Completa recogida/domicilio y datos.
3. Revisa el estimado y decide autorizar el registro y uso de datos.
4. Registra la solicitud: se guarda una sola vez y recibe referencia y enlace privado de seguimiento.
5. Abre WhatsApp y envía el mensaje preparado.
6. La sede confirma por chat y actualiza el estado en el panel.

Registrar no equivale a haber enviado WhatsApp, aceptar el pedido ni cobrar. La web no verifica que el mensaje se envió. El seguimiento muestra referencia, estado y estimado, sin nombre, teléfono ni dirección. El enlace es privado por token; guardarlo y no compartirlo. No hay pagos en línea ni notificaciones automáticas.

## Datos de origen y reglas iniciales

25 entradas de carta (principales, cerdo/jamón separados y dos lumpias) de Casa Hong Kong según el PDF aportado. Las promociones de cajas/pollo/bebida no están en la selección. Precios y disponibilidad iniciales deben validarse con la sede. Dirección: Carrera 80 #52-60; WhatsApp 300 4585451. Otra sede: Av. 80 #48-75 y teléfono 304 3450995 según capturas.

A solicitud del usuario se definieron valores iniciales: Calasanz, Los Colores, Estadio, La Floresta y Laureles; domicilio estimado $6.000, mínimo de productos $25.000, horario de referencia 11 a. m. a 9 p. m. No son datos verificados con la sede y se muestran sujetos a confirmación.

Seis imágenes creadas con image_gen, marcadas como ilustrativas, en `public/images/dishes/`. Prompts en `image-prompts.md`. Otros platos no reciben imágenes de platos distintos. No se inventaron fechas ni historia familiar.

## Desarrollo

Node 22.18+ o 24/26.

```sh
npm ci
npm run dev
npm test
npm run typecheck
npm run build -- --webpack
```

Variables privadas de servidor, nunca en Git:

- `DATABASE_URL`: conexión pooled de la rama apropiada.
- `NEON_AUTH_BASE_URL`: URL Managed Auth.
- `NEON_AUTH_COOKIE_SECRET`: secreto de cookies de 32 caracteres o más.
- `ORDER_TOKEN_SECRET`: secreto independiente para enlaces de seguimiento.
- `ADMIN_EMAILS`: correos administrativos separados por comas.

`node --env-file=.env.local scripts/setup-db.mjs` aplica el esquema aditivo y semillas sin sobrescribir configuración existente. Usar conexión directa para migraciones, primero en desarrollo. No ejecutar scripts de verificación contra producción.

## Infraestructura

Proyecto Neon nuevo: `hong-kong-pedidos` (`aged-wind-17221122`) en NEXO STUDIO. Rama de producción `br-tiny-flower-b7raqhy6`; rama aislada de desarrollo `br-floral-fog-b7rg5bpc`. No se usaron bases anteriores de otros proyectos.

Vercel existente: `hong-kong-medellin` (`prj_Pp3pspo8htRYXAB2KqjP2zjc4Cna`). Repositorio activo: https://github.com/yecos/Casa-Hong-Kong, rama main. Secretos configurados en el entorno production del proyecto existente. Las previews carecen de acceso a producción por defecto: no habilitarles esos secretos sin elegir una rama de prueba.

Si no se puede cargar la base, la carta informa el problema y no permite registrar solicitudes con precios de respaldo. Indexación sigue desactivada hasta validar los datos del negocio.

## Verificación

11 pruebas unitarias: totales, mínimo, precios manipulados o desactualizados, pausa, agotados, validación de datos, consentimiento, duplicados, autorización y transiciones.

12 pruebas de integración en la rama aislada: API administrativa denegada sin sesión, bloqueo de correos no autorizados sin enviar códigos, catálogo conectado, registro con referencia, reintentos idempotentes, seguimiento por token sin datos de contacto y rechazo de pausa/agotados.

Compilación de producción y TypeScript. La primera verificación humana del código recibido por correo debe completarla el propietario al iniciar sesión; no se enviaron mensajes de prueba al restaurante ni se generaron contraseñas para el propietario.
