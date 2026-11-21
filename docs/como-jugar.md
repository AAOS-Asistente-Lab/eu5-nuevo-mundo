# Prueba de la fase 1: las facciones del Nuevo Mundo

Qué se prueba: que nuestro mod, **GJ Nuevo Mundo**, carga encima de un mundo de RNW de serie y convierte países generados en nuestras facciones (cultura, fe, nombre y color) y que sus eventos salen. El caso fino es el **Alto Reino de Ostrevar** con sus eventos `gj_ostrevar.1` a `.3`. Tiempo: unos 15 min de preparación, 45 de juego y 20 con el jugador B.

Antes de empezar: **juego cerrado, sin estar jugando, con unos 8 GB de RAM libres**. Avisa a la coordinación, que pausa la GPU grande mientras generas.

## 1. La colección (5 min)
1. Abre EU5 → «DLC y mods» → tu colección activa.
2. **Desactiva** «Random New World (RNW)» (es el *hub*: su autor pide no activarlo) y «National Destinies» (choca con los mundos de RNW).
3. «Aplicar» y **cierra el juego**.

**Orden exacto de la colección para jugar** (el mundo hay que marcarlo a mano; lo que va más abajo pisa a lo de arriba). el jugador B tiene que llevar los mismos mods, en el mismo orden:

| # | Mod | Estado |
|---|---|---|
| 1 | Community Mod Framework | activo |
| 2 | REAI: Armies, Armadas & Manpower Overhaul | activo |
| 3 | REAI: Rational Empire AI | activo |
| 4 | **RNW: Custom world ZANQ** (`rnw_exp_world_zanqre3hye`) | **activo, marcado a mano** |
| 5 | **GJ Nuevo Mundo** (`gj_nuevo_mundo`) | **activo, siempre detrás del mundo** |
| – | National Destinies | desactivado |
| – | Random New World (RNW), el *hub* | desactivado |

Los dos REAI no se han probado con el mundo ni con nuestro mod. Si algo falla al cargar, prueba primero sin ellos.

## 2. Generar un mundo de serie (10-20 min)
1. Para que la biblioteca de RNW no llene C:, lanza el generador desde PowerShell con la carpeta en W:
   ```powershell
   $env:RNW_DATA = '<ruta>'; & '<workshop>/3829217331\Random New World Generator.exe'
   ```
2. Tipo de mundo **Continents**, todo por defecto, salvo **«Reveal the New World at the start»**: marcado.
   - **Con el mapa final** (para que las facciones caigan en sus zonas): en el editor de tierras, «Import a picture…» con `eu5-mundo\mapa\final\mascara.png`. Ajustes de la ventana de RNW que se usaron para el mundo de el jugador A:
     - Land 22,6 %, Location size 45 px, Smallest island 600, Sea zone 120 y Locations per province 6;
     - «Reveal the New World at the start», «Keep the mod in library» y «Add to the game when it is done», marcados.

     Los pasos completos están en `mapa\final\MAPA.md` §5. Sin el dibujo, el mod también funciona: reparte las facciones por puntos.
