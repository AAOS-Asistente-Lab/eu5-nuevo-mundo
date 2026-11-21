// Agrupa por parte la salida de comprueba-mod.mjs y escribe eu5-mundo/FALLOS-PARTES.md:
// cuantos textos faltan (resumido) y, uno a uno, los demas errores. Lo generado por la
// integracion (gj_integracion_*) va aparte: tiene que salir vacio.
// Uso: node resume-errores.mjs <salida-del-comprobador.log> [--partes <carpeta>] [--informe <fichero>]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { listaFicheros } from './pdx.mjs';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const arg = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const LOG = args[0];
if (!LOG || !fs.existsSync(LOG)) { console.error('uso: node resume-errores.mjs <log del comprobador>'); process.exit(2); }
const PARTES = path.resolve(arg('--partes', path.join(AQUI, '..', 'partes')));
const INFORME = path.resolve(arg('--informe', path.join(AQUI, '..', 'FALLOS-PARTES.md')));

// fichero del mod -> parte, por la ruta que trae cada parte
const deParte = new Map();
const partes = fs.readdirSync(PARTES, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
const conTextos = new Set();
for (const p of partes) for (const f of listaFicheros(path.join(PARTES, p))) {
  const r = path.relative(path.join(PARTES, p), f).split(path.sep).join('/');
  deParte.set(r, p);
  if (/_l_spanish\.yml$/.test(r)) conTextos.add(p);
}
const grupos = new Map();
const add = (p, tipo, linea) => { if (!grupos.has(p)) grupos.set(p, { textos: 0, otros: [] }); const g = grupos.get(p); if (tipo === 't') g.textos++; else g.otros.push(linea); };
const lineas = fs.readFileSync(LOG, 'utf8').split('\n').filter((l) => l.startsWith('ERROR '));
for (const l of lineas) {
  const m = l.match(/^ERROR ([^:]+?)(?::(\d+))?: (.*)$/);
  if (!m) continue;
  const [, r, n, msg] = m;
  const p = /gj_integracion_/.test(r) ? '(integracion)' : (deParte.get(r) || '(sin parte)');
  const texto = /falta la localizacion|esta en (spanish|english) y no en/.test(msg);
  add(p, texto ? 't' : 'o', `\`${r}${n ? ':' + n : ''}\`: ${msg}`);
}
const orden = [...grupos.keys()].sort((a, b) => (a.startsWith('(') ? -1 : 0) - (b.startsWith('(') ? -1 : 0) || a.localeCompare(b));
const md = `# Fallos por parte

Del comprobador (\`comprueba-mod.mjs\`) sobre el mod fundido. ${lineas.length} errores en total. Los textos que faltan se cuentan; el resto, uno a uno.

**Para comprobar una sola parte** (funde todas en una carpeta temporal propia y enseña solo los errores de esa parte; sale con 0 si pasa):
\`\`\`
node herramientas/comprueba-parte.mjs <clave>
\`\`\`
\`<clave>\` es el nombre de la carpeta en \`eu5-mundo/partes/\` (por ejemplo \`ostrevar\`). Con \`--avisos\` enseña también los avisos. Tarda menos de un minuto.

Lo mecánico ya lo arregla la integración al fundir, así que no hace falta tocarlo en la parte: ganchos del juego con \`INJECT:\` o \`effect\` directo, nombres de lengua sin texto o con tildes, e iconos de avance que no existen. Los \`STATIC_MODIFIER_DESC_\` y \`AUTO_MODIFIER_DESC_\` son opcionales, como en el juego.

${orden.map((p) => {
  const g = grupos.get(p);
  const t = g.textos ? `- Textos que faltan: ${g.textos}${p.startsWith('(') || conTextos.has(p) ? '' : ' (la parte aún no trae localización en castellano)'}.\n` : '';
  return `## ${p}\n${t}${g.otros.map((x) => `- ${x}`).join('\n')}\n`;
}).join('\n')}`;
fs.writeFileSync(INFORME, md, 'utf8');
console.log(`resume-errores: ${lineas.length} errores en ${grupos.size} grupos -> ${path.basename(INFORME)}${grupos.has('(integracion)') ? ' (HAY errores de la integracion)' : ''}`);
