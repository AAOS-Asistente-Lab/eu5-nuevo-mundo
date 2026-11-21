# VALIDACION: Thalassar (21-11)

Validación estática contra `CONTRATO-PARTES.md` (secciones 2, 3, 4, 7 y 8). No se ha ejecutado el juego: todo lo vivo sigue `NOT_TESTED`.

## Resultado: ARREGLADO (3 fallos mecánicos corregidos, 0 de bloqueo)

| # | Comprobación | Resultado |
|---|---|---|
| 1 | Llaves `{ }` en los 17 `.txt` (sin comentarios ni cadenas) | OK, equilibradas en todos |
| 2 | Localización: cada clave visible tiene texto | OK: 323 claves, 0 duplicadas, 0 faltan (avances, reformas, edificios, unidades, familias, cultura, grupo, lengua, desastre, decisiones `.title/.desc`, 29 modificadores `STATIC_MODIFIER_NAME_`, 30 eventos con título, descripción y opciones). Sin uso: `gj_thalassar_nombre` (nombre de trabajo, declarado en NECESITA) |
| 2b | `.yml` en UTF-8 con BOM (`EF BB BF`) y primera línea `l_spanish:` | OK |
| 2c | BOM de los `.txt` | **FALLO ARREGLADO**: los 17 iban sin BOM; en el juego base el 100 % de los `.txt` de estos tipos lo llevan. Añadido a los 17 |
| 3 | TAGs, ids de location, rutas de disco, `fil<ruta>`, nombres de modelos | OK: 0 en todo (solo coinciden siglas de documentación: BOM, ERA, RGO, TAG, UTF) |
| 3b | Prefijo `gj_` y nada fuera de la carpeta | OK: 21 ficheros, todos bajo `partes/thalassar/`. Las claves propias son `gj_thalassar_*`, `gj_talasio_*`, `gj_grupo_talasio`, `gj_thal_*` (modificadores) y las unidades `n_/a_gj_thalassar_*`. Los colores `map_gj_*` están definidos en la parte |
| 3c | Texto mal codificado | **FALLO ARREGLADO**: la cabecera de `gj_thalassar_eventos.txt` tenía las comillas «» dobles codificadas (mojibake, solo en comentario). Corregido |
| 4 | Claves del motor en el juego base | OK. Pasada completa: todos los identificadores sin prefijo propio existen como token en `G` (salvo nombres propios de la lengua y los 4 colores propios). Muestra de 38 claves comprobada fichero a fichero (todas existen): `naval_range_modifier`, `global_pearls_output_modifier`, `navy_light_ship_power`, `navy_galley_power`, `global_port_build_buildings_efficiency`, `global_trade_protection_factor`, `global_non_rural_monthly_development`, `local_fish_output_modifier`, `local_cultural_influence`, `local_trade_center_power`, `local_migration_attraction`, `harbor_suitability`, `monthly_towards_naval`, `societal_value_monthly_move`, `small_trade_sea_efficiency_bonus`, `diplomatic_reputation_mild_bonus`, `small_permanent_target_satisfaction_penalty`, `has_unlocked_government_reform_trigger`, `unlock_government_reform_effect`, `current_age_or_later`, `country_specific_decisions`, `monthly_spawn_chance_low`, `has_any_active_disaster`, `trigger_event_non_silently`, `first_valid`, `an_event_occurs_tt`, `development_mild_bonus`, `prestige_mild_bonus`, `legitimacy_mild_bonus`, `research_progress_mild_bonus`, `estate_satisfaction_weak_penalty`, `mediterranean_galley_tag`, `greek_gfx`, `age_6_revolutions`; bases de unidad (`n_age_N_light_ship`, `n_age_N_galley`, `a_age_N_heavy_infantry`, N = 1 a 6, las 18, todas en `00_age_templates_*`); `yearly_country_pulse` y `biyearly_country_pulse` (`on_action/country_yearly.txt`, `country_biyearly.txt`); imagen del desastre `decline_of_mali_disaster.dds` existe en `main_menu/gfx/interface/illustrations/disaster/`. El formato de `limit = N` en unit_families lo admite el readme (`<value calculations> / <default_value>`) |
| 5 | Cifras de RESUMEN vs ficheros | Cuadran: 24 + 3 avances, 3 reformas, 15 edificios, 18 unidades, 30 eventos, 8 decisiones, 1 desastre, 29 modificadores con nombre. **Bonificaciones: 73, por encima de la vara 60-70** (ver abajo) |
| 6 | Equilibrio (MECANICAS H, sección 7) | Unidades OK (ver abajo). Edificios: 2 valores pasaban el tope, **ARREGLADOS** |
| 7 | Obras ajenas | OK: 0 coincidencias con Tolkien, Anbennar, Juego de Tronos, Warcraft, Elder Scrolls y similares; nombres y topónimos originales |

