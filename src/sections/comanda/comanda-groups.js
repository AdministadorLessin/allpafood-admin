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

/**
 * Junta el mismo plato aunque venga como almuerzo y como cena.
 *
 * Cada dia ofrece las MISMAS tres opciones para almuerzo y para cena, y en la
 * base cada una es una fila distinta de tbl_menu_type apuntando al mismo plato.
 * La comanda las mostraba separadas, asi que la cocina leia "51" y "8" del
 * guiso de pallares y tenia que sumarlos de cabeza para saber cuanto cocinar.
 * Lo que se cocina es una olla, no dos.
 *
 * Se respeta el orden en que llegan: es el orden en que estan cargadas en el
 * menu del dia, que es de donde sale el numero de opcion del flyer.
 */
export function mergeByDish(list) {
  if (!Array.isArray(list) || list.length === 0) return [];

  const platos = new Map();

  list.forEach((item) => {
    /* Por id del plato, no por nombre: dos platos podrian llamarse igual y
       nada garantiza que el texto venga identico. */
    const clave = item?.menuId ?? item?.menuName;
    const previo = platos.get(clave);

    if (previo) {
      previo.count += Number(item.count) || 0;
      return;
    }

    platos.set(clave, {
      ...item,
      count: Number(item.count) || 0,
      /* El tipo deja de identificar la linea: una linea es un plato. Se
         conserva uno solo para que la clave de React siga siendo estable. */
      menuType: 'plato',
    });
  });

  return Array.from(platos.values());
}
