# Validación de la parte hrimval

Comprobado con scripts de Node y PowerShell sobre los 22 ficheros. El juego no se ha ejecutado: nada está probado en vivo.

## Resultado por punto
| Punto | Resultado |
|---|---|
| 1. Llaves | OK en los 18 `.txt` (sin comentarios ni cadenas). Total: 628 aperturas = 628 cierres, y ninguno baja de cero. |
| 2. Localización | UTF-8 con BOM (`EF BB BF`), empieza por `l_spanish:`, sin duplicados ni líneas rotas. Faltaban 5 claves (arreglado). |
| 3. Etiquetas, ids, prefijos y ficheros | Sin TAG, sin ids de location, sin rutas ni letras de unidad, sin nombres de personas ni de modelos. Todo queda dentro de `partes/hrimval/`. 5 claves sin el prefijo (arreglado). |
| 4. Claves del motor | OK. Se comprobaron todas: 371 claves distintas a la izquierda de `=`; todas existen en el juego base salvo las propias. |
| 5. Cifras de RESUMEN | Cuadran con los ficheros (ver abajo). |
| 6. Equilibrio | Dentro de la regla, con dos observaciones no mecánicas (abajo). |
| 7. Obras ajenas | Sin coincidencias. Los nombres de reyes y los topónimos son inventados. |

## Arreglado
1. **BOM en los `.txt`.** 17 ficheros estaban sin BOM. Los del juego base del mismo tipo lo llevan (avances, edificios, unidades, cultura, grupo, decisiones, desastre, reformas, IO, lengua, familia, on_actions, efectos, triggers, situación, eventos y modificadores estáticos). Se les ha añadido. `gj_hrimval_colores.txt` se queda sin BOM, como el `01_coa.txt` del juego base.
2. **Localización que faltaba.** Los 5 métodos de producción de mantenimiento de los edificios (`gj_hrimval_relicario_mantenimiento`, `..._tumulo_hielo_...`, `..._osario_mayor_...`, `..._atalaya_helada_...`, `..._cripta_cronistas_...`) no tenían texto. Se añadieron al final del `.yml` con la forma del juego base (`"$clave_del_edificio$"`).
3. **Prefijo del contrato.** Se renombraron las claves propias que no llevaban `gj_hrimval_`, en todos los ficheros (txt, yml y md):
   - `gj_recoge_caidos` por `gj_hrimval_recoge_caidos` (efecto);
   - `gj_relicario_visto` por `gj_hrimval_relicario_visto` y `gj_deshielo_resuelto` por `gj_hrimval_deshielo_resuelto` (variables);
   - `gj_cultura_insepulta_*` por `gj_hrimval_cultura_insepulta_*` (2 avances de cultura);
   - `gj_mapa_insepulto`, `gj_mapa_lengua_insepulta` y `gj_mapa_familia_insepulta` por `gj_hrimval_mapa_*` (colores).

   Después de renombrar se repitieron todas las comprobaciones: siguen en verde.

## Cifras de RESUMEN, recontadas
- Bonificaciones: **69**. Avances de país, 24 con 47 líneas. Avances de cultura y grupo, 3 con 6. Reformas, 3 con 9. Cultura, 4. Grupo, 3. Llega a la vara de 60-70.
- Avances: 27 (vara 25-30). Edificios: 5. Unidades: 3 con 18 entradas (6 eras). Eventos: 30 con 61 opciones, todos `country_event`; 19 temáticos (vara 15-20). Decisiones: 4. Situación: 1. Desastre: 1. Organización internacional: 1. Todo coincide con RESUMEN.md.

