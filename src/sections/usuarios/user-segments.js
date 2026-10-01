// Segmentos de la tabla de usuarios. Responden a la pregunta operativa real
// —"¿a quien tengo que contactar esta semana?"— y filtran en memoria sobre
// los datos ya cargados: no hay llamada nueva al API.

import { planStatus, needsRenewal, TONE, customerStatus, CUSTOMER } from './user-status';

export const SEGMENTS = [
  { value: 'todos', label: 'Todos' },
  { value: 'activos', label: 'Clientes' },
  { value: 'porVencer', label: 'Por vencer' },
  { value: 'vencidos', label: 'Vencidos' },
  { value: 'sinPlan', label: 'Sin compras' },
  // Los que se fueron. Aparte del resto: no son prospectos ni vencidos por
  // renovar, son gente a la que ya no hay que escribirle.
  { value: 'baja', label: 'De baja' },
];

export function matchesSegment(user, segment) {
  /* Quien esta de baja no aparece en ningun otro segmento. Si no, saldria en
     "Por vencer" y terminarias escribiendole a alguien que ya se fue. */
  const deBaja = user.statusNum === 0;
  if (segment === 'baja') return deBaja;
  if (deBaja) return false;

  if (segment === 'todos') return true;
  // "Clientes" es quien alguna vez compro, no quien tiene la cuenta
  // habilitada: con lo segundo el chip contaba a los 37 registrados.
  if (segment === 'activos') return customerStatus(user) === CUSTOMER.customer;
  if (segment === 'sinPlan') return customerStatus(user) === CUSTOMER.prospect;
  // Agrupa los dos avisos previos —se acaba la fecha o se acaban los envios—
  // porque ambos son el mismo movimiento comercial: contactar para renovar.
  if (segment === 'porVencer') return needsRenewal(user);
  // "Vencidos" agrupa las dos formas de terminarse un plan: se acabo la fecha
  // o se acabaron los envios. En ambos casos hay que contactar al cliente.
  if (segment === 'vencidos') {
    const tone = planStatus(user);
    return tone === TONE.expired || tone === TONE.exhausted;
  }
  return true;
}

/** Cuantos usuarios caen en cada segmento, para el contador de los chips. */
export function countBySegment(users) {
  return SEGMENTS.reduce((acc, segment) => {
    acc[segment.value] = users.filter((user) => matchesSegment(user, segment.value)).length;
    return acc;
  }, {});
}
