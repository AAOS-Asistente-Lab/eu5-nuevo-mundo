# mundo_contacto: NECESITA

Lo que esta parte usa sin definirlo, y lo que pide a la integración.

## Triggers de facción
Se usan en `gj_contacto_ensena_al_visitante` (qué saber se lleva el visitante). Ninguno es obligatorio: si falta alguno, el `else` da el modificador genérico, pero el trigger tiene que existir para que no falle el script.
- `gj_es_durnhal`, `gj_es_ankaru`, `gj_es_thalassar`, `gj_es_lagunas`, `gj_es_sorava`, `gj_es_skarren`, `gj_es_marea_negra`, `gj_es_velathi`, `gj_es_kaivan`.

## Piezas de otras partes
- **Efecto `gj_recoge_caidos = { N = n }`** (parte `hrimval`, lo pide su `NECESITA.md`): se llama en `gj_mundo_contacto.7` (opción c) y `.9` (opción b), en ámbito de país. Si la integración no lo trae, hay que quitar esas dos líneas.

## Ganchos del juego que toca (para la integración)
- `INJECT:yearly_country_pulse` en `common/on_action/gj_mundo_contacto_on_action.txt` (lista `on_actions`, igual que `ostrevar`).
- `REPLACE:great_pestilence` en `common/diseases/` y en `common/situations/`; `REPLACE:smallpox` en `common/diseases/`. Si la integración no admite `REPLACE:` sobre esas rutas, hay que copiar los ficheros enteros del juego base con los mismos cambios, con el nombre original.
- `localization/spanish/replace/gj_mundo_contacto_reemplazos_l_spanish.yml`: sustituye 9 claves de la gran peste del juego base. Si la carpeta `replace` no pisa, el mismo contenido va a un `l_spanish` normal cargado después.
- Los eventos `.6` y `.11` quedan referenciados desde la enfermedad y la situación sustituidas, no desde un on_action.

## Contenido del mundo
- Ninguna `gj_zona_*`.
- Ninguna etiqueta de país ni id de location.
- Depende de la clave `continent:america` y de las claves `continent:europe`, `asia` y `africa`, que RNW conserva. Depende también de `region:caribbean_region`, `mesoamerica_region` y `andes_region` solo en los contadores de la situación (`var_*_was_infected`), que ya no cierran la situación.

## Cosas que otras partes pueden aprovechar
- Variable de país `gj_contacto_hecho` (ya hubo primer contacto) y `gj_contacto_anos` (años desde entonces).
- Variable de país `gj_contacto_via`: 1 comercio, 2 aprender, 3 cerrado.
- Trigger `gj_puertos_cerrados` y modificador `gj_contacto_via_cerrado`.
- Triggers `gj_pais_viejo_mundo` y `gj_pais_nuevo_mundo`.

## Ronda de reparación (pendiente de la integración)
- **Localización eplace/:** el comprobador rechaza main_menu/localization/spanish/replace/ («no existe en el juego») y, si se mueve a un .yml normal, rechaza las 9 claves sin prefijo gj_. Las 9 claves de la gran peste tienen que llevar el nombre del juego base para que se lea «Fiebres de los barcos»; es una excepción de diseño. La integración debe admitir esa carpeta o permitir esas 9 claves. Son los 2 errores que quedan.
- **sponsor_spiritual_protection_bonus:** es un modificador real del juego base (generic_actions/great_pestilence.txt). El comprobador lo confunde con un valor de script por acabar en _bonus; en gj_mundo_contacto_situaciones.txt va entre comillas para esquivarlo. Si el juego no acepta las comillas, quitarlas.
- **gj_hrimval_recoge_caidos** sustituye a gj_recoge_caidos en los eventos .7 y .9; lo define la parte hrimval.