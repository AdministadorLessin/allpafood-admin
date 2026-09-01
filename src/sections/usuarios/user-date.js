// Lectura tolerante de las fechas del API. No sabemos con certeza en que
// formato llega planExpirationDate, asi que se prueban los formatos habituales
// y, si ninguno encaja, se devuelve null: la fila queda como "sin fecha"
// en vez de mostrar un dato equivocado.

import moment from 'moment';

const FORMATS = [
  moment.ISO_8601,
  'YYYY-MM-DD',
  'YYYY-MM-DDTHH:mm:ss',
  'DD/MM/YYYY',
  'DD-MM-YYYY',
  'MM/DD/YYYY',
];

export function parseDate(value) {
  if (!value) return null;
  const parsed = moment(value, FORMATS, true);
  return parsed.isValid() ? parsed : null;
}

/** Dias que faltan para la fecha. null si no se pudo leer. */
export function daysUntil(value) {
  const parsed = parseDate(value);
  if (!parsed) return null;
  return parsed.startOf('day').diff(moment().startOf('day'), 'days');
}

/** Fecha legible, o un guion si no hay dato. */
export function formatDate(value) {
  const parsed = parseDate(value);
  return parsed ? parsed.format('DD MMM YYYY') : '—';
}

// El estado del plan (fecha + consumo) vive en user-status.js
