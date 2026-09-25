<p align="center">
  <img src="media/marca.png" alt="Sole Hand" width="340">
</p>

<h3 align="center">Emprender ya no se hace solo.</h3>

<p align="center">
  <a href="https://solehand.com">solehand.com</a> · <a href="#español">español</a> / <a href="#english">english</a>
</p>

---

## Español

Sole Hand es una comunidad de emprendedores: gente que ya tiene un negocio y gente que quiere empezar. Detectamos los problemas de cada negocio y les damos solución, con las herramientas necesarias para emprender bien, rápido y de forma rentable. Nos vemos en persona y quien recomienda la comunidad cobra por ello.

Este repositorio es el escaparate público del proyecto: qué se está construyendo, en qué estado está y cómo está hecho por dentro, a nivel de arquitectura. El código de producción vive en repositorios privados. Aquí no hay precios: están en la web, que es donde se auditan.

![Portada de solehand.com](media/web-hero.jpg)

### Qué hay construido

#### La comunidad

Quien lleva años con su negocio y quien está montando el primero, en el mismo sitio. La conversación vive en grupos de WhatsApp por sector, las quedadas van incluidas en todas las membresías y cada evento lleva su ficha con lo que se lleva quien va. Las plazas se reservan desde la app por orden de reserva.

![Sección de la comunidad](media/web-comunidad.jpg)

#### Los eventos

Nos vemos en persona: eventos, formaciones, cenas de networking y retiros. Cada uno se publica desde un único fichero de contenido tipado, de modo que una ficha sin fecha, sin lugar o sin las membresías que la incluyen no compila. En la portada, un reel con grabaciones reales de los encuentros; debajo, dónde hemos estado ya.

![Sección de eventos](media/web-eventos.jpg)

![Página de eventos](media/web-eventos-pagina.jpg)

#### La Sole Hand App

La comunidad en el móvil: la plaza en los eventos, la cuenta y el grupo de cada socio y, para quien recomienda, su portal. La conversación no vive ahí, vive en WhatsApp, y así se dice.

![Sección de la app](media/web-app.jpg)

Por dentro es un backend propio en un servidor europeo: cada dato está protegido por políticas a nivel de fila, de modo que la separación entre lo que puede ver un socio y lo que no la decide la base de datos y no la pantalla. Cada cobro genera su factura; el consentimiento de las condiciones se guarda con su versión íntegra, la fecha y la dirección desde la que se aceptó; y una cuenta se puede borrar de verdad.

#### Sole Hand Scale

El programa de seis meses para quien empieza: grupo pequeño, sesión de grupo semanal, mastermind y reunión a solas cada mes, y los eventos del semestre. Las herramientas de inteligencia artificial se construyen aquí, a medida para el negocio de cada uno: primero el problema, después la herramienta. Con fecha de inicio y de fin, sin permanencia y con una garantía de resultados que se revisa a los 90 días con un comité de socios y un founder.

![Página del programa](media/web-scale.jpg)

#### Recomienda y cobra

Recomendar es gratis, no exige ser socio y se cobra solo por membresías que se pagan y se usan. Las reglas están escritas y a la vista, y hay un aviso claro: lo que se cobra depende de a quién se traiga y de que se quede.

![Página de recomendar](media/web-afiliados.jpg)

#### La web

Trilingüe: español, inglés y una variante para México, cada una con su URL, sus metadatos y sus datos estructurados generados en build. Prerrenderizada entera para que los rastreadores que no ejecutan JavaScript la lean. Y con guardas que rompen el build si el copy contradice la marca, si un precio no cuadra con lo que cobra la app o si un color baja del contraste mínimo.

| Móvil | Inglés | La página /hablamos |
| --- | --- | --- |
| ![Versión móvil](media/web-movil.jpg) | ![Home en inglés](media/web-en.jpg) | ![Formulario de contacto](media/web-hablamos.jpg) |

En el móvil la web se midió con un guion propio que abre un teléfono emulado, recorre la página por pantallas y calcula cuánto negro puro hay en cada una. La dirección de arte es oscura a propósito, pero media página en negro no es dirección de arte, es una pantalla vacía: ahí entraron los halos verdes y los recortes verticales.

