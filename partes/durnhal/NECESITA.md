# Durnhal: lo que se usa sin definirlo aquí

## Lo que tiene que definir la integración
- **`gj_es_durnhal = yes`** (scripted trigger de país). Lo usan avances, reformas, edificios, unidades, decisiones, desastre, eventos y pulsos.
- **Enganche del pulso anual:** el fichero `common/on_action/gj_durnhal_pulsos.txt` añade `gj_durnhal_pulso_anual` a `yearly_country_pulse` con un bloque que repite el nombre del juego base. **[a probar]** si el motor fusiona los dos bloques o se queda con uno. Si se queda con uno, copiar la línea `gj_durnhal_pulso_anual` dentro del `on_actions` de `yearly_country_pulse` del juego base.
- **Gobierno de arranque:** `republic` (o la plantilla equivalente) y la sugerencia de IDENTIDAD.md.
- **Etiqueta, bandera y escudo** del país (aquí no hay TAG ni coat of arms).
- **Iconos gráficos:** los edificios, las unidades y los modificadores no traen icono propio. Los avances reutilizan iconos de avances del juego base. El desastre reutiliza la ilustración de `revolution_disaster`.
- **Etnicidad de los personajes** de la cultura `gj_durnhali` (aquí se usa la del juego base por defecto).
- **Cualquier `gj_zona_*`:** esta parte no usa ninguno.

## Piezas de otras partes
- **`gj_inquietud_caldera`** (variable global, de Durnhal): la crean y suben las decisiones y los eventos de esta parte (`gj_durnhal_cambia_inquietud`). La lee **mundo_bestias** para despertar al dragón (0-100; el desastre propio empieza en 85 y acaba en 40).
- **Efecto `gj_durnhal_sube_inquietud = { PUNTOS = n }`** (de Durnhal, para otras partes): lo deben llamar llama_profunda (`gj_llama_profunda_sube_inquietud` y `_baja_inquietud`, con `PUNTOS` negativo para bajar, o mejor `gj_durnhal_cambia_inquietud = { valor = -n }`) y mundo_bestias, en lugar de escribir la variable. Nada de esta parte depende de que lo hagan.
- **`gj_dragon_estado`** (mundo_bestias): esta parte **no** la lee. Si se quiere que el dragón despierto empeore el desastre, es cosa de mundo_bestias o de la integración.
- **Religión `gj_llama_profunda`** (parte propia): el «Rito de contención» no comprueba la religión, pero su texto da por hecho que hay clérigos de la Llama.
- **Pacto con el dragón** (llama_profunda): no se usa aquí.

## Cosas del motor a probar en vivo
1. `set_global_variable` con valor calculado (`value = { value = global_var:x add = $valor$ min = 0 max = 100 }`): es la forma de las variables locales del juego base, pero no hay ejemplo con variables globales. Ya no se usan `change_global_variable` ni `clamp_global_variable` (no existen en el juego base).
2. Parámetros de efectos con nombre (`gj_durnhal_cambia_inquietud = { valor = 6 }`): el juego base usa `$parametro$` en minúscula, y esta parte sigue la misma forma.
3. Recetas de los edificios con `allow` dentro de `unique_production_methods`: se sigue la plantilla de los métodos de producción del juego base, pero no hay ejemplo de ese `allow` en edificios únicos.
4. `max_levels` por era, con `owner ?= { current_age_or_later = { age = … } }`: es el mismo trigger que usan los avances del juego base, pero en el cálculo del nivel máximo de un edificio es nuevo.
5. `limit` de las unidades con `num_provinces`: igual que la Guardia Suiza Pontificia del juego base.
6. `order_by = population` dentro de `ordered_owned_location` en la decisión «Cavar más hondo».
