/**
 * Configuracion del panel que no vive en el codigo.
 *
 * La llave de Google Maps estaba escrita a mano en tres archivos de aqui y
 * seis del app. Rotarla —algo que toca hacer si se filtra, o si se cambia de
 * proyecto en Google— significaba encontrar los nueve sitios sin olvidar
 * ninguno, y el olvidado es justo el que sigue cobrando.
 *
 * Se puede cambiar sin tocar codigo poniendo REACT_APP_MAPS_KEY antes de
 * compilar.
 *
 * El mapId va aparte porque pertenece al mismo proyecto de Google: si cambia
 * la llave, este tambien cambia.
 */
export const MAPS_KEY =
  process.env.REACT_APP_MAPS_KEY || 'AIzaSyBtKeD-JuzJdX7HvLrxzBPkuTPrB7EgtUk';

export const MAPS_ID = process.env.REACT_APP_MAPS_ID || 'e151d2a33166c8baa4ff73ee';
