// Estado real del plan de un usuario.
//
// Un plan se agota de dos maneras, y operativamente NO son lo mismo:
//   - por fecha    -> se le acaba el tiempo
//   - por consumo  -> se come todos sus envios, aunque le quede calendario
//
// Cada una tiene su aviso previo, para poder contactar al cliente antes de
// que se quede sin servicio:
//   Vigente -> Por vencer / Por agotarse -> Vencido / Agotado

import { daysUntil } from './user-date';

/** Dias antes del vencimiento en que un plan pasa a "por vencer". */
export const SOON_DAYS = 3;

/** Envios restantes a partir de los cuales un plan esta "por agotarse". */
export const SOON_ORDERS = 3;

export const TONE = {
  none: 'none',
  expired: 'expired',
  exhausted: 'exhausted',
  soon: 'soon',
  exhausting: 'exhausting',
  ok: 'ok',
};

/** Envios que le quedan al usuario. null si el plan no trae consumo. */
export function remainingOrders(row) {
  const used = Number(row?.consumedCount);
  const total = Number(row?.consumedTotal);
  if (!Number.isFinite(used) || !Number.isFinite(total) || total <= 0) return null;
  return Math.max(total - used, 0);
}

/** true si el usuario ya consumio todos los envios de su plan. */
export function isExhausted(row) {
  return remainingOrders(row) === 0;
}

/**
 * Estado del plan combinando fecha y consumo.
 *
 * Precedencia: sin plan -> vencido por fecha -> agotado -> por vencer (fecha)
 * -> por agotarse (consumo) -> vigente.
 *
 * La fecha va antes que el consumo porque es el limite duro: un plan cuya
 * fecha ya paso no se renueva igual que uno al que solo le quedan envios.
 */
export function planStatus(row) {
  if (!row?.plan) return TONE.none;

  const days = daysUntil(row.expira);
  const remaining = remainingOrders(row);

  if (days !== null && days < 0) return TONE.expired;
  if (remaining === 0) return TONE.exhausted;
  if (days !== null && days <= SOON_DAYS) return TONE.soon;
  if (remaining !== null && remaining <= SOON_ORDERS) return TONE.exhausting;
  if (days === null) return TONE.none;

  return TONE.ok;
}

/** Los estados que ameritan contactar al cliente para renovar. */
export function needsRenewal(row) {
  const tone = planStatus(row);
  return tone === TONE.soon || tone === TONE.exhausting;
}
