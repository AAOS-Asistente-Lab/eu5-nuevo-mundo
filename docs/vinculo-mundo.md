# Vinculo de las facciones con el mundo

Escrito por asigna-facciones.mjs el 2026-11-21 04:30. Mundo: **RNW: Custom world 35CL** (`rnw_exp_world_35clmr62cr`, version 1.2.2). Paises de America que se pueden elegir: 130.

En la pantalla de seleccion de pais ya salen con el nombre de la faccion (si no, con el del mundo: elige por la etiqueta).

| Faccion | Tag | Nombre en el mundo | Locs | Capital | Region | Puntos | Siguientes |
|---|---|---|---|---|---|---|---|
| Alto Reino de Ostrevar | QPF | Cumwornos | 7 | rnw_loc_02148 | west_coast_region | 7 en su zona | YAI (6), JTZ (5), UAK (4) |
| Teocracia de Ankarú | OKD | Vautteir | 160 | rnw_loc_05492 | la_plata_region | 56 en su zona | OCW (31), ZPZ (20), TWB (17) |
| Hegemonía Carmesí de Orunmar | QJZ | Rapa | 11 | rnw_loc_04574 | chaco_region | 11 en su zona | QSG (9), YWQ (6), PIV (4) |
| Durnhal | WWA | Klikitsen | 30 | rnw_loc_01014 | canada_region | 29 en su zona | - |
| Kaïvan | QKM | Aranagunypacam | 100 | rnw_loc_00953 | east_coast_region | 56 en su zona | BZM (25), RBS (21), YJN (14) |
| Corte Insepulta de Hrímval | OXA | Tcheskó lähä | 1 | rnw_loc_00531 | great_plains_region | ninguno en su zona: el mas cerca, a 315 px | NQB (319 px), DQD (360 px), LBQ (362 px) |
| Skarren | THJ | Guweis | 7 | rnw_loc_01323 | alaska_region | 6 en su zona | YAI (5), KTI (2) |
| Liga de las Mil Lagunas | FDE | Sanaguas | 35 | rnw_loc_00880 | great_plains_region | 25 en su zona | QKM (44), DQD (21), JDO (12) |
| Sorava | CBG | Calanaku | 10 | rnw_loc_03501 | mesoamerica_region | 4 en su zona | HLH (3), MTQ (3), OFR (2) |
| Thalassar | EYJ | Peitlizul | 49 | rnw_loc_05927 | andes_region | 39 en su zona | OMB (22), KXG (11), ZYW (11) |
| Hermandad de la Marea Negra | JEJ | Kla Ranquil | 20 | rnw_loc_05166 | chaco_region | ninguno en su zona: el mas cerca, a 438 px | TWB (508 px), XUV (510 px), PIV (222 px) |
| Velathi | SGG | Kellollampaya | 28 | rnw_loc_04822 | andes_region | 28 en su zona | WTT (22), MZA (17), MGJ (16) |

**Mapa final:** se usa. El 99.4 % de la tierra cae dentro de una zona del dibujo (hace falta el 85 %). Ajuste: x = 3.998 * x_dibujo + -2106.0, y = 4.001 * y_dibujo + 4.4 (escala esperada 4).

| Zona del dibujo | Continente | Localizaciones (dibujo, aprox.) | En el mundo |
|---|---|---|---|
| Kaivan | N | 1002 | 911 |
| Alto Reino de Ostrevar | N | 528 | 476 |
| Durnhal | N | 332 | 301 |
| Liga de las Mil Lagunas | N | 357 | 352 |
| Skarren | N | 293 | 284 |
| Corte Insepulta de Hrimval | N | 171 | 157 |
| Menor N2: cabo gris de Skarren | N | 253 | 248 |
| Menor N3: dedo del noroeste | N | 44 | 33 |
| Menor N4: cabo de Ostrevar | N | 36 | 29 |
| Menor N5: paso de la cuenca | N | 246 | 235 |
| Menor N6: costa del alba | N | 50 | 52 |
| Menor N7: cuerno del estrecho | N | 40 | 44 |
| Hegemonia Carmesi de Orunmar | S | 751 | 584 |
| Sorava | S | 259 | 205 |
| Teocracia de Ankaru | S | 568 | 456 |
| Velathi | S | 383 | 393 |
| Thalassar | S | 278 | 270 |
| Hermandad de la Marea Negra | S | 110 | 98 |
| Menor S1: cabo de Sorava | S | 113 | 96 |
| Menor S2: costa de las Perlas | S | 301 | 299 |
| Menor S3: paso del Ocaso | S | 38 | 24 |
| Menor S5: norte de Velathi | S | 53 | 54 |
| Menor S6: sur de Orunmar | S | 163 | 161 |
| Menor S7: marchas de Orunmar | S | 176 | 148 |

