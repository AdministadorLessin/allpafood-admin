// Lo que la cocina necesita leer de un vistazo, armado a partir de la comanda
// (conteos por plato y complemento) y del detalle por pedido (el mismo que
// usa el rotulado: opcion, azucar, doble proteina y restricciones).

import { mergeByDish } from './comanda-groups';

const sinTildes = (t) => (t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/* Restricciones reconocidas, con el nombre corto con que se leen en cocina. */
const CATEGORIAS = [
  [/lactosa|lacteo/, 'Sin lactosa'],
  [/gluten/, 'Sin gluten'],
  [/cebolla/, 'Sin cebolla'],
  [/\bajo\b/, 'Sin ajo'],
  [/marisco/, 'Sin mariscos'],
  [/cerdo/, 'Sin cerdo'],
  [/pescado/, 'Sin pescado'],
  [/\bmani\b/, 'Sin maní'],
  [/menestra/, 'Sin menestras'],
  [/picante/, 'Sin picante'],
  [/ajinomoto/, 'Sin ajinomoto'],
  [/huevo/, 'Sin huevo'],
  [/pollo/, 'Sin pollo'],
  [/\bres\b|carne roja/, 'Sin carne roja'],
];

/* Lo que no es para cocina: vacio, "no", "ninguna", notas de entrega. */
const RUIDO = /^(|-|no|ninguna?|ninguno|nada|null|n\/a|na)$/;
const NO_ES_COCINA = /recepcion|dpto|departamento|torre|porter|doble prote/;

/** "Sin lactosa, No cebollas" -> ['Sin lactosa', 'Sin cebolla']. Lo que no se reconoce va tal cual. */
export function etiquetasDeRestriccion(texto) {
  const salida = [];
  (texto || '').split(/[,;/\n]| y /).forEach((trozo) => {
    const k = sinTildes(trozo).replace(/[.]/g, '').trim();
    if (RUIDO.test(k) || NO_ES_COCINA.test(k)) return;
    const agregar = (t) => { if (!salida.includes(t)) salida.push(t); };
    if (/bastante aji|extra aji|mas aji|con aji/.test(k)) { agregar('Extra ají'); return; }
    /* "Desayuno inc" = lleva desayuno incluido: cocina lo tiene que armar. */
    if (/desayuno/.test(k)) agregar('Con desayuno');
    if (/snack/.test(k)) agregar('Con snack');
    if (/desayuno|snack/.test(k)) return;
    const hallados = CATEGORIAS.filter(([re]) => re.test(k)).map(([, nombre]) => nombre);
    if (hallados.length) hallados.forEach((h) => { if (!salida.includes(h)) salida.push(h); });
    else {
      const limpio = trozo.trim();
      if (limpio) salida.push(limpio.charAt(0).toUpperCase() + limpio.slice(1).toLowerCase());
    }
  });
  return salida;
}

const opcionesDe = (pedido) => {
  const m = String(pedido.optionLabel || '').match(/\d+/g);
  return m ? m.map(Number) : [];
};

const nombreCorto = (n, a) => {
  const nombre = (n || '').trim().split(/\s+/)[0] || '';
  const inicial = (a || '').trim().charAt(0).toUpperCase();
  const cap = nombre ? nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase() : 'Cliente';
  return inicial ? `${cap} ${inicial}.` : cap;
};

const pideDoble = (p) => p.doubleProtein === 'Sí' || /doble prote/.test(sinTildes(p.alimentsRestrictions));

export function armarCocina(comanda, detalle) {
  const pedidos = Array.isArray(detalle) ? detalle : [];

  // Platos: una linea por olla, con cuantos van con doble proteina y cuantos con restriccion.
  const platos = mergeByDish(comanda?.general || []).map((p, i) => ({
    op: i + 1, nombre: String(p.menuName || '').replace(/\s+/g, ' ').replace(/\.$/, ''), cantidad: p.count,
    doble: 0, conRestriccion: 0,
  }));
  const porOp = (op) => platos.find((p) => p.op === op);

  const filas = [];
  pedidos.forEach((p) => {
    const ops = opcionesDe(p);
    if (pideDoble(p)) ops.forEach((op) => { const pl = porOp(op); if (pl) pl.doble += 1; });

    const tags = etiquetasDeRestriccion(p.alimentsRestrictions);
    if (!tags.length) return;
    [...new Set(ops)].forEach((op) => {
      const pl = porOp(op); if (pl) pl.conRestriccion += 1;
      filas.push({ op, nombre: nombreCorto(p.clientName, p.clientLastname), veces: ops.filter((x) => x === op).length, tags });
    });
  });
  filas.sort((a, b) => a.op - b.op || a.nombre.localeCompare(b.nombre, 'es'));

  // Bebidas: una por plato. Las de los clientes sin azucar se cuentan aparte.
  const complementos = comanda?.complements || [];
  const bebidas = complementos.filter((c) => c.menuType === 'drinks');
  const totalBebidas = bebidas.reduce((s, b) => s + (Number(b.count) || 0), 0);
  const sinAzucar = pedidos.filter((p) => p.sugar === 'No')
    .reduce((s, p) => s + Math.max(opcionesDe(p).length, 1), 0);

  const otros = complementos.filter((c) => c.menuType !== 'drinks');

  return {
    platos,
    totalPlatos: platos.reduce((s, p) => s + p.cantidad, 0),
    bebidas: bebidas.map((b) => ({ nombre: b.menuName, cantidad: Number(b.count) || 0 })),
    totalBebidas,
    sinAzucar: Math.min(sinAzucar, totalBebidas),
    otros: otros.map((c) => ({ tipo: c.menuType, nombre: c.menuName, cantidad: Number(c.count) || 0 })),
    restricciones: filas,
    clientesConRestriccion: new Set(filas.map((f) => f.nombre + f.tags.join())).size,
  };
}