3. Marca **«Add to the game when it is done»** y pulsa **Generate**. Al acabar aparece en `Documents\...\mod\` una carpeta `rnw_exp_world_…`.

## 3. Poner las facciones en ese mundo (1-2 min)
Con el juego cerrado:
```powershell
node herramientas\asigna-facciones.mjs --instalar
```
El guion lee el mundo sin tocarlo y elige un país para cada facción. Si el mundo sale del dibujo de `mapa\final`, cada facción se queda el país con más tierra en su zona del dibujo, y las zonas de las partes (estepa, caldera, estrecho, mar interior, ruinas y vetas) salen del dibujo: `VINCULO.md` empieza diciendo «Mapa final: se usa». Si no sale de ese dibujo, reparte las del norte en Norteamérica y las del sur en Sudamérica, según la talla, el clima, el terreno y la costa que pide cada una. Después funde el mod con ese reparto, pasa el comprobador y lo copia a `Documents\...\mod\gj_nuevo_mundo`. El reparto queda en `eu5-mundo\VINCULO.md`, con la etiqueta de cada facción y el nombre que tenía en el mundo. Para cambiar una: `--tag ostrevar=ABC --instalar`. Si te da pereza, pídeselo a la coordinación.

## 4. Activar (2 min)
En «DLC y mods», en este orden: CMF, AAMO, REAI, el mundo `rnw_exp_world_…` y **GJ Nuevo Mundo, el último**. «Aplicar».

## 5. Qué mirar en 45 minutos
Marca cada punto o haz una captura si algo sale raro.
- [ ] **Selección de país:** las facciones de `VINCULO.md` están en su sitio. Si salen con el nombre del mundo y no con el nuestro, búscalas por la etiqueta: el nombre cambia al empezar. Elige **Ostrevar**.
- [ ] **Al empezar** Ostrevar tiene su nombre, su color, la cultura «ostrevarí» y la fe «Luz de los Fundadores». La mayoría de sus pops y de sus personajes han cambiado a las dos.
- [ ] **Las otras facciones** (abre 2 o 3 en el mapa): nombre, color, cultura y religión propios. Sus fes están en los grupos «Fes del Norte» y «Fes del Sur».
- [ ] **Religión de Ostrevar:** su mecánica (canonización) aparece en la pestaña de religión.
- [ ] **Consola** (la misma tecla con la que pones `cash`): `event gj_ostrevar.1`, `event gj_ostrevar.2` y `event gj_ostrevar.3`. Los tres salen con título, texto y opciones, sin claves en bruto como `gj_ostrevar.2.t`.
- [ ] **Juega 5 años** a velocidad alta. No se cuelga y los eventos de las facciones salen alguna vez.
- [ ] Guarda y **cierra el juego**. Avisa a la coordinación: leemos `Documents\...\logs\error.log` en solo lectura y buscamos líneas con `gj_`.

## 6. La sala con el jugador B (20 min)
1. **Tú:** en RNW, en el mundo → «Share and export» → **«Save world file…»** (un `.rnworld` de pocos MB). Comprime `Documents\...\mod\gj_nuevo_mundo` en un zip; va con el reparto ya puesto, así que el jugador B no corre ningún guion. Mándale los dos ficheros (lo envías tú).
2. **el jugador B:** EU5 1.4.9 (build 26655995), los mismos DLC (D000, D008, D009, D015, D017) y CMF 2.5.0, AAMO 1.4.1, REAI 1.4.2 y RNW 1.2.2 suscritos. Con el juego cerrado, en RNW: **«Open world file…»** con tu `.rnworld`, «Add to the game when it is done» y **Generate**. RNW comprueba que sale idéntico («Checked: made again, all … files are the same»). Borra cualquier `gj_nuevo_mundo` anterior, descomprime el zip en su `Documents\...\mod\` y activa la misma colección, en el mismo orden.
3. **Los dos:** abrid una sala multijugador y **comparad el checksum** que sale en la sala. Si coincide, jugad 2 años sin desincronizaros (una facción para cada uno).

**Hecho** si: todo lo del punto 5 sale bien, el `error.log` no tiene líneas `gj_` y la sala con el jugador B no se desincroniza.

## Si algo falla
- **El generador falla o el mundo no carga:** es RNW sobre la 1.4.9, no nuestro mod. Plan B para probar solo el mod: `asigna-facciones.mjs --vanilla --instalar` lo pone sobre la América del juego base (con el mundo desactivado).
- **No aparece ninguna facción:** el mod está fuera de la colección, o va antes que el mundo, o se generó otro mundo después: repite el paso 3.
- **Una facción no sale:** mira `VINCULO.md`; si dice «sin país», el mundo no tenía países libres en su continente.
- **Checksum distinto:** mirad que los dos tenéis las mismas versiones de mods y DLC, y que el jugador B borró cualquier copia anterior de `gj_nuevo_mundo`.
