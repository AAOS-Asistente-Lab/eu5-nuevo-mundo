# IDENTIDAD: Sorava (clave `sorava`)

## Nombre y adjetivo
- Nombre del país: **Concejo de las Balanzas de Sorava** (forma corta: **Sorava**).
- Adjetivo: **soravi** (plural «soravíes»). Cultura `gj_soravi`, grupo `gj_grupo_sorava`, lengua `gj_sorava_language` (dialecto `gj_soravi_dialect`).
- Religión: `gj_pacto_balanza` (la define su propia parte).
- Estilo: comerciante, de especias y perlas. Rival de la Liga de las Mil Lagunas por el estrecho; vecina de la Hermandad de la Marea Negra, que comparte su grupo cultural.

## Color
- Color del país: turquesa, RGB 28 150 160.
- Color secundario: ámbar, RGB 214 160 48.
- En el mapa de culturas, la cultura usa `map_gj_soravi` (28 150 160) y la lengua `map_gj_sorava_lengua` (214 160 48), ya definidos en `named_colors`.

## Nombres de gobernantes
No hay corona: manda un **Pesador Mayor** (o **Pesadora Mayor**), elegido por las diez Casas.
- Masculinos: Aurelmo, Baldaq, Casimbro, Dorvel, Eldran, Fabrel, Garson, Hanquil, Iselmo, Jorvan, Kelmar, Lucain, Marzel, Nadrel, Orvaz, Pelmiro, Quirvo, Rasel, Savriel, Tomaz, Ulmaro, Valdres, Yaquel, Zeldor.
- Femeninos: Aldaria, Berenza, Cirvela, Dalmira, Eslavina, Fiorela, Garnelia, Halquira, Isome, Jaspelina, Kerinda, Lorvena, Marisel, Nerelda, Orsala, Pervinca, Quenara, Rosmelda, Sevaria, Talvena, Urdelia, Velisa, Zarina.
- Casas (apellidos): Valtoro, Mirquel, Anselmar, Quirasa, Dovrenti, Salveri, Torrigal, Belmari, Cadrenza, Orquesta, Vendimar, Tarsolo.

## Topónimos propios (13)
Sorimar (capital), Laquena, Tarsala, Ondaluz, Perlaviva, Vendrel, Zirasal, Dulmaren, Ozaquel, Taveluz, Harmaz, Brumalta, Cerrasol.

## Tamaño objetivo
**Mediana y rica** (MECANICAS F): entre **60 y 75 locations**, con unas 20-25 de costa y puerto. Costa recortada con entrantes y ensenadas, y la franja de perlas en su litoral; un interior corto de colinas con especias, atravesado por ríos. Que tenga **dos o tres locations con perlas o pesca** en su costa (para el Banco de Perlas) y **al menos una zona de estrecho** (para `gj_zona_estrecho`).

## Recursos y terreno que le cuadran
- Costa: perlas, pesca, sal y sal marina; astilleros con madera y brea de las colinas.
- Colinas cálidas: pimienta, clavo, azafrán, tintes.
- Interior corto: seda y cereal mezclados con rebaños. Pocos metales: es rica por el comercio, no por la mina.

## Rivales y relaciones
- **Rivales:** Liga de las Mil Lagunas (el estrecho) y la Hermandad de la Marea Negra (piratas de su misma cultura).
- **Amigos naturales:** quien compre especias y perlas; Thalassar por el mar, si hay trato.
- **Evento propio contra la Liga:** `gj_sorava.5` y la decisión «Disputar el estrecho».

## Plantilla de gobierno sugerida
República mercante oligárquica: la plantilla base `catholic_republic` del juego como modelo estructural, cambiando religión y cultura. Reforma inicial: `gj_sorava_concejo_de_balanzas`. Sin monarquía ni teocracia.
- Valores sociales: libre comercio y plutocracia.
- Estados: los burgueses mandan; la nobleza, de segunda fila.
- Tecnología de arranque: cercana a la europea (MECANICAS I).
