# Casa Hong Kong y Restaurante Hong Kong

Web local en Next.js 16 (App Router), React 19, TypeScript y Tailwind CSS 4. Sin publicación ni servicios externos de pedidos. Las imágenes están guardadas en el proyecto.

## Ejecutar

Requiere Node.js 20.9 o superior.

```sh
npm ci
npm run dev
```

Abrir http://localhost:3000. Para producción local: `npm run build` y `npm start`. Verificar tipos: `npm run typecheck`.

## Contenido y fuentes

Se recuperaron las dos capturas adjuntas del chat «Diseño web gastronómico». El mockup generado no estuvo disponible; la composición interpreta el estilo Herencia oriental solicitado.

- Casa Hong Kong: captura con dirección Av. 80 #5260, normalizada visualmente como Av. 80 #52-60. Teléfono transcrito: 44212138. Tiene ocho dígitos; NO se normaliza ni se habilita para llamar hasta confirmarlo.
- Restaurante Hong Kong: Av. 80 #48-75. Teléfono 304 3450995; enlace de llamada +573043450995.
- Direcciones y contactos proceden de las capturas y deben reconfirmarse. No se usan estados de apertura, calificaciones ni horarios de las capturas como datos vigentes.
- Relación familiar y ciudad: información aportada por el usuario. No se añadieron fechas, fundadores ni hechos históricos.
- Carta, precios, ingredientes, cobertura, horarios y WhatsApp: pendientes de confirmar. El área de platos es una selección ilustrativa claramente marcada.
- Foto gastronómica de referencia: https://images.unsplash.com/photo-1512058564366-18510be2db19. No representa un plato real de los restaurantes. Sustituir con fotografía autorizada del negocio antes del lanzamiento.

## Funcionalidad

Navegación por secciones, enlaces individuales de ubicación en Google Maps, contacto por sede y llamada para el móvil confirmado en la captura. Casa Hong Kong conserva contacto informativo sin enlace de llamada por su numeración ambigua. Sin formulario ficticio ni pedidos simulados.

## Accesibilidad y SEO

HTML semántico, idioma español, enlace para saltar al contenido, títulos jerárquicos, textos alternativos, foco visible y reducción de movimiento. Diseño adaptable a móvil y escritorio. Metadata de título, descripción y Open Graph. `robots` está en noindex/nofollow para esta propuesta; al publicar, configurar dominio, canonical, sitemap, imágenes sociales e indexación. No se inventa dominio de producción.

## Verificación

Compilación de producción y revisión de tipos realizadas. Vista de escritorio inspeccionada en navegador local. La vista móvil tiene reglas responsive, pero no fue comprobada con emulación de dispositivo en esta sesión.

## Archivos principales

- app/page.tsx: contenido, sedes y enlaces.
- app/globals.css: estilo y reglas responsive.
- app/layout.tsx: idioma y metadata.
- public/images/rice.jpg: foto local.

No se ha publicado.

## Sección de pedidos

Nueva sección `#pedidos`, implementada en `app/orders.tsx`: elección de sede, filtros por categoría, carrito con cantidades limitadas a 20 por producto, eliminación de productos, subtotal COP, recogida o domicilio, observaciones y descarga de resumen TXT. Estado temporal en memoria; no se conserva al recargar. El cambio de sede mantiene la selección de ejemplo y se indica en pantalla.

Los productos y precios son datos de demostración explícitos. No hay envío real, cobro, recogida de datos personales, recepción de pedidos ni panel de administración. Para habilitar operación real hacen falta carta y disponibilidad por sede, precios, cobertura/tarifa de entrega, horarios y un canal de pedidos validado. El resumen descargado se identifica como borrador no enviado.

Verificación de esta sección: TypeScript correcto, compilación de producción con `npx next build --webpack` y prueba en navegador de agregar producto, aumentar cantidad, cambiar sede, elegir domicilio y revisar subtotal/resumen. Turbopack encontró una restricción del entorno al abrir un puerto interno; Webpack compiló correctamente.
