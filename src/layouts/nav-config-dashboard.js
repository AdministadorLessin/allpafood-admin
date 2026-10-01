// Navegacion como datos, no como JSX repetido.
// Patron tomado de Material Kit (layouts/nav-config-dashboard.tsx): antes cada
// item era un <MenuItem> escrito a mano, siete veces casi identicos.
//
// Agregar una seccion ahora es agregar un objeto a esta lista.

import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import PeopleIcon from '@mui/icons-material/People';
import LoyaltyIcon from '@mui/icons-material/Loyalty';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import DateRangeIcon from '@mui/icons-material/DateRange';
import MopedIcon from '@mui/icons-material/Moped';
import RouteIcon from '@mui/icons-material/Route';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import PaidIcon from '@mui/icons-material/Paid';
import MapIcon from '@mui/icons-material/Map';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BusinessIcon from '@mui/icons-material/Business';
import StyleIcon from '@mui/icons-material/Style';

/**
 * Menu de administracion.
 *
 * Cada seccion declara quien la ve. El panel lo usa un CEO y un coordinador, y
 * no es lo mismo: las ventas, los precios y las cifras del negocio son el
 * ingreso completo de la empresa, y el coordinador no tiene por que verlo para
 * despachar el dia.
 *
 *   ambos  operacion del dia: usuarios, comanda, rutas, cobertura, motorizados
 *   ceo    dinero y estrategia: tablero de cifras, ventas, planes, menus
 */
export const adminNavData = [
  { title: 'Dashboard', path: '/', icon: <SpaceDashboardIcon fontSize="small" />, soloCeo: true },
  { title: 'Usuarios', path: '/usuarios', icon: <PeopleIcon fontSize="small" /> },
  { title: 'Planes', path: '/planes', icon: <LoyaltyIcon fontSize="small" />, soloCeo: true },
  { title: 'Ventas', path: '/ventas', icon: <PaidIcon fontSize="small" />, soloCeo: true },
  { title: 'Menus', path: '/menu', icon: <RestaurantMenuIcon fontSize="small" />, soloCeo: true },
  { title: 'Programar', path: '/programar', icon: <DateRangeIcon fontSize="small" />, soloCeo: true },
  /* Motorizados salio del menu: crear, editar y desactivar cuentas —incluidas
     las de los motorizados, con sus distritos y su cupo— vive ahora en
     Accesos. Tener dos pantallas para la misma cuenta era la forma segura de
     que los datos se contradijeran. La ruta sigue existiendo por si hace
     falta volver a ella. */
  { title: 'Rutas del dia', path: '/rutas', icon: <RouteIcon fontSize="small" /> },
  { title: 'Cobertura', path: '/cobertura', icon: <MapIcon fontSize="small" /> },
  { title: 'Comanda', path: '/comanda', icon: <ContentPasteIcon fontSize="small" /> },
  { title: 'Empresas', path: '/empresas', icon: <BusinessIcon fontSize="small" />, soloCeo: true },
  { title: 'Tarjetas del app', path: '/tarjetas', icon: <StyleIcon fontSize="small" />, soloCeo: true },
  { title: 'Accesos', path: '/accesos', icon: <AdminPanelSettingsIcon fontSize="small" />, soloCeo: true },
];

/**
 * Menu de la coordinadora de una empresa (rol EMPRESA).
 *
 * Rocio de Hangul entra al mismo panel que el equipo de Allpa, pero no es del
 * equipo de Allpa: ve a los suyos y nada mas. El servidor ademas le filtra su
 * propia empresa, asi que aunque escriba la URL de otra no la obtiene.
 */
export const empresaNavData = [
  { title: 'Mi equipo', path: '/empresas', icon: <BusinessIcon fontSize="small" /> },
];

/** Menu del motorizado (rol DELIVERY). */
export const deliveryNavData = [
  { title: 'Ver mis rutas', path: '/motorizado', icon: <RouteIcon fontSize="small" /> },
];

/** Quien puede entrar a cada ruta del panel, por rol. */
export function puedeVer(role, path) {
  if (role === 'DELIVERY') return deliveryNavData.some((i) => i.path === path);
  if (role === 'EMPRESA') return empresaNavData.some((i) => i.path === path);
  const item = adminNavData.find((i) => i.path === path);
  if (!item) return true;            // pantallas sueltas (fichas, detalles)
  return item.soloCeo ? role === 'ADMIN' : true;
}

/** Devuelve el menu que corresponde al rol. */
export function getNavData(role) {
  if (role === 'DELIVERY') return deliveryNavData;
  if (role === 'EMPRESA') return empresaNavData;
  if (role === 'ADMIN') return adminNavData;
  // Coordinador o vendedor: solo la operacion del dia.
  return adminNavData.filter((i) => !i.soloCeo);
}
