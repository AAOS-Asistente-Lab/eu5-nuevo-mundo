# Mapa final del Nuevo Mundo (RNW 1.2.2)

**El fichero que se importa es `mascara.png`:** 2520 x 2048 (la hoja real de RNW, 1260 x 1024), RGB de 8 bits, con los seis colores exactos de RNW. Ajustada a plantilla-rnw.png; la versión anterior de 1908 x 2048 está en 1-1908/.

Para comprobarlo se usó solo Node (`mide.mjs`, `canales.mjs`). No se ha ejecutado RNW, el juego ni Python.

| Fichero | Qué es |
|---|---|
| `mascara.png` | El dibujo para el editor de RNW. SHA-256 `0B308483…9B98D0`, igual en dos ejecuciones. |
| `vista.png` | La vista en color de `vista.mjs --rectos`. |
| `zonas.png`, `zonas.json` | El territorio de cada facción y los rasgos del mapa. Los lee el guion de asignación (§3). |
| `genera.mjs` | El generador: `node genera.mjs`, unos 30 s, a prioridad Idle en los E-cores. Parte de una copia del candidato 2 con los injertos de §2. |
| `mide.json` | La salida de `mide.mjs` sobre `mascara.png`. |
| `canales.mjs` | Lista los mares que se quedarían cerrados si RNW tapa los canales estrechos al suavizar (`node canales.mjs mascara.png 3`). |
| `juez-mide-{1,2,3}.json` | Las medidas de los tres candidatos que hizo el juez. |

## 1. Puntuaciones (1-5)

| Criterio | Cand. 1 | Cand. 2 | Cand. 3 | **Final** |
|---|---|---|---|---|
| Formas interesantes, sin ángulos rectos | 3: dos bloques gruesos; rugosidad 47,2; fiordos como palos rectos | 5: continentes finos en anillo, 133 masas; rugosidad 52,4; tramo recto máximo de 144 px de lienzo | 2: manchas redondeadas; rugosidad 28,0; 62 masas | **5**: rugosidad 58,5; tramo recto máximo de 72/72/96 px de lienzo; 161 masas |
| Mares interiores | 3: Báltico y mar del sur abiertos; 14 aguas cerradas sin pintar | 4: Báltico y Perlas abiertos a mano; la bahía redonda de Kaïvan sale al mar por un canal de menos de 9 px | 3: el mar de Sal está cerrado y RNW le abriría un estrecho donde quisiera | **4**: Báltico, Perlas y la bahía de Kaïvan abiertos por canales de 9 px o más (`canales.mjs` k=4: 0 bolsas). El mar de Kaïvan queda como lago grande (9.913 px). |
| Lagos tipo Finlandia | 5: campo de ruido alargado NNO-SSE, el más natural | 3: 80 elipses a distancia mínima, regulares | 3: un enjambre denso de elipses | **5**: el campo de ruido del candidato 1 sobre el distrito del candidato 2, con 53 lagos en rosario; 181 lagos pintados en total |
| Circos de montañas | 4: cinco anillos, gruesos y legibles | 3: dos anillos finos; el de Durnhal casi no se lee | 5: anillos gruesos con lago de caldera | **4**: los dos grandes, más gruesos (semiancho de 20), y dos pequeños con lago (el Anillo del Kan y la Caldera Carmesí) |
| Rías e islas | 4: muchos fiordos, demasiado rectos | 4: rías serpenteantes, unas 130 islas | 3: 10 fiordos, pocas islas | **5**: fiordos con ramas en la costa de los Skarren (fondo de 7 px o más) y más islas (161 masas, 0 motas) |
| Interior que controlar | 4 | 3: Kaïvan es un bloque llano | 4 | **4**: el Anillo del Kan y la Caldera rompen los bloques de Kaïvan y de Orunmar |
| Reparto para dos jugadores | 3 | 5: cada continente tiene circo, mar interior, lagos, una tall y estrecho | 3 | **5**: el mismo esquema de candidato 2 |
| Encaje de cada facción | 3: Kaïvan partida por el Báltico; la Marea Negra demasiado grande | 3: Ostrevar es una cinta; Kaïvan y Ostrevar no se tocan; la Liga queda lejos | 3: Thalassar sale grande; Kaïvan pequeña | **4**: Ostrevar y Kaïvan se tocan en el Estrecho de los Cuervos; Ostrevar pasa de 421 a 572 localizaciones; los tamaños siguen la tabla F |
| Cumplimiento del formato | 4: margen de +354; 14 aguas cerradas sin pintar | 4: margen de +278; canal frágil | 3: margen de +310; mar cerrado; fiordos de 11 px | **5**: margen de +455; 0 avisos; 0 lagos sin pintar; 0 lagos abiertos; 0 px en el borde |
| **Total (sobre 45)** | **33** | **34** | **29** | **41** |