## Arreglos hechos (todos mecánicos, solo dentro de `partes/thalassar/`)
1. **BOM en los 17 `.txt`** (como el juego base) y comillas «» de la cabecera de eventos.
2. **Bonificaciones 73 a 70** (vara: 60-70, contando avances de país y de cultura, reformas, cultura y grupo; sin eventos ni edificios ni modificadores con nombre). Se quitaron las tres líneas que ya proponía RESUMEN:
   - `global_nobles_estate_power = 0.05` de la reforma «La Corona Emergida»;
   - `naval_damage_taken = -0.05` del avance «Bastiones de Coral»;
   - `global_population_growth = 0.001` del avance «Medicina del Agua».
   Recuento final con script: 52 en avances (46 de país + 6 de cultura), 12 en reformas, 4 en la cultura, 2 en el grupo = **70**. `RESUMEN.md` actualizado. Las 5 líneas de demanda de bienes del grupo no cuentan.
3. **Edificios que pasaban el tope** («como mucho un nivel mejor que el equivalente del juego base»):
   - Arsenal Sumergido III: `local_ship_build_speed` 0,4 a 0,33 (el máximo del base es 0,33);
   - Jardín de Perlas II y III: `local_fish_output_modifier` 0,15 y 0,2 a 0,125 y 0,15 (el máximo del base es 0,15).

## Equilibrio de unidades (comprobado contra las plantillas base)
- Nave de Marea: velocidad +15 % exacto en las 6 eras; casco y artillería por debajo del base en todas (peor), tripulación +20 %. Dentro del tope.
- Galera de Cristal: artillería entre +12 % y +17 % según era, velocidad -0,25 en eras 1 a 3, tripulación +30 % (debilidad). Dentro del tope (+15-20 % en 1 o 2 valores).
- Guardia de Marea: -10 % de daño recibido y -5 % de daño hecho, +10 % en costa y -10 % tierra adentro. Con debilidad y sin ataque extra.
- Las 3 familias tienen cupo (12, 4 y 10).

## Pendiente (no mecánico, no tocado)
1. **Todo lo vivo es NOT_TESTED** (lo decía el autor): fusión de la clave `on_action` repetida del juego base, varios `unlock_unit` por avance, `limit = N` en familias, `$N$` en scripted triggers con `var:`, imagen reusada del desastre, y los `has_building = building_type:…` del efecto de cosecha. Ninguno es verificable sin el juego.
2. **Ficheros que no se pueden validar aquí y que la integración debe aportar**: `gj_es_thalassar`, `gj_zona_mar_interior`, `religion:gj_mar_dormido`, variable `gj_ruina_atlante_explorada`, variables iniciales, formable, iconos, imagen, bandera y TAG (lista completa en `NECESITA.md`).
3. **Sin situación formal** (MECANICAS la pedía): decisión de diseño documentada en RESUMEN; queda para el jugador A si quiere envolverla.
4. **Faro de Marea III**: lleva `max_ships_built_at_same_time = 1` aunque su propósito es el puerto; revisar en vivo si el motor lo acepta en un edificio que no es astillero.
5. **Eventos temáticos: 20** (vara 15-20): en el techo; no se amplían.
6. **Mojibake de ejemplo**: se revisó solo el texto de los 21 ficheros; no se ha comprobado cómo muestra el juego los acentos en tipografía propia.
7. Las constantes `small_permanent_target_satisfaction_penalty` y similares existen en el base, pero no se verificó que su valor sea coherente con el uso (solo existencia).

## Ronda de reparación (21-11)
- Comprobador de la integración: antes 1 error (`has_variable = gj_ruina_atlante_explorada` sin ningún `set_variable`); ahora **PASA, 0 errores, salida 0** (104 avisos, todos de textos aún sin uso por scripts de la integración).
- Variable `gj_ruina_atlante_explorada`: ya no depende de `mundo_ruinas`. La fija la opción a) del evento `gj_thalassar.3` (El buzo de las ruinas), con su texto ajustado. La alternativa de la fase 3 funciona dentro de la parte.
- Nombre repetido con lagunas: el avance `gj_thalassar_diques_y_esclusas` se muestra ahora como «Malecones del Reflujo» (la clave no cambia).
- Unidades navales: no se han tocado (ya son sumas sobre la plantilla). Ganchos de on_action y recortes del revisor: intactos.
- Queda (no depende de la parte): probar en vivo el Faro de Marea III (`max_ships_built_at_same_time`), la fusión de `yearly_country_pulse`, la situación formal (decisión de el jugador A) y los triggers/religión que aporta la integración (`gj_es_thalassar`, `gj_zona_mar_interior`, `religion:gj_mar_dormido`).