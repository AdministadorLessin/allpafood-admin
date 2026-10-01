// Que pasa cuando la sesion del panel vence.
//
// Hasta ahora, nada: el token moria y cada boton respondia con su propio
// mensaje de error. El 23/09 el coordinador apreto "Avisar salida" y el panel
// le dijo "No pudimos avisar a los clientes"; el servidor nunca vio la
// peticion —la rechazo el filtro por token vencido, un milisegundo despues de
// recibirla— y ese dia ninguna ruta recibio el aviso de salida. Leyendo el
// panel era imposible saberlo: parecia un problema de WhatsApp.
//
// Ahora un 401/403 cierra la sesion y lleva al ingreso diciendo por que.

import axios from 'axios';

const LLAVES = ['aftkn', 'inf'];

export function cerrarSesionPorVencimiento() {
  try { LLAVES.forEach((k) => window.localStorage.removeItem(k)); } catch (e) { /* modo privado */ }
  if (!window.location.pathname.startsWith('/ingresar')) {
    window.location.replace('/ingresar?sesion=vencida');
  }
}

export function vigilarSesion() {
  axios.interceptors.response.use(
    (respuesta) => respuesta,
    (error) => {
      const estado = error?.response?.status;
      const url = String(error?.config?.url || '');
      /* Los endpoints de autenticacion contestan 401 por su cuenta —clave
         equivocada— y ahi el usuario ya esta en la pantalla de ingreso. */
      const esAuth = url.includes('/auth/');
      let habiaSesion = false;
      try { habiaSesion = !!window.localStorage.getItem('aftkn'); } catch (e) { /* modo privado */ }

      if ((estado === 401 || estado === 403) && habiaSesion && !esAuth) {
        cerrarSesionPorVencimiento();
      }
      return Promise.reject(error);
    }
  );
}
