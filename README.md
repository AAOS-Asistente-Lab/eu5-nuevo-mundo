# Nuevo Mundo para EU5

> **In English:** a Europa Universalis V content mod that adds a hand-designed New World (built with Random New World) with original factions, religions with their own mechanics, and era-upgrading buildings and units, made for two-player multiplayer. The content and the in-game texts are in Spanish.

Un mod de Europa Universalis V con un Nuevo Mundo propio, pensado para jugar en multijugador a dos:
- dos continentes, uno al norte y otro al sur;
- facciones con mucho sabor: dos naciones de construir en vertical («tall»), guerras de cosecha, enanos, atlantes, una horda con kurultai y no-muertos del norte helado;
- religiones con mecánicas propias;
- edificios y unidades que mejoran en cada era.

El mapa lo hace Random New World, con un continente dibujado por nosotros. Este mod pone el contenido encima.

## Estado
Jugable sobre el mundo v3, «RNW: Custom world 35CL»: las 12 facciones empiezan dentro de su zona del mapa (cada una con una cuarta parte de ella), entre 130 países de todos los tamaños; el 39,2 % del Nuevo Mundo tiene dueño y el resto queda libre para colonizar. Ningún país está partido en trozos. Capitales dentro de su zona, vegetación mezclada, y árboles y suelo del mapa a juego (mod local de gráficos). El juego carga el mod sin errores suyos y una partida empieza y corre. Lo que hace y lo pendiente está en `docs/estado.md`. Para jugar: `docs/como-jugar.md`.

## Qué hay aquí
| Carpeta | Contenido |
|---|---|
| `docs/como-jugar.md` | Cómo rehacer el mundo, instalar el mod, el orden de la colección y el multijugador. |
| `docs/estado.md` | Qué hace el v3, sus cifras, lo comprobado y lo pendiente. |
| `docs/estudio-3d.md` | Por qué sale tanto desierto y cómo hacer que los árboles y el suelo del mapa sigan a la vegetación. |
| `docs/vinculo-mundo.md` | Qué país del mundo es cada facción, las zonas y las cifras del reparto. |
| `docs/peticion.md` | Lo que pidieron los jugadores. |
| `docs/mecanicas.md` | El diseño de las facciones, las religiones y las mecánicas. |
| `docs/plan.md` | Las fases, los caminos y los riesgos. |
| `docs/contrato-partes.md` | Las reglas que sigue cada parte del contenido. |
| `docs/estudio-rnw.md`, `docs/formato-eu5.md` y `docs/mapa.md` | Cómo funciona Random New World, cómo se hace un mod de EU5 y el dibujo del mapa. |
| `mundo/` | `mundo-35cl.rnworld` (el mundo), el dibujo (`mascara.png`, `zonas.png`, `zonas.json`) y su vista. |
| `mod/gj_nuevo_mundo` | El mod listo para cargar, ya vinculado al mundo. Se copia tal cual: la suma de control depende de cada byte. |
| `partes/` | El contenido de cada facción, religión y mecánica de mundo, antes de integrarlo. |
| `herramientas/` | Los guiones en Node que funden las partes, vinculan el mod a un mundo y lo comprueban, y `exporta-3d` (Node y el Python de RNW) para los árboles y el suelo. |

## Requisitos para jugar
- EU5 1.4.9 y los mismos DLC.
- Random New World 1.2.2 y Community Mod Framework, en el orden de `docs/como-jugar.md`.
- El mundo rehecho con `mundo/mundo-35cl.rnworld` y el mod de `mod/gj_nuevo_mundo`, sin tocar.

Todos los nombres, historias y textos son originales.