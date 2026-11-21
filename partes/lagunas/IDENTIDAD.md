# Identidad: Liga de las Mil Lagunas

- **Nombre:** Liga de las Mil Lagunas. Nombre corto: las Lagunas. Nombre oficial de la Asamblea: «la Liga».
- **Adjetivo:** laguneño, laguneña (cultura `gj_lagunero`, grupo `gj_grupo_lagunas`, lengua `gj_lagunas_language`).
- **Color del país:** azul lago, `rgb 52 138 176` (`gj_lagunas_color_pais`). Segundo color: arena clara, `rgb 225 205 130` (`gj_lagunas_color_pais2`). Color de cultura en el mapa: `rgb 70 160 190` (`map_gj_lagunero`).
- **Estilo:** comerciante, república mercantil (flavor de barqueros, pesas y sellos, hielo y agua).
- **Plantilla de gobierno sugerida:** república, con la reforma `gj_lag_barquero_mayor` desde el arranque (la reforma exige `government = republic`). Sin heredero: el Barquero Mayor se vota por mandatos de 8 años.
- **Religión:** `gj_espiritus_lago`, escuela barqueros (la define otra parte).
- **Tamaño objetivo:** pequeña y muy rica. 14-18 locations, todas pegadas a lagos y ríos; una de ellas, capital y centro de mercado. Poco campo de cultivo, mucha pesca y mucho paño; la riqueza viene del comercio.
- **Rivales:** los Skarren (saqueadores, por el norte y los ríos), y Sorava (comercio, por el estrecho). Amigos naturales: Ostrevar.

## Nombres de reyes (aquí, de Barqueros Mayores)
Los gobernantes de la Liga no son reyes: se eligen de entre los mercaderes. Nombres de la lengua laguneña:
- **Masculinos:** Aldrec, Berenvar, Corvan, Dalmer, Eskarin, Fendrel, Garvo, Halmer, Isvaldo, Jorvan, Kelmar, Lorvic, Merenvil, Nordal.
- **Femeninos:** Aldrena, Berevia, Corlisa, Dalmena, Elvarra, Fenlia, Garvina, Halmira, Isovela, Jorvana, Kelmira, Lorvena.
- **Casas mercantiles:** Aguasclaras, Remoalto, Boyaverde, Pesaldia, Anclaplata, Hielonegro, Velasolas, Cabodeniebla.
- **Para `male_regnal_names` / `female_regnal_names` del país:** los mismos nombres de pila, con números ordinales al estilo de las casas.

## Topónimos propios (15)
1. Lagomadre (capital sugerida, centro de mercado)
2. Puerto Remoalto
3. Boyaverde
4. Cuerdafina
5. Faroalbo
6. Orillarga
7. Juncoazul
8. Cabodeniebla
9. Sellodelago
10. Pesaldia
11. Redesdoradas
12. Anclaplata
13. Hielonegro
14. Velasolas
15. Barcazul

## Mecánica propia (MECANICAS C3)
- **Caminos de hielo:** decisión `gj_lag_abrir_caminos_hielo`. Durante 5 meses el país reduce el coste de cruzar agua helada (`land_cost_on_frozen_water`, que ya existe en el motor) y gana eficiencia de comercio y velocidad de ejércitos. Al cabo, el evento `gj_lagunas.3` («El deshielo traicionero») decide si se pierde algo: retirarse cuesta oro, apurar el cruce es una apuesta.
- **La Asamblea y el Barquero Mayor:** decisión `gj_lag_convocar_asamblea` y eventos `.1` y `.2`. Cada 8 años se elige entre cuatro candidatos (mercader, armador, tejedora, juez), y cada uno da un modificador distinto al país.
- **Escoltas o tributo frente a los Skarren:** decisión `gj_lag_pagar_escoltas` y evento `.4`.
- **La Gran Subasta del Estrecho** (rival: Sorava): decisión `gj_lag_gran_subasta_estrecho`; solo con un Barquero Mayor mercader.
- **Mercado Flotante:** edificio propio (ver `RESUMEN.md`).
