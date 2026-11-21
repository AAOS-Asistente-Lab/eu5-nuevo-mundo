# luz_fundadores: La Luz de los Fundadores (religion de Ostrevar)

Mecanica: `has_canonization` + `has_religious_influence`. Los santos son **Fundadores**: soberanos que encendieron lumbres (ciudades).

## Que hay
- **Religion** `gj_luz_fundadores` (grupo `gj_fe_norte`, 2 aspectos a elegir, canonizacion barata, concepto propio `gj_fundadores`).
- **4 aspectos**: El Hogar Comun, La Primera Piedra, La Lumbre Vigilante, Los Caminos de Luz.
- **2 tipos de lugar sagrado** (sin locations): `gj_fundadores_primer_hogar`, `gj_fundadores_atalaya_lumbre`.
- **Mecanica propia**:
  - Cada pulso, `gj_luz_fundadores_registra_hogares` cuenta ciudades y villas y suma puntos de fundador (`gj_fundador_puntos`) al soberano de turno por cada una nueva.
  - Si muere con 15 o mas, el pueblo pide canonizarlo (evento .2: +influencia religiosa para pagar el santo).
  - Al canonizar (on_made_saint), una ciudad toma su nombre y gana `gj_ciudad_del_fundador_modifier` durante 100 anos (evento .3). Con 3 santos, Aclamacion de los Fundadores (evento .12, una vez).
- **12 eventos** (namespace `gj_luz_fundadores`, .1 a .12). 24 opciones.
- **`gj_luz_fundadores_lee_presagio`** (y `_cometa`, `_eclipse`): el soberano elige leer el cielo como lumbre nueva o como hogar cubierto (evento .11).
- 14 modificadores estaticos para los eventos (11 de pais, 3 de location), 31 lineas.

## Cifras reales
- Bonificaciones (definition_modifier + aspectos): **19** (7 de definicion + 4 aspectos x 3).
- Aparte: 9 lineas de modificador en los 2 tipos de lugar sagrado y 31 en los modificadores de eventos.
- Eventos: **12**. Opciones: 24. Decisiones: 0. Situaciones: 0. Edificios: 0. Unidades: 0. Escuelas: 0 (a esta religion no le toca ninguna).
- Ficheros: 12 (10 del juego, RESUMEN.md y NECESITA.md). Claves de localizacion: 97, todas con texto.
- Comprobacion propia: llaves equilibradas en cada fichero, claves y modificadores contrastados con el juego base (sin discrepancias), sin etiquetas de pais ni ids de locations, sin rutas. Todos los ficheros UTF-8 con BOM, como los del base.

## Equilibrio
- Canonizar cuesta un 25 % menos de influencia religiosa (precio base 75). Es el unico premio fuerte; la ciudad del Fundador da +15 % de capacidad de poblacion y +0,02 de control en una sola location.
- Los aspectos se eligen de dos en dos: el techo es +10 % de eficiencia de obra, +10 % de defensa o +10 % de capacidad mercantil, no todo a la vez.
- Debilidad: sin ciudades nuevas no hay Fundador; una lumbre apagada (evento .5) cuesta construccion y prestigio.

## NOT_TESTED (no se ha ejecutado el juego)
- `saints_concept = gj_fundadores` con un concepto nuevo (si el juego lo rechaza, cambiar a `saints_concept = saints`).
- `num_location_rank:city` como valor de script dentro de `set_variable`.
- Que `scope:recipient` (on_made_saint) y `scope:old_ruler` (on_ruler_death_delayed) lleguen a los eventos .3 y .2.
- Que un on_action nuevo se pueda enganchar (ver NECESITA.md).

## Ronda de reparacion (21-11)
- Comprobador: 0 textos que faltan y 0 claves o eventos inexistentes; quedan 3 errores 'on_action no lo llama nadie' (de la integracion, ver NECESITA.md), salida 1; 11 avisos de claves sin uso (no son fallos). Cifras anteriores sin cambios: 12 eventos, 19 bonificaciones, 97 claves de localizacion. Sin nombres repetidos que cambiar.
