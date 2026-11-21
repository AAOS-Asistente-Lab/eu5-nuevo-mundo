# Validacion de senda_verde

Resultado: ARREGLADO (1 arreglo mecanico, 0 fallos abiertos mecanicos).

## Comprobaciones
1. Llaves: equilibradas en los 10 .txt (sin comentarios ni cadenas). Abiertas/cerradas: karma 9/9, decisiones 37/37, lugares sagrados 6/6, on_actions 3/3, religion 4/4, aspectos 8/8, efectos 13/13, valores 0/0, eventos 122/122, modificadores 24/24. OK.
2. Localizacion: el .yml empieza por `l_spanish:` y tiene BOM. Los 11 .txt y el .yml llevan BOM (EF BB BF). 88 claves, todas unicas. Claves exigidas por los ficheros: 73 (religion, aspectos, lugares, decisiones, 11 eventos con titulo, descripcion y opciones) mas 15 nombres de modificadores (12 estaticos y 3 de franjas de karma). Faltan 0 y sobran 0. OK.
3. TAG e ids: ninguna etiqueta de pais ni id de location. Ninguna letra de unidad ni ruta. Ningun fichero fuera de `partes/senda_verde/`.
   - ARREGLADO: las variables de enfriamiento se llamaban `gj_sv_cd_*`, sin el prefijo `gj_senda_verde_` del contrato (seccion 3). Se renombraron a `gj_senda_verde_cd_*` (22 usos en eventos y 6 en decisiones). `gj_presagio_tipo` se queda: es el nombre pactado con mundo_bestias.
4. Claves del motor, verificadas contra el juego base (G):
   - Los 34 nombres de modificador numerico usados existen en `modifier_type_definitions/00_modifier_types.txt` (por ejemplo `monthly_karma_decay`, `global_hostile_attrition`, `local_clergy_desired_pop`).
   - Valores de script: `karma_mild_penalty`, `karma_mild_bonus`, `karma_weak_bonus`, `karma_weak_penalty`, `karma_severe_bonus`, `prestige_weak_bonus`, `prestige_mild_bonus`, `stability_weak_penalty`, `stability_weak_bonus`, `legitimacy_weak_bonus`, `legitimacy_weak_penalty`, `legitimacy_mild_bonus`, `estate_satisfaction_*` (en `default_values.txt`).
   - `has_karma`, y las franjas `karma >= -33 / <= 33 / > 33 / < -33` (iguales a las del juego base).
   - `religious_decisions`, `estate_type:clergy_estate`, `burghers_estate`, `nobles_estate`.
   - Vegetaciones `forest` y `woods`.
   - Iconos `religious_aspect_folk_green`, `_yellow`, `_blue` y `_dark_blue`, y las tags `folk_european_gfx pagan_gfx`.
   - Estructura de decisiones (`decision_category`, `potential`, `allow`, `option` con `effect`) y de on_actions (`random_events`, `chance_to_happen`).
   Unas 30 claves distintas comprobadas.
5. Cifras de RESUMEN.md, recontadas: definition_modifier 7 y aspectos 11 (3+3+2+3) dan 18 bonificaciones de religion; franjas de karma 11 (3+4+4); lugares sagrados 8 (4+4); modificadores con nombre 28 en 12; total 65. Aspectos 4, eventos 11, decisiones 3, claves de localizacion 88. Todo coincide.
   Vara de la seccion 7 para religion: 15-20 bonificaciones (18, OK), 2-4 aspectos (4, OK), 1-2 lugares sagrados (2, OK), 8-12 eventos (11, OK), `gj_senda_verde_lee_presagio` (existe, OK), escuelas (ninguna le toca, OK). Dioses o focos: no aplica, porque la mecanica es karma. Se cumple la vara, sin relleno.
6. Equilibrio (MECANICAS H y seccion 7): ningun valor supera los del juego base. Los aspectos usan `stability_cost_efficiency` 0.1 (el base, 0.2), `global_hostile_attrition` 1 (el base de folk_default, 1) y `global_monthly_prosperity` 0.0005 (el base, 0.0005-0.001). Las bonificaciones fuertes de franja van con castigo: el Sueno del Musgo baja la moral y el asedio, y la Savia herida baja la comida, el crecimiento y la legitimidad. La religion lleva `colonial_migration_size_modifier` -0.25 como freno. Los lugares sagrados son moderados. No hay unidades ni edificios. OK.
7. Obras ajenas: sin nombres ni textos de Tolkien, Anbennar, Juego de Tronos, Warcraft u otras. Sin nombres de personas ni de modelos. OK.

## Pendiente (no mecanico, no tocado)
- La opcion `gj_senda_verde.11.a` dice «partan una expedicion de colonos», pero su efecto es solo karma, prestigio y estabilidad. Decision de diseno: dar un efecto de colonizacion o cambiar el texto.
- `color = rgb { 62 128 84 }` en la religion: el juego base usa casi siempre colores con nombre (`map_...`). Solo `folk_african` usa `rgb`; la integracion puede dar un nombre de color si hace falta.
- Lo que ya anotaba el autor en NECESITA.md: grupo `gj_fe_sur`, enganche de `gj_senda_verde_pulse` a un pulso anual de pais, la llamada desde mundo_bestias, las entradas de `holy_sites/` y el icono (arte).
- Nada se ha probado en el juego.

## Ronda de reparación
- Comprobador: 1 error (0 textos que faltan, 1 otros), código de salida 1. El único error es el enganche de gj_senda_verde_pulse a un pulso anual: es el formato de ganchos, que reescribe la integración (ya anotado en NECESITA.md). 13 avisos, todos de claves de lugares sagrados y eventos de decisión que solo usa la integración o el juego.
- Arreglado: la opción gj_senda_verde.11.a prometía colonos y no los daba. Se cambió el texto para que coincida con su efecto (prestigio a costa de karma y estabilidad); no se tocó ningún valor.
- Nombres repetidos: senda_verde no aparece en ningún par de BALANCE.md; nada que renombrar.
- Sin tocar: color gb de la religión (la integración puede dar un nombre si hace falta), ganchos y recortes de equilibrio.