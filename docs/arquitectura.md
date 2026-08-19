# Arquitectura, a alto nivel

Este documento cuenta cómo está montado Sole Hand por dentro, sin entrar en el código de producción, que es privado. El objetivo es que se entienda el criterio: cada pieza está donde está por una razón.

## El mapa

```
                        ┌──────────────────────────────┐
   visitante ──────────►│  Web pública (solehand.com)  │
                        │  React 18 + Vite + TS        │
                        │  ES en raíz · EN en /en/     │
                        └──────────────┬───────────────┘
                                       │ formulario
                                       ▼
                        ┌──────────────────────────────┐
                        │  Servicio de leads (Node)    │
                        │  valida, avisa al equipo y   │
                        │  responde al interesado      │
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

## El agente de voz

El agente atiende el teléfono entrante de un negocio y su diseño tiene una frontera deliberada: **recoge y entrega, no decide**. Toma la cita completa (nombre, motivo, hora preferida) y la deja lista para que una persona la pase a la agenda en dos clics. No escribe en la agenda del negocio.

Dos obligaciones legales están dentro del diseño desde el primer día:

- Se presenta como asistente virtual nada más descolgar, como exige el artículo 50 del Reglamento Europeo de Inteligencia Artificial, aplicable desde el 2 de agosto de 2026.
- El diseño exige que las llamadas se procesen en infraestructura europea y que con cada negocio se firme el contrato de encargado del tratamiento del artículo 28 del RGPD. El negocio decide qué se graba y cuánto se guarda.

## El sistema de creatividades

Las piezas para redes no se hacen a mano una a una: salen de un sistema de composición propio que usa la fotografía y la tipografía reales de la marca, así que cada publicación sale del mismo molde que la web.
