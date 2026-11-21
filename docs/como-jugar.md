# Cómo jugar: el mundo v3 (35CL) con GJ Nuevo Mundo

Qué hace falta: el mundo de RNW «Custom world 35CL», rehecho a partir de `mundo/mundo-35cl.rnworld`, y nuestro mod **GJ Nuevo Mundo**, que va en `mod/gj_nuevo_mundo` del repo ya vinculado a ese mundo. Los dos jugadores tienen que llevar los mismos ficheros, byte a byte, para que la suma de control de la sala coincida.

## 0. Versiones
- EU5 1.4.9 (build 26655995), con los DLC D000, D008, D009, D015 y D017.
- Mods del Workshop, suscritos: Random New World (RNW) 1.2.2 y Community Mod Framework 2.5.0.
- Con el juego cerrado y unos 8 GB de RAM libres para generar el mundo.

## 1. El mundo (10-15 min)
1. Con el juego cerrado, abre el generador de RNW (`Random New World Generator.exe`, en la carpeta del Workshop de RNW).
2. **«Open world file…»** con `mundo/mundo-35cl.rnworld`, marca **«Add to the game when it is done»** y pulsa **Generate**.
3. RNW comprueba que sale idéntico («Checked: made again, all … files are the same»). Al acabar aparece en `Documents/Paradox Interactive/Europa Universalis V/mod/` la carpeta `rnw_exp_world_35clmr62cr`.

## 2. El mod (1 min)
1. Borra cualquier `gj_nuevo_mundo` anterior de `Documents/Paradox Interactive/Europa Universalis V/mod/`.
2. Copia ahí la carpeta `mod/gj_nuevo_mundo` del repo, entera y sin tocarla. Ya lleva el reparto de facciones, la tierra de cada una y la vegetación mezclada de ese mundo.

## 2b. Los árboles y el suelo (10-15 min, cada jugador en su PC)
Con Node 22 o más, el juego cerrado y 8 GB de RAM libres, desde la carpeta del repo:
```
node herramientas/exporta-3d.mjs
```
Vuelve a generar el mundo con nuestra vegetación y deja en `Documents/.../mod/` el mod **GJ Nuevo Mundo: gráficos** (`gj_nuevo_mundo_graficos`, unos 825 MB, no va en el repo). Al acabar imprime la huella de los gráficos: tiene que ser `fc42a7df0ea4b950` en los dos PC. Sin este paso se puede jugar igual, pero el mapa enseña las selvas y desiertos viejos de RNW.

Sin Node, hay un atajo para el mundo: `<RNW>/generator/python/python.exe -m rnw.cli import-world mundo/mundo-35cl.rnworld` y después `... -m rnw.cli world <el código que imprime> --install --land-image mundo/mascara.png` hacen lo mismo que el paso 1 sin abrir la ventana.

## 3. La colección (2 min)
En «DLC y mods», la colección activa en este orden exacto (lo que va más abajo pisa a lo de arriba; el mundo hay que marcarlo a mano):

| # | Mod | Estado |
|---|---|---|
| 1 | **RNW: Custom world 35CL** (`rnw_exp_world_35clmr62cr`) | **activo, marcado a mano** |
| 2 | **GJ Nuevo Mundo** (`gj_nuevo_mundo`) | **activo, siempre detrás del mundo** |
| 3 | Community Mod Framework | activo |
| 4 | **GJ Nuevo Mundo: gráficos** (`gj_nuevo_mundo_graficos`) | **activo, el último** (si hiciste el paso 2b) |
| – | REAI: Armies, Armadas & Manpower Overhaul y REAI: Rational Empire AI | fuera |
| – | National Destinies | fuera (choca con los mundos de RNW) |
| – | Random New World (RNW), el *hub* | desactivado (su autor pide no activarlo) |

«Aplicar».