![La comunidad en el móvil](media/web-movil-comunidad.jpg)

### La marca

El manual de marca es público y está en la web: [solehand.com/marca](https://solehand.com/marca). Paleta, tipografías, usos del logotipo y descargas, generado desde los mismos tokens que pinta la web, para que no puedan divergir.

![Manual de marca](media/web-marca.jpg)

### Contenido

Las piezas de redes salen de un sistema de composición propio: el texto y sus fuentes viven en un guion en JSON, un validador comprueba que ninguna palabra contradiga la marca y que ningún importe se haya escrito a mano, y el render se hace con el navegador a tamaño nativo, con las fuentes reales incrustadas.

![Carruseles del feed](media/social-carruseles.jpg)

![Destacadas del perfil](media/social-destacadas.jpg)

Los vídeos se montan con una cadena propia sin licencias: transcripción local, capa gráfica animada renderizada fotograma a fotograma desde HTML y composición final sin tocar el metraje original, que se entrega tal y como salió de la cámara.

### Estado del proyecto

Actualizado a 25 de septiembre de 2026.

| Módulo | Estado |
| --- | --- |
| Web pública trilingüe | En producción en solehand.com, con manual de marca publicado |
| Sole Hand App | En producción, ya con los eventos, el programa y el portal de quien recomienda |
| Comunidad | Abierta, con alta directa |
| Eventos | Fichas publicadas y reserva de plaza desde la app |
| Sole Hand Scale | En producción, con su cobro y su desistimiento de 14 días |
| Recomienda y cobra | Primer nivel en producción; el segundo, construido y apagado hasta cerrar su revisión legal |
| Herramientas de inteligencia artificial | Se construyen a medida dentro del programa, a partir del problema de cada negocio |
| Cobro con tarjeta y factura por cobro | En producción |
| Condiciones y textos legales | Publicados, pendientes de revisión de un abogado |

La bitácora completa, con los hitos fechados, está en [docs/bitacora.md](docs/bitacora.md).

### Cómo está hecho

Resumen rápido; el detalle está en [docs/arquitectura.md](docs/arquitectura.md).

- **Web:** React 18 + Vite + TypeScript, Tailwind CSS 4 y GSAP para el movimiento. Sin router: enrutado por expresiones regulares y una URL propia por idioma generada en build, con hreflang y sitemap. Prerrender con Playwright y cuatro auditorías en cada build (copy, precios, contraste y locale).
- **Sole Hand App:** React 18 + Vite + TypeScript, Tailwind CSS 4 y react-router, contra un backend propio autoalojado en Europa (PostgreSQL con políticas por fila, autenticación, funciones en el borde). Aplicación web instalable. Cobro con tarjeta y factura automática por cada cobro.
- **Leads:** servicio propio en Node, separado de la web, que recibe el formulario, avisa al equipo y responde al interesado.
- **Contenido:** sistema propio de composición de imagen y vídeo sobre el navegador (Playwright y GSAP) más ffmpeg y transcripción local, sin licencias de terceros.
- **Infraestructura:** contenedores Docker detrás de nginx en un VPS propio, con cabeceras de seguridad configuradas a mano y HTML sin caché.
- **Cumplimiento desde el diseño:** las herramientas se presentan como asistentes, como exige el artículo 50 del Reglamento Europeo de IA; los datos se procesan en infraestructura europea; la web no usa cookies de rastreo; 14 días de desistimiento y baja en un clic.

### Dirección de arte

Negro, crema y una rampa de seis verdes: un tono, varios valores. El símbolo es un escudo con una mano abierta y las letras S y H trenzadas en el trazo, la mano que se tiende a quien llega solo. El mundo visual es el de un club privado mediterráneo: verde de pino y de pista, lino, arena y madera, fotografía con grano de película y una sola palabra en cursiva por titular.

El círculo abierto y la fotografía de mármol de la primera etapa se retiraron en septiembre de 2026: eran de otra idea y chocaban con lo que el proyecto es hoy.

### Recursos gratuitos

En [recursos/](recursos/) irán las guías, plantillas y pequeñas herramientas que el proyecto libere gratis. La regla es la de siempre: solo se publica lo que ya se ha usado de verdad por dentro.

### Contacto

El proyecto se puede ver funcionando en [solehand.com](https://solehand.com). Para hablar del proyecto, el formulario de [solehand.com/hablamos](https://solehand.com/hablamos).

---

## English

Sole Hand is a community of entrepreneurs: people who already run a business and people who want to start one. We find what is holding each business back and we solve it, with the tools needed to build well, fast and profitably. We meet in person, and whoever recommends the community gets paid for it.

This repository is the project's public showcase: what is being built, where it stands and how it is made, at architecture level. Production code lives in private repositories. There are no prices here: they live on the website, where they are audited.

### What is built

- **The community.** People with a running business and people building their first one, in the same place. The conversation lives in WhatsApp groups by sector, meetups are included in every membership, and every event has its own card with what attendees get. Seats are booked from the app on a first-come basis.
- **The events.** We meet in person: events, workshops, networking dinners and retreats. Each one is published from a single typed content file, so a card missing its date, its place or the memberships that include it does not compile.
- **The Sole Hand App.** The community on your phone: your seat at the events, your account and your group, and the portal for those who recommend. The conversation does not live there, it lives in WhatsApp, and we say so.
- **Sole Hand Scale.** The six-month programme for people starting out: a small group, a weekly session, a monthly mastermind and one-to-one, and the semester's events. The AI tools are built here, tailored to each business: problem first, tool second. Start and end dates, no lock-in, and a results guarantee reviewed at 90 days by a committee of members and a founder.
- **Recommend and earn.** Recommending is free, does not require membership and pays only on memberships that are paid for and used. The rules are written and visible, with a plain warning: what you earn depends on who you bring and on whether they stay.
- **The website.** Spanish, English and a Mexican variant, each with its own URL, metadata and structured data generated at build time. Fully prerendered so crawlers that do not run JavaScript can read it, with build guards that fail if the copy contradicts the brand, a price does not match what the app charges, or a colour drops below the minimum contrast.
- **The brand.** The brand manual is public at [solehand.com/marca](https://solehand.com/marca), generated from the same tokens the website paints with.

### How it is made

- **Website:** React 18 + Vite + TypeScript, Tailwind CSS 4 and GSAP. No router library: regex routing and one URL per language generated at build, with hreflang and sitemap. Playwright prerender and four audits on every build (copy, prices, contrast and locale).
- **Sole Hand App:** React 18 + Vite + TypeScript, Tailwind CSS 4 and react-router, against a self-hosted backend in Europe (PostgreSQL with row-level policies, auth, edge functions). Installable web app. Card payments with an automatic invoice per charge.
- **Leads:** a small Node service, separate from the site, that receives the form, alerts the team and replies to the person.
- **Content:** an in-house image and video pipeline built on the browser (Playwright and GSAP) plus ffmpeg and local transcription, with no third-party licences.
- **Infrastructure:** Docker containers behind nginx on our own VPS, hand-configured security headers and uncached HTML.
- **Compliance by design:** the tools introduce themselves as assistants, as Article 50 of the EU AI Act requires; data is processed on European infrastructure; the site uses no tracking cookies; 14-day withdrawal and one-click cancellation.

### Art direction

Black, cream and a ramp of six greens: one hue, several values. The symbol is a shield holding an open hand, with the letters S and H woven into its strokes: the hand you are offered when you arrive on your own. The visual world is a private Mediterranean club: pine and court green, linen, sand and wood, film grain, and a single italic word per headline. The open circle and the marble photography of the early days were retired in September 2026.

### Contact

See it running at [solehand.com](https://solehand.com). To talk about the project, the form at [solehand.com/hablamos](https://solehand.com/hablamos).

---

© 2026 Daniel Brosed. Este repositorio es material de portfolio; el código de producción no es público. / This repository is portfolio material; production code is not public.
