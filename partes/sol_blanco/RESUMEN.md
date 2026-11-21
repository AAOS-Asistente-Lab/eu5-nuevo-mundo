# RESUMEN: sol_blanco (El Sol Blanco)

Religión del sur (la sigue Ankarú). Mecánica del motor: el yanantin (`has_yanantin`), con focos religiosos propios. Cifras contadas sobre los ficheros, no previstas.

## Mecánica
- **Yanantin**: balanza entre lo solar y lo lunar, de -100 a 100. A 0, el motor da prestigio y control (auto-modificador «equilibrado»); inclinado a cualquier lado, da penalizaciones crecientes.
- **Cuatro Hermanos (dioses)**: Iscarel y Tauhuel (solares, bajan el yanantin) y Nauquil y Oseyra (lunares, lo suben). Se eligen 2 aspectos: uno de cada para el equilibrio, o los dos de un lado para un perfil marcado.
- **Rito del Contrapeso** (acción religiosa): ofrece prestigio y recursos a un Hermano y mueve el yanantin 10 puntos. El de base solo sirve para los dioses del culto inti, así que va una copia con los cuatro propios.
- **Festival de las Dos Luces** (acción religiosa, una vez al año): el premio depende del equilibrio. Cerca de 0, prestigio y estabilidad; inclinado al Sol, festival de la Luna; inclinado a la Luna, festival del Sol.
- **8 focos religiosos** con progreso mensual que se acelera cerca del equilibrio. El último, la Concordia de las Dos Luces, exige Calendario, Terrazas y Vigilia.
- **Eclipses y cometas**: `gj_sol_blanco_lee_presagio` (ver NECESITA.md). El eclipse es crisis de legitimidad salvo que se celebre el rito (gratis si se ha completado el foco de la Vigilia) y entonces da una gran bonificación.

## Cifras
| Concepto | Cifra |
|---|---|
| Bonificaciones del contrato (definición 4 + aspectos 8 + focos al completarse 8) | 20 |
| Extra: modificadores de los dioses (espejo de los aspectos) | 8 |
| Extra: modificadores mientras se investiga cada foco | 8 |
| Extra: tipos de lugar sagrado (2 tipos, 8 líneas) | 8 |
| Extra: modificadores temporales de eventos y acciones (14 modificadores, 29 líneas) | 29 |
| Religiones | 1 |
| Dioses | 4 |
| Aspectos elegibles (se eligen 2) | 4 |
| Focos religiosos | 8 |
| Tipos de lugar sagrado (sin locations) | 2 |
| Acciones religiosas | 2 |
| Efectos programados (`lee_presagio` + eclipse + cometa) | 3 |
| On_action propia (+ enganche al pulso anual) | 1 |
| Eventos (26 opciones) | 12 |
| Situaciones, desastres, edificios, unidades | 0 (no los pide la sección de religión) |
| Claves de localización (castellano) | 123 |

Eventos: .1 Sol demasiado alto, .2 Luna hecha sombra, .3 Piedra de las Dos Sombras, .4 Peregrinos, .5 Dos hermanos un altar, .6 Hilado de la Dama de Plata, .7 Primer rayo del zenit, .8 Eclipse, .9 Cometa, .10 Corona de Rayos (una vez, tras la Concordia), .11 Eclipse que no termina, .12 Cosecha de plata y oro.

## Comprobaciones hechas
- Llaves `{` `}` equilibradas en los 10 ficheros de script.
- Las 36 claves de modificador usadas existen en `modifier_type_definitions` del juego base (script de comprobación).
- Las 113 claves de localización que usa el script existen en el .yml; sin duplicadas ni sobrantes.
- Sin letras de unidad, rutas, etiquetas de país ni ids de locations.
- Todos los ficheros en UTF-8 con BOM (como los del juego base).

## NOT_TESTED (no se ha ejecutado el juego)
- Que las acciones religiosas (`generic_actions/`) cuadren con la interfaz sin entradas extra en `messages`: se calcaron de las de inti.
- Que los focos se muestren sin un tipo de modificador propio de avance (no se creó ninguno; se usa solo lo base, la corona, el gobernante y una deriva por equilibrio).
- Que el motor enlace cada aspecto con su dios por el nombre (`worship_<dios>`); se siguió esa convención.
- Que el enganche `yearly_country_pulse` sume en vez de reemplazar.
- Balance: ningún modificador pasa de lo que ya usa el juego base (p. ej. morale 0,1; yanantin 0,5 al mes).

## Falta
- Nada del contrato queda por escribir. Por tiempo no se hicieron los iconos, ni las escuelas (el Sol Blanco no lleva), ni los lugares con locations (los pone la integración).

Ronda de reparación: comprobador en PASA (0 errores, 52 avisos). Eclipse celebrado: legitimidad mensual de +0,25 a +0,1; las cifras de la tabla no cambian (123 claves de localización).