**Ganador: el candidato 2.** Además de la nota, es el que prefieren los jugadores (`PETICION.md`, 21-11 01:04): continentes finos y muchas masas. No se ha hecho ningún injerto que engorde los continentes o que junte masas. La tierra baja de 23,4 % a 22,8 % y las masas suben de 133 a 161.

## 2. Qué se injertó y de dónde

1. **Del candidato 1, el distrito de lagos finlandés** (`distritoFinlandes`).
   - Un campo de ruido estirado a lo largo de las estrías glaciares, a 62°, en la elipse de Mil Lagunas (1445,372; radios 300 x 165). Ocupa un 27 % de agua en el núcleo.
   - Los lagos quedan siempre a 6 px o más del mar.
   - Una apertura de 3x3 quita las lenguas de 1-2 px, que se pierden al estirar.
   - Se quitan los lagos de menos de 48 px, y los islotes de menos de 60 px que quedan dentro se convierten en lago.
2. **Del candidato 1, `rompeRectos`** (máximo de 18 px de dibujo, 72 de lienzo).
   - Corre antes de pintar los lagos, para que una cala no abra un lago al mar.
   - Los puentes y los istmos ganan anchura variable y más meandro, para que no tengan orillas paralelas.
3. **De los candidatos 1 y 3, fiordos con ramas** en la costa de los Skarren: 10 + 2 fiordos, con 1 o 2 brazos cada uno y el fondo de al menos 3,4 px de radio.
4. **Del candidato 3, circos gruesos con lago de caldera:**
   - Durnhal y Ankarú pasan de un semiancho de 16 a uno de 20.
   - Se añaden dos nuevos:
     - el **Anillo del Kan** (1500,748; radios 64 x 46), en la estepa de Kaïvan;
     - la **Caldera Carmesí** (1545,1665; radios 66 x 50), en Orunmar.
5. **Una novedad del juez, `cerrarBolsas`:**
   - Si un mar sale al océano por un canal de menos de 7 px, recibe un dique y pasa a ser lago.
   - Así RNW no puede abrir un estrecho al azar si el suavizado cierra el canal.
   - En este mapa le toca al mar de Kaïvan (1299,571): el candidato 2 ya lo pintaba como lago.
6. **Más islas y menos tierra:**
   - Hay más islas en la costa de los Skarren, la de la Liga, la del estrecho, la de Thalassar y la del sureste, y en dos costas nuevas: el este de Orunmar y la costa del alba.
   - La tierra objetivo baja a 22,8 %, para tener más margen y continentes más finos.
7. **Cambios en el reparto (MECANICAS F):**
   - Kaïvan baja a la Marca del Kan (antes `menor-n8`) y Ostrevar se queda la orilla sur del Báltico (antes `menor-n1`). Las dos se miran en el Estrecho de los Cuervos.
   - La semilla de Velathi se mueve a la franja de los bosques.
   - La Liga pasa a −150 y Thalassar a −95, para que salgan «pequeñas».
   - La tierra sin camino por tierra se reparte con las semillas extra y solo con el 30 % de la ventaja, de modo que Kaïvan ya no se queda los islotes de la Liga.

**No se injertó:**
- el mar de Sal cerrado del candidato 3, porque RNW le abriría un estrecho al azar;
- el contorno de polígonos del candidato 1, que da continentes gruesos.

## 3. Cifras de `mide.mjs` (`--area plantilla-rnw.png --location-px 45`)

