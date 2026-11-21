# NECESITA: mundo_bestias

Lo que esta parte usa sin definirlo.

## Triggers de geografía (los define la integración)
- **`gj_zona_caldera`** (ámbito location): las locations de la caldera de Durnhal, donde duerme Kharuun. Los usan los eventos .2, .6 y .9 y el trigger `gj_mundo_bestias_pais_caldera`.
- **`gj_zona_estrecho`** (ámbito location): las locations de costa del estrecho entre los dos continentes. Lo usan los eventos .22 y el trigger `gj_mundo_bestias_pais_estrecho` (que además pide `has_ports = yes`).
- Estepa, cumbres, selvas y humedales no necesitan zona propia: se detectan con `vegetation` y `topography` del juego.

## Piezas de otras partes
- **durnhal:** variable global `gj_inquietud_caldera`. Solo se lee, y siempre con `has_global_variable` por delante (si no existe, el trigger es falso).
- **llama_profunda:**
  - variable de país `gj_llama_pacto_dragon` (libra del tributo y del fuego, y activa el evento .7);
  - efecto `gj_llama_profunda_rompe_pacto` (lo llama el evento .11 al caer el dragón, para cada país con el pacto);
  - `gj_llama_profunda_lee_presagio = yes`.
- **mar_dormido:**
  - `gj_mar_kraken_calmado_trigger` (trigger de país);
  - `gj_mar_calma_a_la_bestia = yes` (efecto de país);
  - `gj_mar_dormido_lee_presagio = yes`;
  - religión `gj_mar_dormido`.
- **hrimval:** efecto `gj_hrimval_recoge_caidos = { N = n }` (lo llama `gj_mundo_bestias_alimenta_la_corte`; solo actúa en la Corte Insepulta y requiere `gj_es_hrimval`).
- **Lecturas de presagio** (una por religión; cada una solo actúa si el país sigue esa fe). Las firmas, tal como las dejan sus partes:
  - `gj_cielo_clanes_lee_presagio = { tipo = cometa|eclipse }`
  - `gj_escarcha_silente_lee_presagio = { ECLIPSE = yes|no }`
  - `gj_espiritus_lago_lee_presagio = yes` (lee la variable global `gj_presagio_tipo`, que dejo en 1 o en 2)
  - `gj_llama_profunda_lee_presagio = yes`
  - `gj_luz_fundadores_lee_presagio_cometa = yes` y `gj_luz_fundadores_lee_presagio_eclipse = yes`
  - `gj_mar_dormido_lee_presagio = yes`
  - `gj_pacto_balanza_lee_presagio = yes`
  - `gj_sol_blanco_lee_presagio = { TIPO = cometa|eclipse }`
  - **`gj_dioses_hambrientos_lee_presagio = yes` y `gj_senda_verde_lee_presagio = yes`: esas dos partes todavía no traen su efecto de lectura.** Cuando exista cada una, esta parte la llama sin argumentos. Si las firmas fueran otras, hay que cambiar dos líneas en cada una de las dos listas de `gj_mundo_bestias_efectos.txt`. Si faltan al fundir, el juego se queja de un efecto desconocido.
- **cultura `gj_kaivani`** (parte kaivan): el evento .33 la usa para los lobos domesticados.

## Lo que esta parte da a otras
- Variable global **`gj_dragon_estado`** (0 dormido, 1 inquieto, 2 despierto) y **`gj_dragon_muerto`** (solo existe si el dragón ha muerto).
- Efectos: `gj_mundo_bestias_dragon_pone_estado = { ESTADO = n }`, `gj_mundo_bestias_dragon_sube_estado` y `gj_mundo_bestias_dragon_baja_estado`.
- Triggers de país: `gj_mundo_bestias_dragon_vivo`, `gj_mundo_bestias_dragon_dormido`, `gj_mundo_bestias_dragon_inquieto` y `gj_mundo_bestias_dragon_despierto`.
- Variables globales de los krakens: `gj_mundo_bestias_kraken_furia` (0 a 2) y `gj_mundo_bestias_kraken_muerto` (solo existe si lo han matado).
- Variables globales de los presagios: `gj_presagio_tipo` (1 cometa, 2 eclipse) y `gj_mundo_bestias_presagio_lock` (cerrojo de 14 años).

## Integración
- `on_game_start` y `yearly_country_pulse` van en `on_action/gj_mundo_bestias_pulsos.txt`; el segundo es el mismo patrón que Durnhal (se añade al del juego).
- Ningún evento llama a `gj_es_*`: esta parte no depende de ninguna facción.
- No hay iconos, ilustraciones ni imágenes nuevas; los eventos van sin `image`.
