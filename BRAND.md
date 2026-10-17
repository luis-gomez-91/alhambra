# Alhambra Shopping — Guía de marca de la landing

Colores, tipografías y medidas que usa la landing (`index.html` + `styles.css`).
Las variables están definidas en `:root` de `styles.css`.

---

## Colores

### Paleta principal

| Token | HEX | RGB | Uso |
|---|---|---|---|
| `--ink` | `#16130f` | 22, 19, 15 | Texto principal, hero, botón oscuro, chip activo |
| `--graphite` | `#3b3b3c` | 59, 59, 60 | Fondo de nav (scroll y menú móvil), formulario y footer. Es el gris de la barra «SHOPPING» de alhambrashopping.com |
| `--ink-soft` | `#5b5248` | 91, 82, 72 | Texto secundario sobre fondos claros |
| `--sand` | `#cdb9a2` | 205, 185, 162 | Acento: eyebrows, íconos, subrayado del nav, foco en inputs |
| `--sand-deep` | `#9c8466` | 156, 132, 102 | Hover del botón oscuro, contorno de foco, día activo en la agenda |
| — | `#76634c` | 118, 99, 76 | Arena oscurecida para texto pequeño sobre fondos claros (≥ 5:1) |
| `--cream` | `#f5f0e9` | 245, 240, 233 | Fondo de las secciones alternas y texto sobre fondos oscuros |
| `--paper` | `#fbf9f5` | 251, 249, 245 | Fondo base de la página |
| — | `#ffffff` | 255, 255, 255 | Fondo de los logos de patrocinadores y de la card sin logo |
| `--ink-2` | `#221d17` | 34, 29, 23 | Definido pero sin uso actual |

### Estados

| Color | HEX | Uso |
|---|---|---|
| Error | `#f0a996` | Borde y mensaje de campo inválido (sobre `--graphite`) |
| Foco de input | `rgba(205, 185, 162, 0.25)` | Halo de 3px alrededor del input enfocado |

### Líneas y transparencias

| Token / valor | Uso |
|---|---|
| `--line` · `rgba(22, 19, 15, 0.12)` | Divisores sobre fondos claros |
| `--line-light` · `rgba(245, 240, 233, 0.22)` | Divisores y bordes sobre fondos oscuros |
| `rgba(22, 19, 15, 0.16 / 0.5)` | Borde del chip normal / del chip botón |
| `rgba(245, 240, 233, 0.04–0.1)` | Fondo del formulario y de los inputs (normal → foco) |
| `rgba(245, 240, 233, 0.55–0.88)` | Texto cream atenuado sobre oscuro (opcional, legal, párrafos, meta del hero) |
| `rgba(var(--graphite-rgb), 0.96 / 0.98)` | Nav al hacer scroll / menú móvil abierto |
| `rgba(22, 19, 15, 0.7 → 0.15 → 0.88)` | Degradado sobre la foto del hero |

### Fondos por sección

| Sección | Fondo |
|---|---|
| Nav (scroll / menú) | `--graphite` al 96–98 % |
| Hero | Foto + degradado `--ink` |
| Próximamente | `--cream` |
| Shopping | `--paper` |
| Restaurantes | `--cream` |
| Mantente conectado (formulario) | `--graphite` |
| Footer | `--graphite` |

En las cards, el degradado se funde con el fondo de cada sección mediante `--fade` (`251, 249, 245` en Shopping y `245, 240, 233` en Restaurantes).

---

## Tipografía

Son las mismas fuentes de alhambrashopping.com. Los archivos están en `fonts/` y no se usa ninguna otra fuente.

| Token | Familia | Pesos | Archivo | Uso |
|---|---|---|---|---|
| `--font-display` | **Neutraface Display** (Neutraface 2 Display) | 500 Medium · 700 Bold | `neutraface-2-display-medium.woff2`, `neutraface-2-display-bold.woff2` | Títulos, horario, días de la agenda, menú móvil |
| `--font-body` | **Neutraface Text** | 400 Book · 500–600 Demi · 700 Bold | `neutraface-text-book.woff2`, `neutraface-text-demi.woff2`, `neutraface-text-bold.woff2` | Texto general, nav, botones, eyebrows, chips, footer |
| `--font-form` | **Urbanist** | 400 · 500 · 600 | `urbanist-400.woff2`, `urbanist-500.woff2`, `urbanist-600.woff2` | Etiquetas y campos del formulario |

> **Licencia:** Neutraface es una fuente comercial de House Industries. Antes de publicar, confirma que la licencia de Alhambra cubre este uso. Urbanist es gratuita (Fontshare).

### Escala

| Elemento | Fuente | Tamaño | Peso | Interlineado | Tracking |
|---|---|---|---|---|---|
| Título del hero | Display | `clamp(3.5rem, 11vw, 8.5rem)` | 500 | 0.92 | −0.02em |
| Título «Próximamente» | Display | `clamp(2.75rem, 5vw, 4.5rem)` | 500 | 0.95 | −0.02em |
| Título del formulario | Display | `clamp(2.5rem, 5vw, 3.75rem)` | 500 | 1.02 | — |
| Subtítulo de sección | Display | `clamp(2.25rem, 5vw, 3.5rem)` | 500 | 1.05 | — |
| Título de evento | Display | `clamp(1.75rem, 2.8vw, 2.5rem)` | 500 | 1.05 | −0.01em |
| Día de la agenda | Display | 4rem (2.75rem en móvil) | 500 | 0.8 | −0.03em |
| Cuerpo | Text | 16px | 400 | 1.6 | — |
| Intro | Text | 1.0625rem | 400 | 1.6 | — |
| Links del nav | Text | 0.8125rem, MAYÚSCULAS | 500 | — | 0.08em |
| Botones | Text | 0.875rem, MAYÚSCULAS | 600 | — | 0.06em |
| Eyebrow | Text | 0.8125rem, MAYÚSCULAS | 600 | — | 0.24em |
| Etiquetas pequeñas (mes, tipo, footer) | Text | 0.75rem, MAYÚSCULAS | 600 | — | 0.14–0.2em |
| Etiqueta del formulario | Urbanist | 0.8125rem | 500 | — | 0.04em |
| Texto legal | Text | 0.75rem | 400 | 1.7 | — |

---

## Forma y espaciado

| Token | Valor | Uso |
|---|---|---|
| `--radius` | `14px` | Cards, preview, cuadro de horario |
| `--radius-sm` | `8px` | Inputs, miniaturas, logos |
| Radio del formulario | `20px` (`--radius` + 6px) | Contenedor del formulario |
| Pastilla | `999px` | Botones y chips |
| `--nav-h` | `76px` | Altura del nav |
| `--gutter` | `clamp(16px, 4vw, 40px)` | Margen lateral |
| Contenedor | `max-width: 1240px` | Ancho máximo del contenido |
| Sección | `padding-block: clamp(72px, 10vw, 128px)` | Espacio vertical entre secciones |

## Movimiento

| Token | Valor |
|---|---|
| `--ease` | `cubic-bezier(0.22, 0.61, 0.36, 1)` |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` |

Con `prefers-reduced-motion` se desactivan todas las animaciones.

## Iconos

Phosphor Icons, estilo *regular* (`@phosphor-icons/web@2.1.1`).

---

## Referencia: tokens de alhambrashopping.com que la landing no usa

| HEX | Uso en el sitio original |
|---|---|
| `#242424` | Texto oscuro |
| `#cc6f2d` | Naranja de los títulos de sección («SHOPPING») |
| `#d6bfaf` | Arena claro |
| `#b5b5b5` | Gris claro |
| `#127e5b` | Verde |