| Medida | Final | Candidato 2 |
|---|---|---|
| Tierra | **15,9 %** (11,74 llana + 0,73 montañas + 1,86 altas + 1,59 llanura; 15,9 % de 2520 x 2048) | 23,4 % |
| Lagos pintados | **179** (0,86 % del dibujo; el mayor, 9.013 px, es el mar de Kaïvan); 0 sin pintar, 0 charcas, 0 abiertos al mar | 205 (0,93 %) |
| Mares interiores cerrados | 0; `canales.mjs`: 0 bolsas con canales de 7 y de 9 px | 0, pero 1 bolsa de 26.427 px con canal de menos de 9 px |
| Masas de tierra | **160**, 0 motas (la menor, 98 px = 1.568 de lienzo); norte 377.492 px, sur 305.152, Perlas 36.823, cabo de Sorava 16.345 | 133; 434.806 / 356.427 |
| Rugosidad de costa | **58,6** (disco = 3,74) | 52,4 |
| Tramo recto mayor (lienzo) | **96 / 88 / 102 px** (horizontal / vertical / diagonal) | 112 / 144 / 136 |
| Borde | 0 px de tierra en el borde, fuera del área y en la banda de costa; se conserva el 100 % | igual |
| Localizaciones | **6.488 de tierra + 1.672 de mar = 30.235; margen de +965** sobre 31.200 | 30.922; +278 |
| `permille_del_dominio` | **223** (223,4 sin redondear) | 248 |
| Avisos | ninguno | ninguno |
| Reparto | norte 8,35 % del dibujo, sur 7,56 % (corte en el y de 1100 del diseño) | 12,5 / 10,9 |

## 4. Mapa de las facciones (para el guion de asignación)

**Cómo se lee:**
- Coordenadas del dibujo (hoja real): x hacia la derecha (0-2519), y hacia abajo (0-2047). Multiplicadas por 4 dan el lienzo de RNW.
- En `zonas.png`, cada píxel de tierra tiene el `color_rgb` de su zona en `zonas.json`. El mar es (14,36,70), los lagos (150,200,240) y las montañas van más oscuras.
- **Una localización de RNW pertenece a la zona de su píxel central.**
- Las zonas salen de un Dijkstra multiorigen con un coste por terreno: llana 1, llanura 0,85, altas 2,2 y montaña 25. Por eso las cordilleras y el mar hacen de fronteras.
- Lo que no tiene camino por tierra va a la semilla más cercana de su continente (corte en y = 1123 de la hoja real). Las dos tandas de la Marea Negra se asignan a mano.
- «Loc» = píxeles / 125.
- **Ajuste a la hoja real (21-11):** el diseño de 1908 x 2048 se llevó a 2520 x 2048 con escala 0,96 en x y en y y desplazamiento (360, 144). Mismos continentes, facciones, circos, lagos y estrechos; las coordenadas de zonas.json son las del transformado.

`zonas.json` trae además `rasgos`: los circos con sus pasos, el distrito finlandés, los lagos grandes, los mares interiores con sus bocas y el estrecho.

### Norte

| Zona | Tamaño (F) | Semilla (+extra) | Caja x0,y0,x1,y1 | Centroide | % norte | Loc | Mont/Alt/Llan % | Color |
|---|---|---|---|---|---|---|---|---|
| kaivan | grande | 1450,700 (+1010,815) | 870,444,1722,875 | 1349,672 | 28,4 | 1033 | 4,9/11,9/28,4 | 170,49,49 |
| ostrevar (tall) | mediano | 400,655 (+700,815) | 196,462,884,937 | 468,706 | 15,7 | 572 | 1,2/1,6/14,5 | 77,203,114 |
| durnhal | mediano | 885,445 | 707,241,1038,637 | 904,431 | 9,8 | 357 | 11,8/18,5/27,2 | 179,125,217 |
| liga | pequeño | 1420,360 (+1250,385) | 1147,242,1705,540 | 1431,399 | 11,7 | 425 | 1,7/2,2/11,9 | 170,155,49 |
| skarren | pequeño | 330,270 | 173,153,526,491 | 380,317 | 8,7 | 317 | 2/9,8/0 | 77,182,203 |
| hrimval | pequeño | 945,190 | 779,110,1089,295 | 934,197 | 5,1 | 186 | 9,4/53,4/0 | 217,125,175 |
| menor-n2 (cabo gris) | menor | 650,275 | 486,171,810,401 | 631,295 | 7,5 | 275 | 1,5/3,4/0 | 79,170,49 |
| menor-n3 (dedo del NO) | menor | 175,205 | 100,138,258,396 | 185,226 | 1,3 | 48 | 8,3/14/0 | 83,77,203 |
| menor-n4 (cabo de Ostrevar) | menor | 160,705 | 121,595,224,800 | 176,700 | 1,1 | 41 | 0/0/0 | 217,156,125 |
| menor-n5 (paso de la cuenca) | menor | 1020,580 | 1000,337,1204,734 | 1107,543 | 7,8 | 282 | 5,6/10,2/1 | 49,170,125 |
| menor-n6 (costa del alba) | menor | 1690,590 | 1654,324,1772,757 | 1708,560 | 1,6 | 58 | 0/0,4/14,9 | 193,77,203 |
| menor-n7 (cuerno del estrecho) | menor | 1525,925 | 1480,835,1564,998 | 1526,909 | 1,2 | 44 | 0/0/0 | 198,217,125 |