## Tierra con dueno al empezar (reparte-tierra.mjs)
Nuevo Mundo: 5932 localizaciones de tierra. Con dueno en el mundo de RNW: 1303 (22.0 %). Tras absorber: 1303 (22.0 %). Tras rellenar: **4301 (72.5 %)**; objetivo 70 %-75 % (4301).

| Zona | Quien | Pais | Inicial | Estados absorbidos (locs) | Tierra libre | Al empezar |
|---|---|---|---|---|---|---|
| ankaru | ankaru | OKD | 160 | 1 (1) | 282 | 443 |
| durnhal | durnhal | WWA | 30 | 0 (0) | 236 | 266 |
| hrimval | hrimval | OXA | 1 | 0 (0) | 136 | 137 |
| kaivan | kaivan | QKM | 100 | 30 (184) | 582 | 866 |
| liga | lagunas | FDE | 35 | 27 (147) | 108 | 290 |
| marea-negra | marea_negra | JEJ | 20 | 0 (0) | 85 | 105 |
| menor-s2 | menor | TWB | 47 | 7 (124) | 40 | 211 |
| orunmar | orunmar | QJZ | 11 | 13 (36) | 463 | 510 |
| ostrevar | ostrevar | QPF | 7 | 4 (11) | 390 | 408 |
| skarren | skarren | THJ | 7 | 2 (15) | 234 | 256 |
| sorava | sorava | CBG | 10 | 5 (10) | 165 | 185 |
| thalassar | thalassar | EYJ | 49 | 14 (85) | 92 | 226 |
| velathi | velathi | SGG | 28 | 14 (185) | 185 | 398 |

Capital llevada a su zona (no habia ningun estado dentro): ankaru OKD de rnw_loc_05492 a rnw_loc_04456; hrimval OXA de rnw_loc_00531 a rnw_loc_00105; kaivan QKM de rnw_loc_00953 a rnw_loc_02278; marea_negra JEJ de rnw_loc_05166 a rnw_loc_03195.


## Vegetacion del Nuevo Mundo (mezcla-vegetacion.mjs)
5932 localizaciones de tierra; cambian 3589. Mancha mas grande: localizaciones seguidas del mismo tipo. Desierto en las zonas de las facciones del sur (2006 localizaciones): 30.4 % antes, 5.6 % despues.

| Tipo | Antes | Despues | Mancha mayor antes | Despues |
|---|---|---|---|---|
| grasslands | 36.5 % | 30.0 % | 327 | 30 |
| desert | 18.2 % | 5.6 % | 416 | 20 |
| woods | 15.3 % | 24.6 % | 121 | 28 |
| jungle | 12.5 % | 6.5 % | 179 | 25 |
| forest | 11.0 % | 13.4 % | 59 | 30 |
| sparse | 6.4 % | 17.1 % | 29 | 28 |
| farmland | 0.0 % | 2.8 % | 0 | 9 |
| arbolado (woods+forest+jungle juntos) | 38.9 % | 44.5 % | 197 | 50 |

Terreno (topography), sin cambios: flatland 48.3 %, hills 21.7 %, plateau 12.6 %, mountains 11.2 %, wetlands 6.1 %.


## Zonas (16)
- `gj_zona_caldera` (localizacion): 48 localizaciones dentro del Circo de Durnhal (0.4 del radio)
- `gj_zona_estepa` (pais_frontera): 32 areas de la zona kaivan
- `gj_zona_estepa_alta` (localizacion): 8 areas (alto) de la zona kaivan
- `gj_zona_estepa_baja` (localizacion): 8 areas (bajo) de la zona kaivan
- `gj_zona_estrecho` (localizacion): 60 localizaciones de costa a 150 px del estrecho (1780, 1095)
- `gj_zona_mar_interior` (localizacion): 66 localizaciones de costa a 150 px del Mar de las Perlas
- `gj_zona_marca_occidental` (localizacion): 8 areas (oeste) de la zona kaivan
- `gj_zona_norte` (pais_capital): subcontinente north_america (el del continente N del dibujo)
- `gj_zona_ruina_antigua` (localizacion): 5 ruinas de los Anteriores: mesetas y selvas de altura
- `gj_zona_ruina_atlante` (localizacion): 5 ruinas atlantes: tierra adentro del sur, hacia el mar interior
- `gj_zona_ruina_enana` (localizacion): 5 ruinas enanas: montes del norte, cerca del metal y de los circos
- `gj_zona_valles_orientales` (localizacion): 8 areas (este) de la zona kaivan
- `gj_zona_veta_estrella` (localizacion): 1 en la alta meseta
- `gj_zona_veta_fuego` (localizacion): 1 en la frontera entre facciones del norte
- `gj_zona_veta_marea` (localizacion): 1 en la costa del Mar de las Perlas
- `gj_zona_veta_raiz` (localizacion): 2 en la frontera entre facciones del sur


Para cambiar una: `node asigna-facciones.mjs --tag <faccion>=<TAG> --instalar` (se puede repetir).
