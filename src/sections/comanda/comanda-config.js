// Configuracion de la pantalla de cocina.

/**
 * Hora limite de despacho: a esta hora salen las rutas y la cocina tiene que
 * tener todo emplatado. El temporizador de la comanda cuenta hacia aqui.
 * Formato 24h "HH:mm".
 */
export const DISPATCH_TIME = '10:00';

/** Minutos antes del despacho en que el contador pasa a ambar: aviso previo. */
export const WARN_MINUTES = 60;

/**
 * Minutos antes del despacho en que el contador pasa a rojo y empieza a pulsar.
 * A los 30 minutos la cocina ya tiene que estar corriendo, asi que ese es el
 * umbral de alarma, no el de aviso.
 */
export const URGENT_MINUTES = 30;