### Sur

| Zona | Tamaño (F) | Semilla (+extra) | Caja x0,y0,x1,y1 | Centroide | % sur | Loc | Mont/Alt/Llan % | Color |
|---|---|---|---|---|---|---|---|---|
| orunmar | grande | 1500,1540 | 1203,1373,1804,1799 | 1522,1595 | 23,2 | 805 | 8,7/22,8/0 | 49,109,170 |
| ankaru (tall) | mediano | 950,1606 | 732,1359,1215,1714 | 1002,1567 | 17,7 | 612 | 10,4/33,7/0 | 125,217,132 |
| velathi | mediano | 520,1530 (+470,1480) | 307,1377,709,1879 | 494,1561 | 11,5 | 399 | 0/0/4,2 | 95,49,170 |
| sorava | mediano | 1010,1250 | 857,1095,1188,1361 | 1026,1251 | 8,1 | 281 | 3,1/3,6/27,7 | 203,77,103 |
| thalassar | pequeño | 340,1780 | 163,1668,627,1958 | 413,1811 | 9,0 | 313 | 0/0/10 | 203,162,77 |
| marea-negra | muy pequeño | 1630,1905 | dos tandas: estrecho (elipse 1000,1000, radios 560 x 75) y sureste (1660,1910, radios 290 x 130) | (no aplica) | 3,5 | 120 | 0/0/0 | 125,217,213 |
| menor-s1 (cabo de Sorava) | menor | 1340,1155 | 1176,1051,1414,1247 | 1270,1155 | 3,6 | 123 | 0/0/0 | 170,49,140 |
| menor-s2 (costa de las Perlas) | menor | 930,1835 | 623,1735,1086,1937 | 867,1829 | 9,4 | 327 | 0/0/0 | 135,203,77 |
| menor-s3 (paso del Ocaso) | menor | 690,1560 | 674,1525,765,1642 | 714,1579 | 1,3 | 45 | 26,5/29/0 | 125,140,217 |
| menor-s5 (norte de Velathi) | menor | 360,1420 | 227,1296,432,1544 | 356,1389 | 1,7 | 58 | 0/0/0 | 170,65,49 |
| menor-s6 (sur de Orunmar) | menor | 1640,1790 | 1514,1589,1832,1838 | 1659,1750 | 5,3 | 182 | 0/0/25,4 | 77,203,130 |
| menor-s7 (marchas de Orunmar) | menor | 1330,1450 | 1143,1365,1425,1608 | 1263,1500 | 5,7 | 198 | 9,4/15,8/0 | 190,125,217 |

**Rasgos que hacen de hogar a cada facción:**

| Facción | Rasgo |
|---|---|
| Durnhal | Circo de Durnhal (885,440), con cuenca y lago |
| Ankarú | Circo de Ankarú (950,1606), con meseta y gran lago |
| Liga | Mil Lagunas (1445,372) |
| Skarren | Fiordos con ramas (300,290) |
| Kaïvan | Estepa, mar-lago (1299,571) y Anillo del Kan (1500,748) |
| Orunmar | Espinazo y Caldera Carmesí (1545,1665) |
| Hrímval | Cabo helado tras el Paso de los Huesos (900,290) |
| Thalassar | Cadena de islas del suroeste |
| Marea Negra | Rosario del estrecho y archipiélago del sureste |
| Velathi | Bosques y rías del oeste del sur |
| Sorava | Costa mercante, con istmo hacia Ankarú |

**Rivalidades de F en este mapa:**
- **Ankarú contra Orunmar:** la Cordillera del Sol, con un paso ancho.
- **Kaïvan contra Ostrevar:** el Estrecho de los Cuervos (850,815 a 950,905).
- **Liga contra Skarren:** por mar, en la costa norte.
- **Hrímval:** el istmo al norte de Durnhal.
- **Sorava contra la Liga:** sigue sin estar dibujada. La Liga llega al estrecho solo rodeando la costa este. Lo que se propone es tratar `menor-n7`, el cuerno del estrecho, como factoría o vasallo de la Liga en el guion.