## 4. Qué mirar
- [ ] **Selección de país:** las 12 facciones están en su sitio, con el país que dice `docs/vinculo-mundo.md`. Si alguna sale con el nombre del mundo, búscala por la etiqueta: el nombre cambia al empezar.
- [ ] **Al empezar:** cada facción tiene una cuarta parte de su zona, su capital dentro, su nombre, color, cultura y fe, y los pops de su tierra nueva han cambiado a las dos. Alrededor hay muchos países pequeños y medianos (130 en total, cada uno de una pieza; el 40,9 % del Nuevo Mundo tiene dueño) y tierra libre para colonizar.
- [ ] **El mapa:** los bosques y las selvas salen en manchas pequeñas y mezcladas, sin grandes desiertos en el sur (con el mod de gráficos).
- [ ] **Consola:** `event gj_ostrevar.1`, `.2` y `.3` salen con título, texto y opciones, sin claves en bruto.
- [ ] **Juega 5 años** a velocidad alta: no se cuelga y los eventos de las facciones salen alguna vez.
- [ ] Guarda, cierra y mira `Documents/Paradox Interactive/Europa Universalis V/logs/error.log`: busca líneas con `gj_`.

## 5. Multijugador
Los dos con los pasos 0-3 hechos y la misma huella del mod (`f38da466466c7925`, la imprime `asigna-facciones.mjs`; la de los gráficos, `exporta-3d.mjs`): abrid una sala y **comparad la suma de control**. Si coincide, jugad 2 años sin desincronizaros, una facción cada uno.

## Rehacer el mod (solo si cambian las partes o el mundo)
Con Node 22 o más y el juego cerrado:
```
node herramientas/asigna-facciones.mjs --mundo <carpeta rnw_exp_world_35clmr62cr> --instalar
```
Lee el mundo sin tocarlo, elige un país para cada facción, reparte la tierra libre (las facciones hasta el 25 % de su zona y los demás países hasta una talla que sale de su tag) y mezcla la vegetación. Después funde el mod con ese reparto, pasa el comprobador y lo copia a `Documents/.../mod/gj_nuevo_mundo`. El informe queda en `VINCULO.md`. La carpeta del juego se busca en Steam; si está en otra biblioteca, pasa `--juego <carpeta game>`, define `EU5_JUEGO` o ponla en `herramientas/local.json` (`{ "juego": "…" }`, que no va al repo). Para cambiar el país de una facción: `--tag ostrevar=ABC --instalar`. Sin flags, solo monta y comprueba en `tmp-instalar/`; con `--seco`, solo informa.

Comprobar el mod sin el juego abierto: `node herramientas/comprueba-mod.mjs --mundo <carpeta del mundo>` (0 errores para jugar).

Después, copia `tmp-instalar/gj_nuevo_mundo` sobre `mod/gj_nuevo_mundo` del repo, apunta la huella nueva en `docs/estado.md` y vuelve a correr `exporta-3d.mjs` (la vegetación cambia con las capitales).

## Hacer un mundo nuevo con el dibujo
En el generador: tipo **Continents**, «Import a picture…» con `mundo/mascara.png`; Land 22,6 %, Location size 45 px, Smallest island 600, Sea zone 120, Locations per province 6; «Reveal the New World at the start», «Keep the mod in library» y «Add to the game when it is done», marcados. Los pasos completos están en `docs/mapa.md` §5. Un mundo nuevo tiene otras claves: hay que rehacer el mod con `asigna-facciones.mjs`.

## Si algo falla
- **No aparece ninguna facción:** el mod está fuera de la colección o va antes que el mundo.
- **Suma de control distinta:** mirad que los dos tenéis las mismas versiones de juego, DLC y mods, el mismo orden, y que no quedó ningún `gj_nuevo_mundo` viejo.
- **El mundo no carga:** es RNW sobre la 1.4.9, no nuestro mod. Para probar solo el mod: `asigna-facciones.mjs --vanilla --instalar` lo pone sobre la América del juego base (con el mundo desactivado).
