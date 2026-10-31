# Hong Kong Medellín

Web de Casa Hong Kong y Restaurante Hong Kong, con app independiente de solicitudes de pedido por WhatsApp. Next.js 16, React 19, TypeScript y Tailwind 4.

## Ejecutar y verificar

Node.js 22.18+ o 24 recomendado (tests usan TypeScript nativo).

```sh
npm ci
npm run dev
npm run typecheck
npm run build -- --webpack
node --test tests/order.test.mjs
```

Abrir http://localhost:3000. Producción local: `npm start` después de compilar.

## Rutas

- `/`: presentación de las sedes, destacados y contactos.
- `/pedidos`: catálogo, tamaños, carrito por sede, recogida/domicilio, datos, revisión y solicitud por WhatsApp.
- `/privacidad`: explicación del tratamiento del formulario y el enlace externo.

## Flujo disponible

Casa Hong Kong: 25 entradas de carta (platos principales, variantes cerdo/jamón separadas y promoción de 2 lumpias), tamaños/precios del PDF aportado. Las promociones combinadas de cajas/pollo/bebida del PDF no están incorporadas a la selección. El cliente elige productos, completa sus datos, revisa el total estimado y decide compartirlos con el WhatsApp +57 300 4585451. El enlace abre el chat con el mensaje preparado: el cliente debe enviarlo y acordar disponibilidad, total, forma de pago y entrega con la sede. La web no marca el pedido como aceptado ni procesa pagos.

Restaurante Hong Kong: no tiene catálogo ni canal de WhatsApp confirmados. Se muestra contacto de llamada 304 3450995, sin productos ficticios ni envío al canal de otra sede.

## Reglas iniciales de domicilio

Definidas a petición del usuario como propuesta inicial. Editar `app/order-config.ts`:

- Barrios: Calasanz, Los Colores, Estadio, La Floresta y Laureles.
- Tarifa estimada: $6.000 COP.
- Mínimo en productos: $25.000 COP (el domicilio no cuenta para alcanzarlo).
- Horario de referencia: 11 a. m. a 9 p. m., sin garantía de apertura. El chat confirma atención.
- Otro barrio puede solicitar validación; no se garantiza cobertura.

La interfaz y el mensaje aclaran que cobertura según dirección, precios vigentes, tarifa final, horario y entrega deben confirmarse con la sede. Estas reglas no se presentan como verificadas por el restaurante. No se cobra un pago anticipado basado en una estimación.

## Contenido y recursos

Carta de Casa Hong Kong y WhatsApp transcritos del PDF “Restaurante Chino.pdf” aportado por el usuario. Dirección: Carrera 80 #52-60, Medellín. Otra sede: Av. 80 #48-75 según capturas. Vigencia pendiente de confirmar. No se añadieron fechas ni hechos históricos. Se preservan los nombres por separado.

Seis imágenes generadas con image_gen, guardadas en `public/images/dishes/`, marcadas como ilustrativas. Los prompts están en `image-prompts.md`. Otros platos se presentan sin asignarles una fotografía que no les corresponde. La fotografía original de referencia en `public/images/rice.jpg` se conserva, pero ya no se usa en el inicio.

## Datos y operación

Carrito y datos solo en memoria del navegador; no persisten al recargar. No se guardan en base de datos ni en almacenamiento local. Al abrir WhatsApp, el servicio recibe los datos incluidos en su URL, con autorización explícita del cliente en la pantalla de revisión. El TXT descargado contiene esos mismos datos. No hay panel de administración, cuentas, pagos ni seguimiento automático: la operación se gestiona en el chat y la carta/configuración se actualizan en el repositorio.

Metadatos, idioma español, accesos de teclado, foco visible, texto alternativo y movimiento reducido. Indexación desactivada mientras se validan datos del negocio.

## Publicación

Repositorio activo: https://github.com/yecos/Casa-Hong-Kong, rama main.

Proyecto existente de Vercel: hong-kong-medellin. URL: https://hong-kong-medellin.vercel.app. El push a main dispara el despliegue. `vercel.json` usa Next.js con Webpack.

## Verificación del flujo

Pruebas de tarifa/mínimo/recogida y codificación del enlace de WhatsApp. Compilación y TypeScript. Prueba de navegador con datos ficticios: agregar arroz Mini ($25.000), domicilio en Calasanz, estimado $31.000, revisión, botón de WhatsApp desactivado sin autorización y activado después de marcarla. No se envió ningún pedido de prueba ni se abrió WhatsApp con datos de clientes.