## 5. Importarlo en RNW y generar el mundo (lo hace el jugador; FORMATO-PNG.md §5)

1. Cerrar el juego. Tener 8 GB de RAM libres. Desactivar el hub de RNW en el playset (`RNW.md` §0).
2. Abrir «Random New World Generator» y elegir el tipo **Continents** (no The Wall ni Omerika). La expansión de océanos («expand_oceans») tiene que estar activa.
3. **Comprobar el tamaño y el área antes de importar.**
   - Pulsar **«Land editor…»**. La primera vez tarda unos segundos.
   - Mirar en gris claro dónde cae el área.
   - Con **«Save the drawing…»** se guarda la hoja vacía, que da la anchura real.
   - Si la hoja no tiene la proporción de 2520/2048 (±10 %), hay que regenerar el dibujo a la anchura buena: cambiar `W` en `genera.mjs`.
   - La plantilla real ya está en `plantilla-rnw.png` (2520 x 2048): `node mide.mjs final/mascara.png --area final/plantilla-rnw.png --location-px 45` da el aviso vacío.
4. **Importar.** Hay dos vías:
   - **la mejor:** «Use a picture as it is…», con `mascara.png` a 2048 de alto (ya lo está), que conserva los fiordos y los lagos pequeños;
   - **o** en el editor, **«Import a picture…»**: si la anchura difiere, avisa con «The picture was stretched to the sheet.».
5. **Leer el panel «What the generator will do».** Comprobar:
   - «Land is x % of the sheet», que debería dar unos 15-16 %;
   - que se descarta un 0 % (fuera del área o en la banda);
   - 0 piezas menores que la isla mínima;
   - **0 lagos abiertos al mar**.

   Si dice «Almost all of the land lies outside the area…», el área real no coincide con la estimada y hay que volver al paso 3.
6. Pulsar **«Use this land»**. El World Code lleva la huella del dibujo, pero hace falta el PNG: RNW lo guarda como `land_mask.png` y lo mete en el `.rnworld`, que es lo que se pasa a el jugador B.
7. **Ajustes del panel avanzado:**

   | Ajuste | Valor | Por qué |
   |---|---|---|
   | `location_px` («map») | **45** | |
   | «Land» | **224** | `permille_del_dominio` 223,4, redondeado hacia arriba. |
   | `province_size` | **5-6** | |
   | `sea_zone_px` | **120** | |
   | `min_island_px` | **600** | la isla más pequeña del dibujo es de 98 px, unos 1.568 de lienzo |
   | `centre_permille` | **0** | no tiene efecto con un dibujo |
   | `max_lake_px` | por defecto | |

   Comprobar que no sale «too many locations». Si sale: `location_px` 46, o «Land» 220.
8. Generar. Antes de cambiar de mundo, reiniciar el juego (`RNW.md` §5.8).

## 6. Lo que queda por mejorar

1. **Nada de esto se ha probado en RNW ni en el juego.**
   - La anchura (1908) y el área son estimaciones: falta `mide.mjs --area` con la plantilla real.
   - El margen de +455 queda por debajo del error habitual de la fórmula (unas 600).
2. **Los ríos y el clima no se pintan.**
   - Los pone RNW a partir del relieve.
   - Hay que mirar en el primer mundo si las cordilleras norte-sur dan de verdad un lado húmedo y otro seco.
3. **Ostrevar sigue siendo alargada**, con 572 localizaciones alrededor del Báltico. Ensancharla engordaría el continente.
4. **La rivalidad Sorava-Liga por el estrecho no está en el dibujo.** Ver §4: `menor-n7` como factoría de la Liga.
5. **Algunos menores han quedado muy pequeños:** menor-n4 (41), menor-n7 (44) y menor-s3 (45, el Paso del Ocaso). El guion puede fundirlos o tratarlos como ciudades-estado.
6. **Los pasos y los istmos miden 16-34 px.** Hay que mirarlos en el panel y en la primera salida, porque RNW los suaviza al estirar.
7. **Hay un lago con forma de «>» en la costa de los Skarren** (unos 300,400): es un brazo de fiordo que quedó cerrado. Es legal, pero tiene un aspecto artificial.
8. **Los lagos de Velathi** siguen siendo elipses regulares. El campo finlandés se podría aplicar también allí.
