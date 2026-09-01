// Agrupacion de la comanda por tipo de menu.
//
// Antes el panel de platos filtraba `menuType === 'lunch'` y descartaba todo
// lo demas en silencio: si el API devolvia cenas o desayunos, la cocina nunca
// los veia. Aqui se agrupa por lo que realmente venga, y un tipo desconocido
// se muestra con su propio nombre en vez de desaparecer.

const TYPE_LABEL = {
  lunch: 'Almuerzos',
  dinner: 'Cenas',
  breakfast: 'Desayunos',
  drinks: 'Bebidas',
  snacks: 'Snacks',
};

/** Orden de preparacion en cocina, no alfabetico. */
const TYPE_ORDER = ['breakfast', 'lunch', 'dinner', 'drinks', 'snacks'];

export function typeLabel(menuType) {
  if (!menuType) return 'Otros';
  return TYPE_LABEL[String(menuType).toLowerCase()] || menuType;
}

/**
 * Agrupa una lista de la comanda por menuType.
 * Devuelve [{ type, label, items, total }] en orden de cocina.
 */
export function groupByType(list) {
  if (!Array.isArray(list) || list.length === 0) return [];

  const groups = new Map();

  list.forEach((item) => {
    const type = item?.menuType || 'otros';
    if (!groups.has(type)) groups.set(type, []);
    groups.get(type).push(item);
  });

  return Array.from(groups.entries())
    .map(([type, items]) => ({
      type,
      label: typeLabel(type),
      items,
      total: items.reduce((sum, item) => sum + (Number(item.count) || 0), 0),
    }))
    .sort((a, b) => {
      const ia = TYPE_ORDER.indexOf(a.type);
      const ib = TYPE_ORDER.indexOf(b.type);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
}

/** Total de unidades de una lista completa. */
export function totalUnits(list) {
  if (!Array.isArray(list)) return 0;
  return list.reduce((sum, item) => sum + (Number(item.count) || 0), 0);
}
