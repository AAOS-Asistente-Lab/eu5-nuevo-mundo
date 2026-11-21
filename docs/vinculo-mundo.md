# Vinculo de las facciones con el mundo

Escrito por asigna-facciones.mjs el 2026-11-21 02:08. Mundo: **RNW: Custom world ZANQ** (`rnw_exp_world_zanqre3hye`, version 1.2.2). Paises de America que se pueden elegir: 170.

En la pantalla de seleccion de pais ya salen con el nombre de la faccion (si no, con el del mundo: elige por la etiqueta).

| Faccion | Tag | Nombre en el mundo | Locs | Capital | Region | Puntos | Siguientes |
|---|---|---|---|---|---|---|---|
| Alto Reino de Ostrevar | VOX | Ishta | 6 | rnw_loc_02718 | west_coast_region | 6 en su zona | GCF (1), XXX (1) |
| Teocracia de Ankarú | TWT | Aga-Itonama | 22 | rnw_loc_05041 | colombia_region | 21 en su zona | DFC (7), OVE (4), VJU (4) |
| Hegemonía Carmesí de Orunmar | QMN | Willka Tampu | 7 | rnw_loc_05116 | chaco_region | 7 en su zona | JXM (6), FXC (4), EAL (3) |
| Durnhal | NQB | Illenllecillam | 3 | rnw_loc_00883 | canada_region | 3 en su zona | XWF (3) |
| Kaïvan | IPF | Tumshukara | 12 | rnw_loc_02155 | caribbean_region | 12 en su zona | WKG (9), ESM (8), AGU (7) |
| Corte Insepulta de Hrímval | MSS | Tlokyhano' | 1 | rnw_loc_01846 | aridoamerica_region | ninguno en su zona: el mas cerca, a 408 px | WJK (415 px), XWF (157 px), MFR (376 px) |
| Skarren | XMP | Tliateixneim | 2 | rnw_loc_00552 | alaska_region | 2 en su zona | FVH (1) |
| Liga de las Mil Lagunas | LBQ | Yanaleguas | 10 | rnw_loc_01173 | great_plains_region | 10 en su zona | CRP (7), ZDE (7), GHX (6) |
| Sorava | VZR | Maunqesa | 4 | rnw_loc_03445 | mesoamerica_region | 4 en su zona | UVY (3), DQD (2) |
| Thalassar | RWX | Angualas | 8 | rnw_loc_05176 | andes_region | 8 en su zona | XED (15), RZX (6), DMV (4) |
| Hermandad de la Marea Negra | DGS | Ramalameque | 3 | rnw_loc_03232 | central_america_region | ninguno en su zona: el mas cerca, a 238 px | MZA (444 px), JHH (487 px), RBS (488 px) |
| Velathi | XED | Tatsugwen | 52 | rnw_loc_05095 | andes_region | 37 en su zona | EYJ (10), JXO (8), VOW (7) |

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
