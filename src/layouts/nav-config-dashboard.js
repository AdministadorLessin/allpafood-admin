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

/** Menu de administracion. */
export const adminNavData = [
  { title: 'Dashboard', path: '/', icon: <SpaceDashboardIcon fontSize="small" /> },
  { title: 'Usuarios', path: '/usuarios', icon: <PeopleIcon fontSize="small" /> },
  { title: 'Planes', path: '/planes', icon: <LoyaltyIcon fontSize="small" /> },
  { title: 'Menus', path: '/menu', icon: <RestaurantMenuIcon fontSize="small" /> },
  { title: 'Programar', path: '/programar', icon: <DateRangeIcon fontSize="small" /> },
  { title: 'Motorizados', path: '/motorizados', icon: <MopedIcon fontSize="small" /> },
  { title: 'Rutas del dia', path: '/rutas', icon: <RouteIcon fontSize="small" /> },
  { title: 'Asignar rutas', path: '/asignar-rutas', icon: <RouteIcon fontSize="small" /> },
  { title: 'Comanda', path: '/comanda', icon: <ContentPasteIcon fontSize="small" /> },
];

/** Menu del motorizado (rol DELIVERY). */
export const deliveryNavData = [
  { title: 'Ver mis rutas', path: '/motorizado', icon: <RouteIcon fontSize="small" /> },
];

/** Devuelve el menu que corresponde al rol. */
export function getNavData(role) {
  return role === 'DELIVERY' ? deliveryNavData : adminNavData;
}
