// Traduccion de los valores crudos del API a la etiqueta que ve el cliente.
// Estas tarjetas reflejan lo que se publica en la pasarela y el landing,
// asi que no pueden mostrar "lunch" o "drinks" en una interfaz en espanol.
//
// Si el API agrega un tipo nuevo, se muestra tal cual en vez de romperse.

const BENEFIT_LABEL = {
  lunch: 'Almuerzo',
  dinner: 'Cena',
  breakfast: 'Desayuno',
  drinks: 'Bebidas',
  snacks: 'Snacks',
};

/** Unidad de cada propiedad nutricional. */
const PROPERTY_UNIT = {
  calorias: 'kcal',
  calories: 'kcal',
  carbo: 'g',
  carbohidratos: 'g',
  grasas: 'g',
  proteinas: 'g',
};

export function benefitLabel(value) {
  if (!value) return '';
  return BENEFIT_LABEL[String(value).toLowerCase()] || value;
}

export function propertyUnit(name) {
  if (!name) return '';
  return PROPERTY_UNIT[String(name).toLowerCase()] || '';
}

/** Porcentaje de descuento respecto al precio anterior. null si no aplica. */
export function discountPercent(price, previousPrice) {
  const now = Number(price);
  const before = Number(previousPrice);
  if (!Number.isFinite(now) || !Number.isFinite(before)) return null;
  if (before <= 0 || now >= before) return null;
  return Math.round(((before - now) / before) * 100);
}

export function formatSoles(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '—';
  return `S/${amount.toFixed(2)}`;
}
