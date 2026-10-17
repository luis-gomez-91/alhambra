---
name: alhambra-landing
description: >-
  Builds and edits the Alhambra Shopping home as a static landing in HTML, CSS,
  and vanilla JS with Phosphor icons and motion. Use when creating or changing
  the landing, the home page, sections, layout, motion, or styles in this
  project, and when recreating that landing in Framer with the Framer MCP.
  Content comes only from plan-home.md and imagenes.md. The HTML landing is the
  source to replicate in Framer.
---

# Landing Alhambra Shopping

Página estática de una sola home. Stack fijo: HTML, CSS y JS puro. Sin frameworks, bundlers ni librerías de animación.

## Fuentes de contenido

Antes de escribir o cambiar markup, lee `plan-home.md` y `imagenes.md`.

- Hechos, nombres, fechas, horarios, filtros, enlaces, campos y avisos salen solo de `plan-home.md`.
- Cada archivo listado en `imagenes.md` debe aparecer en la home, servido desde `imagenes/`.
- Si un archivo ya tiene un rol en `plan-home.md`, úsalo ahí. Si está en `imagenes.md` y no tiene rol, colócalo en una sección existente (fondo, marca o decoración) sin inventar sección, titular ni texto para justificarlo.
- No añadas tiendas, restaurantes, eventos, patrocinios, rutas ni datos de contacto que no estén en el plan.
- Se puede reescribir un texto para que suene mejor. El significado, los datos y el contexto se mantienen. Ejemplo: «Registrate» puede pasar a «Regístrate»; la fecha y el evento no cambian.
- Meta title y meta description del plan van en el `<head>`.

Orden de la página, el de «Orden visual de la página» en `plan-home.md`: nav, horario, hero, próximamente, shopping, restaurantes, formulario, footer.

## Implementación

- Un `index.html`, un CSS y un JS. Imágenes con ruta relativa `imagenes/<archivo>`.
- Iconos solo de [Phosphor](https://phosphoricons.com/) por CDN (`@phosphor-icons/web`). Sustituyen chevrones, menú, cierre y campos. No sustituyen logos ni fotos del plan.
- En móvil el menú arranca cerrado, con el mismo logo.
- Shopping y Restaurantes: chips de filtro del plan y tarjetas de foto + logo. El nombre del local no va como texto, salvo que el plan lo escriba. El local 13 de Shopping no tiene logo separado.
- El formulario lista los campos del plan y no envía a un backend inventado.
- Los enlaces del nav y del footer apuntan a las rutas nombradas en el plan (`/ubicacion`, `/shopping`, `/restaurantes`, `/eventos`, `/salonauditorio`, `/contacto`). «Oficinas», «Locales» y «Blog» no tienen ruta en el plan: déjalos como anclas o botones sin URL inventada.

## Motion

Añade motion donde ayude a leer la página, con CSS y JS vainilla (`IntersectionObserver`, transiciones). Sin GSAP ni librerías.

- Hero y horario: entrada corta al cargar.
- Tarjetas y bloques: revelado al entrar en viewport.
- Chips, botones y tarjetas: hover y foco visibles.
- Menú móvil: abrir y cerrar con transición.
- Respeta `prefers-reduced-motion: reduce`.

## Réplica en Framer

La home de este repo es la referencia. Más adelante se recrea en un proyecto de Framer con el MCP de Framer, sección por sección. El MCP no importa el HTML ni el CSS: arma nodos, textos y estilos dentro de Framer.

Mientras se construye aquí, deja la página fácil de copiar:

- Una sección por bloque del plan, con el mismo orden y los mismos textos e imágenes.
- Estilos en CSS legible (color, tipo, espaciado, layout), no ofuscados en utilidades.
- Motion solo como comportamiento visible (entrada, hover, menú). En Framer se vuelve a hacer con las herramientas del archivo, no pegando el JS.

Cuando el usuario pida replicarla en Framer, usa el MCP de Framer ya conectado al archivo. Si no está conectado, detente y pídele que lo añada. Recorre la home en el orden del plan y reproduce cada sección con el copy y las imágenes de esta landing. No inventes contenido al pasar a Framer. Los iconos de Phosphor se sustituyen por el icono equivalente que Framer permita, o por un icono simple del mismo significado.

## Al terminar

Comprueba que cada nombre de archivo de `imagenes.md` aparece en el HTML y que no hay copy con datos ausentes del plan.
