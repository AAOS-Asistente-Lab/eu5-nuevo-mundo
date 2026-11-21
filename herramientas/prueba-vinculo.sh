#!/usr/bin/env bash
# Bala trazadora sin mundo de RNW: reparte las facciones entre los paises de la America del juego
# base (--vanilla), monta la copia con el vinculo, la comprueba contra ese "mundo" y la
# "instala" en tmp-vinculo/docs, junto a herramientas/ (nunca en Documents).
# NODE=<orden> cambia el node que se usa (por ejemplo, uno con prioridad baja).
set -e
H="$(dirname "$0")"
T="$H/../tmp-vinculo"
NODE="${NODE:-node}"
rm -rf "$T"; mkdir -p "$T/docs"
$NODE "$H/asigna-facciones.mjs" --vanilla --instalar --destino "$T/docs" --informe "$T/VINCULO.md"
echo "== vinculo escrito:"; grep -v '^#' "$T/docs/gj_nuevo_mundo/in_game/common/scripted_triggers/gj_integracion_vinculo.txt" | grep -v '^\s*$' | head -40