## Se queda sin cambiar (no son fallos mecánicos)
Se dejan para la integración o para la prueba en el juego.
- **Variables y efectos compartidos sin el prefijo `gj_hrimval_`**, a propósito: `gj_caidos`, `gj_noche_reloj`, `gj_noche_meses` y el efecto `gj_noche_blanca_adelanta`. Los usan otras partes, y NECESITA.md y el contrato los nombran. Si la integración prefiere el prefijo, hay que cambiarlos aquí y en las partes que los llaman.
- **Unidades.** Los valores caben en la escala de las unidades únicas del juego base (hay `attrition_loss = -0.50` y `morale_damage_taken = -0.25` en el juego base), pero la regla literal dice «+15-20 % en 1 o 2 valores». Los Acechadores suben 3 valores (velocidad +10 %, flanqueo +15 %, desgaste -50 %), y las Huestes bajan el consumo de comida un 50 % además de la moral. Recorte posible: quitar `flanking_ability` a los Acechadores y el `food_consumption_per_strength` a las Huestes. Se deja a quien lleve el equilibrio, tras la prueba de IA sola.
- **El texto de MECANICAS H dice** «fuera del frío pierden la mitad»; las unidades pierden hasta un 25 % de combate. Es más suave que lo escrito. Decisión de diseño.
- **Edificios.** El Relicario llega a 3 niveles, y los demás hasta 4. No hay un equivalente directo en el juego base con el que medir «un nivel más», y todos llevan límite (capital, uno por país, clima helado o caídos guardados). Medir en partida.
- **`government_reform_slots = 1`** en el último avance (`gj_hrimval_estado_de_vigilia`). Una sola línea, pero es un hueco de reforma extra. Comprobar en el juego que el modificador existe con ese efecto.
- **Pendiente según el autor (sigue vigente):** apuestas de sintaxis sin probar en vivo (`add_pop` en el alcance de la capital, la extensión de las `on_actions` base `yearly_country_pulse`, `on_battle_won` y `on_great_battle_won`, `is_immortal`, `max_levels` en línea); iconos, bandera, misiones propias y pesos de IA.
- **Falsos positivos de la comprobación:** `yearly_gj_hrimval_pulse` y `VALOR` no aparecen en el juego base porque son nuestros (una on_action propia y el parámetro de un efecto).

## Ronda de reparación
- **Comprobador** (herramientas/comprueba-parte.mjs hrimval): al empezar, 1 error y salida 1; al acabar, 1 error y salida 1. 0 textos que faltan; no hay claves ni eventos inexistentes. El error que queda es on_action 'yearly_gj_hrimval_pulse' no existe en el juego y no es nuestro: es el formato de los ganchos (on_actions, INJECT y pulso anual), que reescribe la integración y que esta ronda no toca. Los 78 avisos son textos de edificios, unidades, decisiones y avances que se llaman por herencia o por plantilla y que el comprobador no ve usados; no son fallos.
- **Hecho:** definido el efecto gj_noche_blanca_comienza en gj_hrimval_efectos.txt (pone gj_noche_reloj de la Corte a 100 y la situación arranca sola). Es el que llama escarcha_silente en gj_escarcha_silente_abre_noche. gj_hrimval_recoge_caidos queda como nombre público.
- **Nombres repetidos:** ningún par de BALANCE.md incluye textos de esta parte; se comprobó cada nombre contra la localización de hrimval y no hay coincidencias. Los nombres compartidos con escarcha_silente (la Noche Blanca, «La corte se duerme», «La Vigilia Blanca») son de una misma mecánica y se quedan. Nada que renombrar.
- **Liga:** «Liga de la Sal y la Llama» no se confunde con la escuela de Lagunas porque lleva el nombre completo; se deja.
- **Recortes del revisor:** no se tocaron (disciplina y levas).
- **Sin cambiar, con motivo:** formato de los ganchos (lo reescribe la integración); apuestas de sintaxis sin probar en vivo (dd_pop, is_immortal, government_reform_slots, extensión de on_actions base), porque el juego no se ejecuta; la vida larga del rey (decisión de diseño; BALANCE recomienda +40 o +60, no se toca sin el jugador A).
- **Para la integración:** reescribir el gancho yearly_gj_hrimval_pulse y las llamadas a gj_hrimval_batalla_ganada y gj_hrimval_gran_batalla; quitar gj_recoge_caidos en mundo_contacto (eventos .7 y .9) por gj_hrimval_recoge_caidos.