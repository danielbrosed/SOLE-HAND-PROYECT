# Arquitectura, a alto nivel

Este documento cuenta cómo está montado Sole Hand por dentro, sin entrar en el código de producción, que es privado. El objetivo es que se entienda el criterio: cada pieza está donde está por una razón.

## El mapa

```
                        ┌──────────────────────────────┐
   visitante ──────────►│  Web pública (solehand.com)  │
                        │  React 18 + Vite + TS        │
                        │  ES en raíz · EN en /en/     │
                        └───────┬──────────────┬───────┘
                                │ formulario   │ registro
                                ▼              │
                 ┌──────────────────────────┐  │
                 │  Servicio de leads (Node)│  │
                 │  valida, avisa al equipo │  │
                 │  y responde              │  │
                 └──────────────────────────┘  │
                                               ▼
                        ┌──────────────────────────────┐
     socio ────────────►│  Plataforma (app.solehand)   │
                        │  comunidad · herramientas    │
                        │  cuenta · portal de afiliado │
                        └──────────────┬───────────────┘
                                       ▼
                        ┌──────────────────────────────┐
                        │  Backend propio (Europa)     │
                        │  PostgreSQL con políticas    │
                        │  por fila · funciones borde  │
                        └──────────────────────────────┘

   cliente que llama ──► Agente de voz ──► resumen de llamada al negocio
```

Web y servicio de leads son contenedores independientes detrás de nginx, en un VPS propio. Si el servicio de leads se cae, la web sigue en pie y el formulario tiene una salida alternativa: nunca se queda sin puerta.

## Decisiones y por qué

**Una sola página, sin router.** La web vende una cosa y cuenta una historia de arriba abajo. Un router habría añadido peso y complejidad para resolver un problema que no existía. Las secciones se navegan con anclas.

**Cada idioma tiene su URL, decidida en build.** Un script genera en build la ruta `/en/` con su propio HTML: título, descripción, canónica, datos estructurados y hreflang en inglés. La aplicación lee el idioma de la ruta al arrancar, así que no hay selector que adivine nada ni contenido que cambie después de pintarse.

**El copy es parte del sistema.** Todo el texto vive en módulos tipados, uno por idioma. Cambiar una frase es tocar un dato, no buscar cadenas sueltas por los componentes. Encima hay reglas de redacción escritas que el código respeta: frases que entienda cualquiera, sin tecnicismos y sin promesas que no se puedan cumplir.

**El dato del cliente no pasa por plataformas de marketing.** El formulario entrega a un servicio propio. Ese servicio valida, manda el acuse al interesado y avisa al equipo con lo mínimo para reaccionar; los detalles del interesado viajan únicamente por el correo de la empresa. En la web no hay cookies de rastreo.

**Seguridad por defecto.** Cabeceras configuradas a mano en nginx (política de contenido, marcos, referrer), HTML servido sin caché para poder corregir rápido, y el correo de la empresa fuera del HTML servido: los robots que rastrean direcciones eran la fuente del spam, así que la única puerta escrita es el formulario.

**Docker para que el despliegue sea aburrido.** Build reproducible, misma imagen en local y en el servidor, y el VPS solo ejecuta contenedores.

## La plataforma de socios

**El alta no tiene cola.** Durante los primeros meses se entraba con solicitud: alguien la leía y mandaba una invitación. Funcionaba, pero cada alta costaba una decisión y un correo, y quien quería entrar esperaba. Desde el 24 de agosto de 2026 el registro es directo —socio o afiliado, contraseña propia y dentro—, y el formulario de contarnos el caso sigue existiendo para quien prefiere hablar antes. Lo que antes filtraba una persona lo filtran ahora un campo trampa para robots, un límite por dirección y el consentimiento obligatorio.

**La separación la decide la base de datos, no la pantalla.** Cada tabla lleva políticas a nivel de fila: qué puede leer un socio, qué puede leer el equipo y qué no puede leer nadie está escrito en el motor, no en el código que pinta. Una pantalla mal programada puede enseñar algo de menos; no puede enseñar algo de más. Las operaciones que necesitan privilegio viven en funciones en el borde, y la clave con permisos nunca llega al navegador.

**El consentimiento se guarda entero, no marcado.** Al aceptar las condiciones se guarda la versión, el texto íntegro de esa versión, la fecha y la dirección desde la que se aceptó. Cambiar el texto obliga a subir la versión: el histórico no se reescribe, de modo que siempre se puede saber qué aceptó exactamente cada persona.

**Borrar es borrar, sin dejar huecos.** Una cuenta se puede retirar de verdad: se le quita el nombre, la foto, las redes y el acceso, y el correo se sustituye por uno inválido. Lo que esa persona escribió en la comunidad se queda, sin su nombre. Borrarlo dejaría a medias las conversaciones de los demás, que no han pedido nada.

**El sistema de diseño se verifica solo.** Los colores y los tamaños salen de una escala única, y hay comprobaciones que tumban el build si alguien se sale: ningún color fuera de la paleta, ninguna medida inventada, ninguna esquina que no venga de la escala. Los contrastes se recalculan en cada pasada contra el mínimo de accesibilidad, y antes de cada despliegue se recorren todas las pantallas en un navegador de verdad buscando desbordes, errores de consola y zonas de toque demasiado pequeñas para un dedo.

## El agente de voz

El agente atiende el teléfono entrante de un negocio y su diseño tiene una frontera deliberada: **recoge y entrega, no decide**. Toma la cita completa (nombre, motivo, hora preferida) y la deja lista para que una persona la pase a la agenda en dos clics. No escribe en la agenda del negocio.

Dos obligaciones legales están dentro del diseño desde el primer día:

- Se presenta como asistente virtual nada más descolgar, como exige el artículo 50 del Reglamento Europeo de Inteligencia Artificial, aplicable desde el 2 de agosto de 2026.
- El diseño exige que las llamadas se procesen en infraestructura europea y que con cada negocio se firme el contrato de encargado del tratamiento del artículo 28 del RGPD. El negocio decide qué se graba y cuánto se guarda.

## El sistema de creatividades

Las piezas para redes no se hacen a mano una a una: salen de un sistema de composición propio que usa la fotografía y la tipografía reales de la marca, así que cada publicación sale del mismo molde que la web.
