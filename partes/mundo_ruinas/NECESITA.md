# NECESITA: lo que mundo_ruinas usa sin definirlo

## 1. Triggers de geografia (los define la integración; todos de LOCATION)
Cada uno es verdadero en un conjunto fijo de locations del mapa generado. No hay ids en esta parte.

| Trigger | Cuántas locations | Dónde |
|---|---|---|
| `gj_zona_ruina_atlante` | 4 o 5 | Tierra adentro, lejos de la costa, en lo que será territorio de facciones del sur y los bordes del mar interior |
| `gj_zona_ruina_enana` | 4 o 5 | Montañas y circos, cerca de las zonas de metal del norte |
| `gj_zona_ruina_antigua` | 4 o 5 | Mesetas y selvas de altura: las mezcladas entre norte y sur |
| `gj_zona_veta_fuego` | 1 o 2 | Frontera entre facciones de metal (norte) |
| `gj_zona_veta_marea` | 1 | Costa o isla del mar interior (location de tierra: lleva un edificio) |
| `gj_zona_veta_raiz` | 1 o 2 | Frontera entre facciones del sur |
| `gj_zona_veta_estrella` | 1 | Alta meseta |

Total: de 12 a 16 ruinas y de 5 a 7 vetas, según MECANICAS A1 y A2. Las vetas conviene ponerlas en fronteras entre facciones.
Si dos ruinas o vetas coinciden en una location, no pasa nada grave, pero las ruinas deben estar en locations distintas de las vetas.

## 2. Grupos culturales (los define la parte de cada facción; los usan los triggers de afinidad)
`gj_grupo_talasio`, `gj_grupo_sorava`, `gj_grupo_enano`, `gj_grupo_ostrevari`, `gj_grupo_velathi`, `gj_grupo_solar`.
Afinidad fuerte: talasio con atlantes, enano con enanas, velathi con los Anteriores. Afinidad leve: sorava, ostrevari, solar.

## 3. Del motor (comprobar al integrar)
- `capital = { ... }` como scope de location desde un país (se usa en `gj_ruinas_mueve_art`).
- Cadena de `on_actions`: `yearly_country_pulse` y `on_location_changed_owner` están en el juego base; los ficheros del mod solo añaden `on_actions` hijos.

## 4. Piezas de otras partes que NO se usan hoy (por si se quieren enchufar)
- `mundo_bestias`: la «plaga de bestias» de una ruina despierta (`gj_ruina_plaga_bestias`) es un modificador propio; si esa parte quiere reaccionar, puede mirar `has_location_modifier = gj_ruina_plaga_bestias`.
- Las religiones: «lugar sagrado si la religión lo permite» (A1) no está hecho aquí. Cada religión puede declarar un tipo de lugar sagrado y usar `gj_ruina_es_restaurada = yes` en su `potential`.
- `mundo_contacto`: no se usa nada.
