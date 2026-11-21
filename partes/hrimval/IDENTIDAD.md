# Identidad: la Corte Insepulta de Hrímval

**Clave:** `hrimval` · **Prefijo:** `gj_` · **Mecánica de MECANICAS:** C6 · **Estilo:** no-muertos, pequeña, remota y peligrosa.

## Nombre y adjetivo
- **Nombre:** Corte Insepulta de Hrímval (forma corta: Hrímval).
- **Adjetivo:** hrimvalí (plural, hrimvalíes). Su gente, los insepultos.
- **Cultura:** `gj_insepulto` («Insepultos») · **Grupo cultural:** `gj_grupo_insepulto` · **Lengua:** `gj_lengua_insepulta` (familia `gj_familia_insepulta`).
- **Religión:** `gj_escarcha_silente` (la define la parte `escarcha_silente`).

## Color
- **Principal:** azul glaciar, RGB 150 196 224.
- **Secundario:** azul pizarra oscuro, RGB 60 80 110.
- **Color de cultura en el mapa político:** `gj_hrimval_mapa_insepulto` (RGB 176 206 226).

## Nombres de reyes (regnales)
- **Masculinos:** Veldrik, Orsmund, Kaldren, Ysbrand, Haldrek, Morvaen, Ithrek, Sorvald, Brenmund, Aldiric, Vyrmund.
- **Femeninos:** Ithra, Velmora, Kaelith, Hrimna, Sennara, Morenna.
- El rey no muere de viejo (ver Relicario): los regnales sirven para las pocas veces que cambia.

## Topónimos propios (13)
1. Hrímval (la capital, un valle de hielo con el relicario)
2. Vyrnholt
3. Paso de los Cuernos
4. Isenvar
5. Daldrune
6. Brezalmar
7. Orsmark
8. Glaciar de Sorrenholt
9. Valle Sepulto
10. Cairn de Kelvarn
11. Lago Gélido
12. Puerto de Ceniza
13. Tajo del Cronista

## Tamaño objetivo
- **De 14 a 20 locations**, todas en clima ártico o subpolar, con capital en un valle helado.
- Pocas ciudades, poca población, mucha guarnición.
- Cualquier tierra fuera del hielo se le deshace (modificador `gj_hrimval_deshielo`).

## Rivales
- **Rivalidad escrita desde el arranque:** la Liga de las Mil Lagunas y los países que formen la Liga de la Sal y la Llama.
- **Vecinos más expuestos:** Kaïvan, Ostrevar y Skarren, por geografía.
- **Para todos:** la amenaza que une o rompe al norte.

## Plantilla de gobierno sugerida
- **Tipo:** monarquía hereditaria, con el rey sin edad.
- **Reforma inicial:** `gj_hrimval_rey_bajo_el_hielo_reforma`.
- **Estamentos relevantes:** nobleza (los oficiales de las Huestes) y clero (los cronistas).
- **Valores iniciales de variables:**
  - `gj_caidos` = 10;
  - `gj_noche_reloj` entre 10 y 30, según la semilla del mundo (para que la primera Noche Blanca no llegue antes del siglo siguiente).
- **Edificio de arranque:** un `gj_hrimval_relicario` en la capital, ya construido.
- **Tecnología inicial:** cercana a la europea (MECANICAS I), con pocos avances de comercio y de ciencia.
- **IA:** que no se expanda. No hay conquista fuera del hielo: el deshielo la castiga (ver NECESITA.md).
